import asyncio
import os
import sys
from datetime import UTC, datetime

# Ensure agent-service/ is in the PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from app.config.settings import settings
from app.memory.mcp_client import ClickHouseMcpClient
from app.memory.service import ProductionMemoryService


async def main():
    print("=========================================================")
    print("CinePilot AI - Live ClickHouse & MCP Verification Script")
    print("=========================================================")
    
    # 1. Verify Configuration variables are loaded (Without exposing password!)
    print(f"CLICKHOUSE_HOST:      {settings.clickhouse_host}")
    print(f"CLICKHOUSE_PORT:      {settings.clickhouse_port}")
    print(f"CLICKHOUSE_USERNAME:  {settings.clickhouse_username}")
    print(f"CLICKHOUSE_DATABASE:  {settings.clickhouse_database}")
    print(f"CLICKHOUSE_SECURE:    {settings.clickhouse_secure}")
    print(f"PASSWORD CONFIGURED:  {settings.clickhouse_password is not None}")
    print("---------------------------------------------------------")
    
    if not settings.clickhouse_host or not settings.clickhouse_password:
        print("[ERROR] ClickHouse connection variables are not configured in .env.")
        sys.exit(1)
        
    # 2. Verify Connectivity & Run Schema Bootstrap DDL (Isolated startup path)
    print("[INFO] Initiating database schema bootstrap via direct clickhouse-connect...")
    memory_service = ProductionMemoryService()
    bootstrap_success = memory_service.bootstrap_db()
    
    if not bootstrap_success:
        print("[ERROR] Database bootstrap/migration failed. Connection refused or authentication issue.")
        sys.exit(1)
        
    print("[SUCCESS] ClickHouse Cloud connection and schema migrations passed!")
    print("---------------------------------------------------------")
    
    # 3. Verify mcp-clickhouse runtime connection over stdio
    print("[INFO] Launching official mcp-clickhouse subprocess over stdio transport...")
    mcp_client = ClickHouseMcpClient()
    
    # Test simple connection via mcp-clickhouse tool "run_query"
    print("[INFO] Running connectivity query (SELECT 1) through official MCP client...")
    try:
        ping_result = await mcp_client.run_query("SELECT 1 AS ping")
        print("MCP Ping Result:", ping_result)
        if ping_result and ping_result[0].get("ping") == 1:
            print("[SUCCESS] Official mcp-clickhouse runtime completed connection securely!")
        else:
            print("[ERROR] Unexpected ping result returned by MCP server.")
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Failed to run query via official mcp-clickhouse server: {e!s}")
        sys.exit(1)
        
    print("---------------------------------------------------------")
    
    # 4. Perform E2E Live MCP Verification (Insert -> Query -> Verify -> Delete)
    print("[INFO] Executing live E2E production memory verification...")
    
    test_analysis_id = "test-run-mcp-e2e-12345"
    started_at = datetime.now(UTC)
    completed_at = datetime.now(UTC)
    
    insert_sql = f"""
    INSERT INTO production_analysis_runs (
        analysis_run_id, production_id, scene_number, started_at, completed_at,
        model, runtime, director_complexity, total_risk_count, total_opportunity_count,
        projected_savings, status
    ) VALUES (
        '{test_analysis_id}',
        'prod-echopoint-001',
        '42',
        '{started_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}',
        '{completed_at.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}',
        'gemini-2.5-flash',
        'Python ADK',
        'High',
        2,
        2,
        15000.00,
        'Success'
    )
    """
    
    query_sql = f"""
    SELECT * FROM production_analysis_runs 
    WHERE analysis_run_id = '{test_analysis_id}'
    """
    
    delete_sql = f"""
    ALTER TABLE production_analysis_runs 
    DELETE WHERE analysis_run_id = '{test_analysis_id}'
    """
    
    try:
        # A. Insert row through MCP run_query
        print("[INFO] 1/4 Writing test analysis run through official MCP run_query...")
        await mcp_client.run_query(insert_sql)
        print("[SUCCESS] Row inserted successfully.")
        
        # B. Query row back through MCP run_query
        print("[INFO] 2/4 Querying test analysis back through official MCP run_query...")
        records = await mcp_client.run_query(query_sql)
        print("Retrieved Records from ClickHouse:", records)
        
        # C. Verify returned data matches
        print("[INFO] 3/4 Verifying schema row match metrics...")
        if not records or len(records) == 0:
            print("[ERROR] E2E verification failed: No records were returned by ClickHouse.")
            sys.exit(1)
            
        retrieved_record = records[0]
        assert retrieved_record.get("analysis_run_id") == test_analysis_id, "Analysis run ID mismatch."
        assert retrieved_record.get("production_id") == "prod-echopoint-001", "Production ID mismatch."
        assert retrieved_record.get("scene_number") == "42", "Scene number mismatch."
        assert retrieved_record.get("model") == "gemini-2.5-flash", "Model mismatch."
        assert float(retrieved_record.get("projected_savings", 0.0)) == 15000.0, "Projected savings mismatch."
        print("[SUCCESS] ClickHouse database data matches the written metrics perfectly!")
        
        # D. Clean up test data
        print("[INFO] 4/4 Cleaning up live ClickHouse test data records...")
        await mcp_client.run_query(delete_sql)
        print("[SUCCESS] Test data mutation cleared successfully.")
        
        print("\n=========================================================")
        print("[PASS] Milestone 4 ClickHouse + Official MCP E2E Verification SUCCESSFUL!")
        print("=========================================================")
        
    except Exception as e:
        print(f"\n[FAILURE] E2E validation error: {e!s}")
        # Attempt fallback deletion in case of assertion failures
        try:
            await mcp_client.run_query(delete_sql)
        except Exception:
            pass
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
