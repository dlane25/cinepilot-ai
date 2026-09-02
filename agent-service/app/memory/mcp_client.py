import json
import os
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from app.config.settings import settings
from app.core.logging import logger


class ClickHouseMcpClient:
    """Secure client wrapper interacting with official mcp-clickhouse via stdio."""

    def __init__(self):
        # We target the mcp-clickhouse executable.
        self.command = "mcp-clickhouse"
        if sys.platform == "win32":
            # Locate active .venv folder inside agent-service/
            venv_path = os.path.join(os.getcwd(), ".venv", "Scripts", "mcp-clickhouse.exe")
            if os.path.exists(venv_path):
                self.command = venv_path
            else:
                # Fallback to absolute or sibling venv paths
                sibling_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".venv", "Scripts", "mcp-clickhouse.exe")
                if os.path.exists(sibling_path):
                    self.command = sibling_path

    async def run_query(self, query: str) -> list[dict]:
        """Runs a raw SQL query through the official mcp-clickhouse run_query tool."""
        # Ensure host is configured
        if not settings.clickhouse_host:
            logger.warning("[MCP CLIENT] ClickHouse host not configured. Query skipped.")
            return []

        logger.info(f"[MCP CLIENT] Executing SQL via stdio subprocess: {query[:120]}...")

        # Setup standard subprocess execution parameters
        server_params = StdioServerParameters(
            command=self.command,
            args=[],
            env={
                "CLICKHOUSE_HOST": settings.clickhouse_host,
                "CLICKHOUSE_PORT": str(settings.clickhouse_port),
                "CLICKHOUSE_USER": settings.clickhouse_username,
                "CLICKHOUSE_PASSWORD": settings.clickhouse_password or "",
                "CLICKHOUSE_SECURE": "true" if settings.clickhouse_secure else "false",
                "CLICKHOUSE_DATABASE": settings.clickhouse_database,
                "CLICKHOUSE_ALLOW_WRITE_ACCESS": "true",  # Strict security opt-in for INSERTs
            }
        )

        try:
            async with stdio_client(server_params) as (read_stream, write_stream):
                async with ClientSession(read_stream, write_stream) as session:
                    await session.initialize()
                    
                    # Invoke the mandated official tool name
                    result = await session.call_tool("run_query", {"query": query})
                    
                    if not result or not hasattr(result, "content") or not result.content:
                        return []
                        
                    text_content = result.content[0].text if hasattr(result.content[0], "text") else ""
                    if not text_content:
                        return []
                        
                    try:
                        # Attempt to decode as JSON. Official mcp-clickhouse formats output rows in JSON
                        parsed = json.loads(text_content)
                        if isinstance(parsed, dict) and "columns" in parsed and "rows" in parsed:
                            cols = parsed["columns"]
                            return [dict(zip(cols, row, strict=False)) for row in parsed["rows"]]
                        return parsed
                    except Exception:
                        logger.warning(f"[MCP CLIENT] Query output did not parse as JSON: {text_content[:200]}")
                        return []
                        
        except Exception as e:
            logger.error(f"[MCP CLIENT] subprocess run_query execution failed: {e!s}")
            raise e
