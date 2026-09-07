import { supabase } from './supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { GenerateStoryboardResponse, Creation } from '@/types/creation';

const STORAGE_KEY = 'storyboard_creations';

// localStorage helpers
export function getLocalCreations(): Creation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveLocalCreation(creation: Creation) {
  const creations = getLocalCreations();
  creations.unshift(creation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creations));
}

export function updateLocalCreation(id: string, updates: Partial<Creation>) {
  const creations = getLocalCreations();
  const index = creations.findIndex((c) => c.id === id);
  if (index !== -1) {
    creations[index] = { ...creations[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creations));
  }
}

export function deleteLocalCreation(id: string) {
  const creations = getLocalCreations().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creations));
}

export async function generateStoryboard(storyInput: string, hasCaptions: boolean) {
  const { data, error } = await supabase.functions.invoke('generate-storyboard', {
    body: { storyInput, hasCaptions },
  });

  if (error) {
    let errorMessage = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const statusCode = error.context?.status ?? 500;
        const textContent = await error.context?.text();
        errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
      } catch {
        errorMessage = `${error.message || 'Failed to read response'}`;
      }
    }
    throw new Error(errorMessage);
  }

  return data as GenerateStoryboardResponse;
}

export async function convertImageUrlToBlob(imageUrl: string): Promise<Blob> {
  // if it's a data URL, convert directly
  if (imageUrl.startsWith('data:')) {
    const response = await fetch(imageUrl);
    return await response.blob();
  }
  
  // otherwise fetch the image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch image');
  }
  return await response.blob();
}

export async function saveCreation(
  storyInput: string,
  hasCaptions: boolean,
  imageUrl: string,
  sceneDescriptions: string[]
) {
  try {
    // convert image URL to blob then to data URL for localStorage
    const blob = await convertImageUrlToBlob(imageUrl);
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const creation: Creation = {
      id: crypto.randomUUID(),
      user_id: 'local',
      story_input: storyInput,
      has_captions: hasCaptions,
      image_url: dataUrl,
      scene_descriptions: sceneDescriptions,
      is_favorite: false,
      created_at: new Date().toISOString(),
    };

    saveLocalCreation(creation);
  } catch (error) {
    console.error('Save error:', error);
    throw new Error('Failed to save creation');
  }
}

export async function downloadStoryboard(imageUrl: string, storyTitle: string) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${storyTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_storyboard.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
