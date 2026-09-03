from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.screenplay.models import ScreenplayAnalysisResponse, ScreenplayMetadata
from app.screenplay.parser import compute_screenplay_metadata, parse_screenplay_text

client = TestClient(app)

# Standard text screenplay mock content
MOCK_SCREENPLAY_TEXT = """
FADE IN:

INT. CABINET - DAY

MAYA stands near the wooden desk. She looks anxious.

MAYA
(softly)
I found the key.

DETECTOR COLE enters, sliding a glass door.

DETECTOR COLE
It was about time.

EXT. INDUSTRIAL WAREHOUSE - NIGHT

Maya climbs the metal scaffolding. Heavy rain pours down.
"""

def test_screenplay_scene_heading_sluglines():
    """Verify deterministic INT and EXT scene heading split parsing."""
    scenes = parse_screenplay_text(MOCK_SCREENPLAY_TEXT)
    assert len(scenes) == 2

    # Assert INT scene
    assert scenes[0].scene_number == "1"
    assert "INT. CABINET - DAY" in scenes[0].heading
    assert scenes[0].interior_exterior == "INT"
    assert scenes[0].location == "CABINET"
    assert scenes[0].time_of_day == "DAY"

    # Assert EXT scene
    assert scenes[1].scene_number == "2"
    assert "EXT. INDUSTRIAL WAREHOUSE - NIGHT" in scenes[1].heading
    assert scenes[1].interior_exterior == "EXT"
    assert scenes[1].location == "INDUSTRIAL WAREHOUSE"
    assert scenes[1].time_of_day == "NIGHT"

def test_screenplay_character_and_dialogue_association():
    """Verify speaker and dialogue line matching and unique names collection."""
    scenes = parse_screenplay_text(MOCK_SCREENPLAY_TEXT)
    assert len(scenes) == 2

    first_scene = scenes[0]
    assert "MAYA" in first_scene.characters
    assert "DETECTOR COLE" in first_scene.characters
    assert len(first_scene.dialogue_blocks) == 2

    # Assert speech associations
    assert first_scene.dialogue_blocks[0].character == "MAYA"
    assert first_scene.dialogue_blocks[0].text == "I found the key."
    assert first_scene.dialogue_blocks[1].character == "DETECTOR COLE"
    assert first_scene.dialogue_blocks[1].text == "It was about time."

def test_screenplay_metadata_generation():
    """Verify sum metrics calculations across parsed scenes."""
    scenes = parse_screenplay_text(MOCK_SCREENPLAY_TEXT)
    metadata = compute_screenplay_metadata(scenes)

    assert metadata.total_scenes == 2
    assert metadata.total_characters == 2
    assert metadata.interior_scenes_count == 1
    assert metadata.exterior_scenes_count == 1
    assert metadata.day_scenes_count == 1
    assert metadata.night_scenes_count == 1

def test_oversized_file_upload_rejection():
    """Verify that file uploads exceeding 5MB are rejected with 413 HTTP status."""
    # Create fake massive byte array exceeding 5MB
    massive_data = b"0" * (5 * 1024 * 1024 + 10)

    response = client.post(
        "/api/v1/screenplays/analyze",
        data={"production_id": "prod-echopoint-001"},
        files={"file": ("screenplay.pdf", massive_data, "application/pdf")}
    )
    assert response.status_code == 413
    assert "exceeds" in response.json()["detail"]

def test_non_pdf_file_upload_rejection():
    """Verify that non-PDF file formats are rejected with 415 HTTP status."""
    response = client.post(
        "/api/v1/screenplays/analyze",
        data={"production_id": "prod-echopoint-001"},
        files={"file": ("screenplay.txt", b"Standard Text Content", "text/plain")}
    )
    assert response.status_code == 415
    assert "Only PDF" in response.json()["detail"]

@patch("app.api.screenplays.analyze_screenplay_document")
def test_successful_screenplay_endpoint_validation(mock_analyze):
    """Verify structured response contract schema of the screenplays analyze endpoint."""
    mock_resp = ScreenplayAnalysisResponse(
        production_id="prod-echopoint-001",
        metadata=ScreenplayMetadata(
            title="ECHO POINT",
            author="J. Miller",
            total_scenes=2,
            total_characters=2,
            interior_scenes_count=1,
            exterior_scenes_count=1,
            day_scenes_count=1,
            night_scenes_count=1
        ),
        scene_analyses=[
            {
                "scene_number": "1",
                "creative_complexity": "Medium",
                "production_complexity": "Medium",
                "location_complexity": "Standard interior setup.",
                "schedule_sensitivity": "Standard rest limits.",
                "estimated_setup_complexity": "Medium"
            }
        ],
        timestamp="2026-08-26T21:00:00Z"
    )
    mock_analyze.return_value = mock_resp

    response = client.post(
        "/api/v1/screenplays/analyze",
        data={"production_id": "prod-echopoint-001"},
        files={"file": ("screenplay.pdf", b"Fake PDF Data", "application/pdf")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["production_id"] == "prod-echopoint-001"
    assert data["metadata"]["total_scenes"] == 2
    assert len(data["scene_analyses"]) == 1
    assert data["scene_analyses"][0]["creative_complexity"] == "Medium"
