
from pydantic import BaseModel, Field


class SceneDialogueBlock(BaseModel):
    """Represents a block of spoken dialogue by a character within a scene."""
    character: str = Field(..., description="The name of the character speaking.")
    text: str = Field(..., description="The spoken dialogue text.")

class ScreenplayScene(BaseModel):
    """Represents a deterministically parsed, structured screenplay scene."""
    id: str = Field(..., description="Unique alphanumeric identifier (e.g. 'scene-1').")
    scene_number: str = Field(..., description="Scene number parsed from the screenplay.")
    heading: str = Field(..., description="Full slugline heading (e.g., 'INT. CABIN - DAY').")
    interior_exterior: str = Field(..., description="INT or EXT classification.")
    location: str = Field(..., description="The physical location parsed from the heading.")
    time_of_day: str = Field(..., description="Time of day (DAY, NIGHT, etc.).")
    raw_text: str = Field(..., description="Raw text block extracted for this specific scene.")
    characters: list[str] = Field(default_factory=list, description="List of unique character names detected in this scene.")
    dialogue_blocks: list[SceneDialogueBlock] = Field(default_factory=list, description="Sequence of dialogue exchanges.")
    estimated_page_fraction: float = Field(default=0.1, description="Estimated fraction of a page (e.g. 0.125 represents 1/8 page).")

class ScreenplayMetadata(BaseModel):
    """Cumulative parsed metadata of the screenplay document."""
    title: str | None = "Untitled Screenplay"
    author: str | None = "Unknown"
    total_scenes: int
    total_characters: int
    interior_scenes_count: int
    exterior_scenes_count: int
    day_scenes_count: int
    night_scenes_count: int

class ScreenplaySceneAnalysis(BaseModel):
    """The structured AI-generated Creative and department Logistics analysis for a single scene."""
    scene_number: str = Field(..., description="The parsed scene number.")
    creative_complexity: str = Field(..., description="High, Medium, or Low.")
    production_complexity: str = Field(..., description="High, Medium, or Low.")
    cast_requirements: list[str] = Field(default_factory=list, description="Actor cast roles.")
    extras_background_performers: list[str] = Field(default_factory=list, description="Extras, crowd sizes, or stand-ins.")
    props: list[str] = Field(default_factory=list, description="Action props or set dressing items.")
    wardrobe: list[str] = Field(default_factory=list, description=" Wardrobe, costumes, or continuity changes.")
    vehicles: list[str] = Field(default_factory=list, description="Picture vehicles, insert cars, or transport.")
    animals: list[str] = Field(default_factory=list, description="Wrangled animals, dogs, horses, etc.")
    stunts: list[str] = Field(default_factory=list, description="Stunts, wire rigs, falls, or fights.")
    vfx: list[str] = Field(default_factory=list, description="Visual effects plates, CGI tracking, green screen.")
    sfx: list[str] = Field(default_factory=list, description="Special effects (water, rain rig, fire, gunshots).")
    practical_effects: list[str] = Field(default_factory=list, description="Mechanical triggers, breakaways, practical items.")
    special_equipment: list[str] = Field(default_factory=list, description="Special camera support, Technocrane, underwater housings, drone.")
    location_complexity: str = Field(..., description="Analysis of spatial complexity.")
    night_exterior_requirements: list[str] = Field(default_factory=list, description="Special nighttime or outdoor logistics (generator, lighting).")
    weather_exposure: list[str] = Field(default_factory=list, description="Wind, snow, rain, heat, exposure metrics.")
    safety_concerns: list[str] = Field(default_factory=list, description="Potential safety hazards or safety officers required.")
    schedule_sensitivity: str = Field(..., description="Turnaround limits, child actors, SAG limits.")
    estimated_setup_complexity: str = Field(..., description="Estimated setup overhead.")
    production_risk_signals: list[str] = Field(default_factory=list, description="Potential risk alerts (overtime, weather delay).")

class ScreenplayAnalysisResponse(BaseModel):
    """The final consolidated schema response of the Screenplay Intelligence endpoint."""
    production_id: str
    metadata: ScreenplayMetadata
    scene_analyses: list[ScreenplaySceneAnalysis]
    timestamp: str
