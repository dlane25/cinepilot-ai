import uuid
from datetime import UTC, datetime

import clickhouse_connect

from app.config.settings import settings
from app.core.logging import logger
from app.memory.mcp_client import ClickHouseMcpClient


class ProductionMemoryService:
    """The business logic coordinator for the ClickHouse Production Memory."""

    def __init__(self):
        self.mcp_client = ClickHouseMcpClient()

    def bootstrap_db(self) -> bool:
        """
        Uses clickhouse-connect (isolated direct client) only during server bootstrapping
        to run DDL migrations and ALTER schemas additively.
        """
        if not settings.clickhouse_host:
            logger.warning("[MEMORY SERVICE] ClickHouse host not set. Skipping DDL bootstrap.")
            return False

        logger.info("[MEMORY SERVICE] Bootstrapping ClickHouse Cloud schemas...")
        try:
            client = clickhouse_connect.get_client(
                host=settings.clickhouse_host,
                port=settings.clickhouse_port,
                username=settings.clickhouse_username,
                password=settings.clickhouse_password or "",
                secure=settings.clickhouse_secure,
                database=settings.clickhouse_database
            )

            # DDL 1: production_analysis_runs
            client.command("""
            CREATE TABLE IF NOT EXISTS production_analysis_runs (
                analysis_run_id String,
                production_id String,
                scene_number String,
                started_at DateTime64(3, 'UTC'),
                completed_at DateTime64(3, 'UTC'),
                model String,
                runtime String,
                director_complexity String,
                total_risk_count UInt32,
                total_opportunity_count UInt32,
                projected_savings Decimal(18, 4),
                status String
            ) ENGINE = MergeTree()
            ORDER BY (production_id, scene_number, started_at);
            """)

            # DDL 2: production_risks
            client.command("""
            CREATE TABLE IF NOT EXISTS production_risks (
                risk_id String,
                analysis_run_id String,
                production_id String,
                scene_number String,
                originating_agent String,
                title String,
                description String,
                severity String,
                probability Float64,
                financial_exposure Decimal(18, 4),
                affected_area String,
                mitigation String,
                created_at DateTime64(3, 'UTC')
            ) ENGINE = MergeTree()
            ORDER BY (production_id, scene_number, risk_id);
            """)

            # DDL 3: production_recommendations
            client.command("""
            CREATE TABLE IF NOT EXISTS production_recommendations (
                recommendation_id String,
                analysis_run_id String,
                production_id String,
                scene_number String,
                originating_agent String,
                title String,
                description String,
                recommended_action String,
                projected_savings Decimal(18, 4),
                confidence Float64,
                human_approval_required Boolean,
                approval_state String,
                created_at DateTime64(3, 'UTC')
            ) ENGINE = MergeTree()
            ORDER BY (production_id, scene_number, recommendation_id);
            """)

            # DDL 4: production_decisions (Audit Trail)
            client.command("""
            CREATE TABLE IF NOT EXISTS production_decisions (
                decision_id String,
                recommendation_id String,
                production_id String,
                proposal_id String,
                decision String,
                actor_name String,
                actor_type String,
                previous_state String,
                new_state String,
                originating_agents String,
                projected_savings Decimal(18, 4),
                shooting_days_saved UInt32,
                risks_reduced UInt32,
                decided_at DateTime64(3, 'UTC'),
                notes String
            ) ENGINE = MergeTree()
            ORDER BY (production_id, decided_at, decision_id);
            """)

            # Additive schema evolution columns
            logger.info("[MEMORY SERVICE] Altering production_decisions with any missing audit fields...")
            client.command("ALTER TABLE production_decisions ADD COLUMN IF NOT EXISTS proposal_id String;")
            client.command("ALTER TABLE production_decisions ADD COLUMN IF NOT EXISTS actor_name String;")
            client.command("ALTER TABLE production_decisions ADD COLUMN IF NOT EXISTS actor_type String;")
            client.command("ALTER TABLE production_decisions ADD COLUMN IF NOT EXISTS previous_state String;")
            client.command("ALTER TABLE production_decisions ADD COLUMN IF NOT EXISTS new_state String;")
            client.command("ALTER TABLE production_decisions ADD COLUMN IF NOT EXISTS originating_agents String;")
            client.command("ALTER TABLE production_decisions ADD COLUMN IF NOT EXISTS projected_savings Decimal(18, 4);")
            client.command("ALTER TABLE production_decisions ADD COLUMN IF NOT EXISTS shooting_days_saved UInt32;")
            client.command("ALTER TABLE production_decisions ADD COLUMN IF NOT EXISTS risks_reduced UInt32;")

            logger.info("[MEMORY SERVICE] ClickHouse Cloud schemas bootstrapped and altered successfully.")
            client.close()
            return True
        except Exception as e:
            logger.error(f"[MEMORY SERVICE] Schema DDL bootstrap failed: {e!s}")
            return False

    def _escape(self, val: str) -> str:
        """Saves from simple SQL injections by escaping single quotes."""
        return val.replace("'", "''")

    async def save_analysis_run(self, response_data: dict, started_at: datetime) -> str | None:
        """
        Persists analysis metadata, risks, and recommendations using the official mcp-clickhouse
        run_query tool over stdio transport.
        """
        if not settings.clickhouse_host:
            return None

        analysis_run_id = str(uuid.uuid4())
        production_id = response_data.get("production_id", "unknown")
        scene_number = response_data.get("scene_number", "unknown")
        completed_at = datetime.now(UTC)

        dir_out = response_data.get("director_analysis", {})
        prod_out = response_data.get("producer_analysis", {})

        # 1. Insert analysis run
        run_sql = f"""
        INSERT INTO production_analysis_runs (
            analysis_run_id, production_id, scene_number, started_at, completed_at,
            model, runtime, director_complexity, total_risk_count, total_opportunity_count,
            projected_savings, status
        ) VALUES (
            '{analysis_run_id}',
            '{self._escape(production_id)}',
            '{self._escape(scene_number)}',
            '{started_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}',
            '{completed_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}',
            '{self._escape(settings.gemini_model)}',
            'Python ADK',
            '{self._escape(dir_out.get("scene_complexity", "Medium"))}',
            {len(dir_out.get("risk_observations", []))},
            {len(prod_out.get("optimization_opportunities", []))},
            {float(prod_out.get("potential_savings", 0.0))},
            'Success'
        )
        """
        await self.mcp_client.run_query(run_sql)

        # 2. Insert risks
        for index, risk in enumerate(dir_out.get("risk_observations", [])):
            risk_id = f"risk-{analysis_run_id[:8]}-{index}"
            risk_sql = f"""
            INSERT INTO production_risks (
                risk_id, analysis_run_id, production_id, scene_number, originating_agent,
                title, description, severity, probability, financial_exposure,
                affected_area, mitigation, created_at
            ) VALUES (
                '{risk_id}',
                '{analysis_run_id}',
                '{self._escape(production_id)}',
                '{self._escape(scene_number)}',
                'Director Agent',
                '{self._escape(risk.get("title", ""))}',
                '{self._escape(risk.get("description", ""))}',
                '{self._escape(risk.get("severity", "Medium"))}',
                {float(risk.get("probability", 0.0))},
                {float(risk.get("financial_exposure", 0.0))},
                '{self._escape(risk.get("affected_production_area", "General"))}',
                '{self._escape(risk.get("recommended_mitigation", ""))}',
                '{completed_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}'
            )
            """
            await self.mcp_client.run_query(risk_sql)

        # 3. Insert recommendations
        for index, opp in enumerate(prod_out.get("optimization_opportunities", [])):
            recommendation_id = f"rec-{analysis_run_id[:8]}-{index}"
            opp_sql = f"""
            INSERT INTO production_recommendations (
                recommendation_id, analysis_run_id, production_id, scene_number, originating_agent,
                title, description, recommended_action, projected_savings, confidence,
                human_approval_required, approval_state, created_at
            ) VALUES (
                '{recommendation_id}',
                '{analysis_run_id}',
                '{self._escape(production_id)}',
                '{self._escape(scene_number)}',
                'Producer Agent',
                '{self._escape(opp.get("title", ""))}',
                '{self._escape(opp.get("description", ""))}',
                '{self._escape(opp.get("recommended_action", ""))}',
                {float(opp.get("estimated_savings", 0.0))},
                {float(opp.get("confidence", 1.0))},
                {1 if opp.get("human_approval_required", True) else 0},
                'Pending Review',
                '{completed_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}'
            )
            """
            await self.mcp_client.run_query(opp_sql)

        logger.info(f"[MEMORY SERVICE] Saved analysis run {analysis_run_id} to ClickHouse.")
        return analysis_run_id

    async def save_human_decision(
        self,
        recommendation_id: str,
        production_id: str,
        decision: str,
        notes: str,
        proposal_id: str = "",
        actor_name: str = "Production Executive",
        actor_type: str = "human_demo_operator",
        previous_state: str = "Pending Review",
        new_state: str = "APPROVED",
        originating_agents: str = "",
        projected_savings: float = 0.0,
        shooting_days_saved: int = 0,
        risks_reduced: int = 0
    ) -> str:
        """
        Records human-in-the-loop decision and updates the recommendation state in ClickHouse.
        Enforces immutable-style append-only audit trail logging.
        """
        decision_id = str(uuid.uuid4())
        decided_at = datetime.now(UTC)

        # Insert decision record
        decision_sql = f"""
        INSERT INTO production_decisions (
            decision_id, recommendation_id, production_id, proposal_id, decision,
            actor_name, actor_type, previous_state, new_state, originating_agents,
            projected_savings, shooting_days_saved, risks_reduced, decided_at, notes
        ) VALUES (
            '{decision_id}',
            '{self._escape(recommendation_id)}',
            '{self._escape(production_id)}',
            '{self._escape(proposal_id)}',
            '{self._escape(decision)}',
            '{self._escape(actor_name)}',
            '{self._escape(actor_type)}',
            '{self._escape(previous_state)}',
            '{self._escape(new_state)}',
            '{self._escape(originating_agents)}',
            {float(projected_savings)},
            {int(shooting_days_saved)},
            {int(risks_reduced)},
            '{decided_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}',
            '{self._escape(notes)}'
        )
        """
        await self.mcp_client.run_query(decision_sql)

        # Update recommendation state (standard ClickHouse Mutation)
        update_sql = f"""
        ALTER TABLE production_recommendations
        UPDATE approval_state = '{self._escape(decision)}'
        WHERE recommendation_id = '{self._escape(recommendation_id)}'
        """
        await self.mcp_client.run_query(update_sql)

        logger.info(f"[MEMORY SERVICE] Human decision '{decision}' on recommendation '{recommendation_id}' logged.")
        return decision_id

    async def get_historical_analyses(self, production_id: str) -> list[dict]:
        """Queries historical runs for a given production."""
        sql = f"""
        SELECT * FROM production_analysis_runs
        WHERE production_id = '{self._escape(production_id)}'
        ORDER BY started_at DESC
        LIMIT 20
        """
        return await self.mcp_client.run_query(sql)

    async def get_historical_risks(self, production_id: str) -> list[dict]:
        """Queries historical risks for a given production."""
        sql = f"""
        SELECT * FROM production_risks
        WHERE production_id = '{self._escape(production_id)}'
        ORDER BY created_at DESC
        LIMIT 50
        """
        return await self.mcp_client.run_query(sql)

    async def get_historical_recommendations(self, production_id: str) -> list[dict]:
        """Queries historical recommendations for a given production."""
        sql = f"""
        SELECT * FROM production_recommendations
        WHERE production_id = '{self._escape(production_id)}'
        ORDER BY created_at DESC
        LIMIT 50
        """
        return await self.mcp_client.run_query(sql)

    async def get_historical_decisions(self, production_id: str) -> list[dict]:
        """Queries historical human-in-the-loop decisions for auditing."""
        sql = f"""
        SELECT * FROM production_decisions
        WHERE production_id = '{self._escape(production_id)}'
        ORDER BY decided_at DESC
        LIMIT 50
        """
        return await self.mcp_client.run_query(sql)
