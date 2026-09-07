export interface Creation {
  id: string;
  user_id: string;
  story_input: string;
  has_captions: boolean;
  image_url: string;
  scene_descriptions: string[];
  is_favorite: boolean;
  created_at: string;
}

export interface GenerateStoryboardResponse {
  success: boolean;
  imageUrl: string;
  sceneDescriptions: string[];
}
