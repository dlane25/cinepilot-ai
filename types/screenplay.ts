export interface SceneDialogueBlock {
  character: string;
  text: string;
}

export interface ScreenplayScene {
  id: string;
  scene_number: string;
  heading: string;
  interior_exterior: string;
  location: string;
  time_of_day: string;
  raw_text: string;
  characters: string[];
  dialogue_blocks: SceneDialogueBlock[];
  estimated_page_fraction: number;
}

export interface ScreenplayMetadata {
  title: string;
  author: string;
  total_scenes: number;
  total_characters: number;
  interior_scenes_count: number;
  exterior_scenes_count: number;
  day_scenes_count: number;
  night_scenes_count: number;
}

export interface ScreenplaySceneAnalysis {
  scene_number: string;
  creative_complexity: "High" | "Medium" | "Low";
  production_complexity: "High" | "Medium" | "Low";
  cast_requirements: string[];
  extras_background_performers: string[];
  props: string[];
  wardrobe: string[];
  vehicles: string[];
  animals: string[];
  stunts: string[];
  vfx: string[];
  sfx: string[];
  practical_effects: string[];
  special_equipment: string[];
  location_complexity: string;
  night_exterior_requirements: string[];
  weather_exposure: string[];
  safety_concerns: string[];
  schedule_sensitivity: string;
  estimated_setup_complexity: "High" | "Medium" | "Low";
  production_risk_signals: string[];
}

export interface ScreenplayAnalysisResponse {
  production_id: string;
  metadata: ScreenplayMetadata;
  scene_analyses: ScreenplaySceneAnalysis[];
  timestamp: string;
}
