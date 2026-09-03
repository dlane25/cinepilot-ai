import re

from app.core.logging import logger
from app.screenplay.models import (
    SceneDialogueBlock,
    ScreenplayMetadata,
    ScreenplayScene,
)

SLUGLINE_PATTERN = re.compile(
    r"^\s*(INT\.|EXT\.|INT\./EXT\.|EXT\./INT\.)\s+([A-Z0-9\s\.\-/']+?)(?:\s+-\s+|\s+-\s*|\s*-\s+|\s+)([A-Z0-9\s/]+)$",
    re.IGNORECASE
)

CHARACTER_PATTERN = re.compile(r"^\s*([A-Z][A-Z0-9\s\.\-\(\)]+)$")

# Common screenplay transitions to avoid mapping as characters
TRANSITIONS = {"CUT TO:", "FADE IN:", "FADE OUT:", "DISSOLVE TO:", "SMASH CUT TO:", "MATCH CUT TO:"}

def parse_screenplay_text(text: str) -> list[ScreenplayScene]:
    """
    Deterministically parses raw screenplay text page blocks into structured ScreenplayScene models.
    """
    logger.info("[PARSER] Slicing screenplay text into structured scenes...")
    lines = text.split("\n")

    scenes: list[ScreenplayScene] = []
    current_scene_number = 1

    active_heading = ""
    active_int_ext = ""
    active_location = ""
    active_time_of_day = ""
    active_scene_text_lines = []

    active_dialogue_blocks: list[SceneDialogueBlock] = []
    active_characters: set[str] = set()

    last_character_speaker = ""

    def flush_scene():
        nonlocal current_scene_number, active_heading, active_int_ext, active_location, active_time_of_day, active_scene_text_lines, active_dialogue_blocks, active_characters, last_character_speaker
        if active_heading:
            scene_raw_text = "\n".join(active_scene_text_lines).strip()

            # Simple page fraction estimate based on lines count (standard 54 lines/page)
            est_fraction = round(len(active_scene_text_lines) / 54.0, 3)
            if est_fraction < 0.05:
                est_fraction = 0.083 # minimum 1/12th page

            scenes.append(
                ScreenplayScene(
                    id=f"scene-parsed-{current_scene_number}",
                    scene_number=str(current_scene_number),
                    heading=active_heading,
                    interior_exterior=active_int_ext,
                    location=active_location,
                    time_of_day=active_time_of_day,
                    raw_text=scene_raw_text,
                    characters=sorted(active_characters),
                    dialogue_blocks=active_dialogue_blocks,
                    estimated_page_fraction=est_fraction
                )
            )
            current_scene_number += 1

        # Reset buffers
        active_scene_text_lines = []
        active_dialogue_blocks = []
        active_characters = set()
        last_character_speaker = ""

    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            last_character_speaker = ""
            continue

        # Check if line is a standard Scene Heading
        match = SLUGLINE_PATTERN.match(cleaned_line)
        if match:
            # First, flush the previous scene if it exists
            flush_scene()

            # Extract slugline components
            active_int_ext = match.group(1).strip().upper().replace(".", "")
            active_location = match.group(2).strip().upper()
            active_time_of_day = match.group(3).strip().upper()
            active_heading = f"{active_int_ext}. {active_location} - {active_time_of_day}"

            active_scene_text_lines.append(cleaned_line)
            continue

        # Only parse layout lines once inside an active scene block
        if active_heading:
            active_scene_text_lines.append(line)

            # Check for Transition skip
            if cleaned_line.upper() in TRANSITIONS:
                last_character_speaker = ""
                continue

            # Check if line matches character speaker name
            char_match = CHARACTER_PATTERN.match(cleaned_line)
            if char_match and len(cleaned_line) < 30:
                speaker = char_match.group(1).strip()
                # Clean up parenthetical markers (O.S., V.O.)
                speaker_clean = re.sub(r"\s*\(.+?\)\s*", "", speaker).upper()

                # Check that it's not actually standard description (e.g. uppercase line that is too long or contains verbs)
                if speaker_clean and not any(verb in f" {speaker_clean} " for verb in [" RUNS ", " SHOOTS ", " ENTERS ", " WALKS "]):
                    last_character_speaker = speaker_clean
                    active_characters.add(speaker_clean)
                    continue

            # If we had a speaker, group subsequent description paragraphs as dialogue
            if last_character_speaker and cleaned_line:
                # If we encounter an uppercase line that isn't indented or looks like general action, break
                if cleaned_line.isupper() and len(cleaned_line) > 30:
                    last_character_speaker = ""
                else:
                    # Skip parenthetical directions
                    if cleaned_line.startswith("(") and cleaned_line.endswith(")"):
                        continue
                    # Append or merge dialogue block
                    if active_dialogue_blocks and active_dialogue_blocks[-1].character == last_character_speaker:
                        active_dialogue_blocks[-1].text += f" {cleaned_line}"
                    else:
                        active_dialogue_blocks.append(
                            SceneDialogueBlock(character=last_character_speaker, text=cleaned_line)
                        )

    # Flush final scene
    flush_scene()

    logger.info(f"[PARSER] Slicing complete. Structured scene count: {len(scenes)}")
    return scenes

def compute_screenplay_metadata(scenes: list[ScreenplayScene]) -> ScreenplayMetadata:
    """
    Computes summary statistics from a parsed sequence of structured ScreenplayScenes.
    """
    total_scenes = len(scenes)
    unique_chars: set[str] = set()

    int_count = 0
    ext_count = 0
    day_count = 0
    night_count = 0

    for scene in scenes:
        unique_chars.update(scene.characters)

        ie = scene.interior_exterior.upper()
        if "INT" in ie:
            int_count += 1
        elif "EXT" in ie:
            ext_count += 1

        tod = scene.time_of_day.upper()
        if "DAY" in tod:
            day_count += 1
        elif "NIGHT" in tod:
            night_count += 1

    return ScreenplayMetadata(
        title="Untitled Screenplay",
        author="Unknown Writer",
        total_scenes=total_scenes,
        total_characters=len(unique_chars),
        interior_scenes_count=int_count,
        exterior_scenes_count=ext_count,
        day_scenes_count=day_count,
        night_scenes_count=night_count
    )
