import asyncio

from google.adk.agents.llm_agent import Agent
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.core.errors import AgentExecutionError
from app.core.logging import logger

# Initialize global services for the ADK runner
session_service = InMemorySessionService()
artifact_service = InMemoryArtifactService()

async def run_agent(agent: Agent, prompt: str, is_mock: bool = False, mock_response: str = "") -> str:
    """
    Executes a google-adk Agent using the standard Runner.
    If is_mock is True, returns mock_response directly without making external API calls.
    """
    if is_mock:
        logger.info(f"[MOCK] Running agent '{agent.name}' with prompt: {prompt[:100]}...")
        # Simulating slight delay
        await asyncio.sleep(0.01)
        return mock_response

    logger.info(f"Executing Agent '{agent.name}' with ADK Runner...")
    try:
        # Create a unique session for this analysis run
        session = await session_service.create_session(app_name="cinepilot", user_id="system_backend")
        runner = Runner(
            agent=agent,
            app_name="cinepilot",
            session_service=session_service,
            artifact_service=artifact_service
        )
        
        # Format query using google.genai types
        content = types.Content(role="user", parts=[types.Part(text=prompt)])
        
        events = runner.run_async(
            session_id=session.id,
            user_id="system_backend",
            new_message=content
        )
        
        final_text = ""
        async for event in events:
            # Safely accumulate model response text from emitted events
            if hasattr(event, "content") and event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        final_text += part.text
                    
        if not final_text:
            raise AgentExecutionError("Agent completed execution but returned no text response.")
            
        return final_text
    except Exception as e:
        logger.error(f"Error executing agent '{agent.name}': {e!s}")
        raise AgentExecutionError(f"Google ADK Agent execution failed: {e!s}") from e
