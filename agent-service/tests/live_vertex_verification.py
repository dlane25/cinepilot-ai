import asyncio
import os
import sys

# Add agent-service root to python path to avoid import errors when running directly
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from app.agents.director import director_agent
from app.services.agent_runtime import run_agent


async def main():
    print("=========================================================")
    print("CinePilot AI - Live Vertex AI ADK Verification Script")
    print("=========================================================")
    
    # 1. Inspect environment config
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "true")
    
    print(f"GOOGLE_CLOUD_PROJECT:      {project_id}")
    print(f"GOOGLE_CLOUD_LOCATION:     {location}")
    print(f"GOOGLE_GENAI_USE_VERTEXAI: {use_vertex}")
    print("---------------------------------------------------------")
    
    if not project_id:
        print("[ERROR] GOOGLE_CLOUD_PROJECT is not set. Please authenticate and run:")
        print("  $env:GOOGLE_CLOUD_PROJECT='your-project-id'")
        print("  $env:GOOGLE_GENAI_USE_VERTEXAI='true'")
        print("  gcloud auth application-default login")
        sys.exit(1)
        
    print("[INFO] Attempting to invoke Gemini 2.0 via standard Google ADK...")
    
    test_prompt = """
    Analyze the following simple scene input details:
    Scene Number: 1
    Scene Heading: INT. CABIN - DAY
    INT/EXT: INT
    DAY/NIGHT: DAY
    Characters: Maya
    Requirements identified: None
    
    Produce a valid JSON output matching:
    {
      "scene_complexity": "Low",
      "location_requirements": ["INT. CABIN"],
      "production_requirements": [],
      "cast_background_requirements": ["Maya"],
      "physical_production_considerations": "Dialogue setup, simple interior.",
      "risk_observations": [],
      "production_notes": "None"
    }
    """
    
    try:
        # Run with is_mock=False to test genuine Vertex AI and Gemini ADK connectivity!
        response_text = await run_agent(
            agent=director_agent,
            prompt=test_prompt,
            is_mock=False
        )
        print("\n[SUCCESS] Live response received from Vertex AI Gemini model!")
        print("Raw Agent Output:")
        print("---------------------------------------------------------")
        print(response_text)
        print("---------------------------------------------------------")
        print("[SUCCESS] Vertex AI and Google ADK integration verified!")
        
    except Exception as e:
        print("\n[FAILURE] Failed to connect or execute agent via live Vertex AI.")
        print(f"Error Details: {e!s}")
        print("\nPossible root causes:")
        print("1. Standard ADC credentials not initialized. Run: gcloud auth application-default login")
        print("2. Insufficient IAM permissions for Vertex AI. Require: roles/aiplatform.user")
        print("3. Missing API enablement or network restrictions on the GCP project.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
