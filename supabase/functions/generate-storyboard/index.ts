import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  storyInput: string;
  hasCaptions: boolean;
}

Deno.serve(async (req) => {
  // handle cors preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // parse request body (no authentication required)
    const { storyInput, hasCaptions }: RequestBody = await req.json();
    console.log('Generating storyboard (anonymous)');
    console.log('Story input:', storyInput);
    console.log('Has captions:', hasCaptions);

    // initialize supabase client with service role for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // get ai credentials
    const aiApiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const aiBaseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!aiApiKey || !aiBaseUrl) {
      console.error('Missing AI configuration');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // step 1: generate 12 scene descriptions using ai
    console.log('Step 1: Generating scene descriptions...');
    const scenesPrompt = `You are a children's storybook writer. Given the following story idea or title, create exactly 12 sequential scene descriptions that tell a complete story suitable for children aged 4-8.

Story input: "${storyInput}"

Requirements:
- Exactly 12 scenes, no more, no less
- Each scene should be 1-2 sentences
- Scenes should flow logically from beginning to end
- Simple language appropriate for young children
- Include clear visual elements that can be illustrated
- Format as a numbered list

Example format:
1. [Scene description]
2. [Scene description]
...
12. [Scene description]`;

    const scenesResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: scenesPrompt }
        ],
      }),
    });

    if (!scenesResponse.ok) {
      const errorText = await scenesResponse.text();
      console.error('AI scenes generation error:', errorText);
      return new Response(
        JSON.stringify({ error: `AI: Failed to generate scenes - ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scenesData = await scenesResponse.json();
    const scenesText = scenesData.choices[0].message.content;
    console.log('Generated scenes text:', scenesText);

    // parse scenes from numbered list
    const sceneMatches = scenesText.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n*$)/gs);
    if (!sceneMatches || sceneMatches.length < 12) {
      console.error('Failed to parse 12 scenes from AI response');
      return new Response(
        JSON.stringify({ error: 'Failed to generate proper scene structure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sceneDescriptions = sceneMatches.slice(0, 12).map((match) => {
      return match.replace(/^\d+\.\s*/, '').trim();
    });

    console.log('Parsed scene descriptions:', sceneDescriptions);

    // step 2: get prompt template from database
    console.log('Step 2: Fetching prompt template from database...');
    const { data: templates, error: templateError } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (templateError || !templates) {
      console.error('Failed to fetch prompt template:', templateError);
      return new Response(
        JSON.stringify({ error: 'Prompt template not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Using template:', templates.name);
    
    // build scene descriptions list
    const panelDescriptions = sceneDescriptions
      .map((scene, index) => `Panel ${index + 1}: ${scene}`)
      .join('\n');

    // replace placeholders in template
    const storyboardPrompt = templates.template
      .replace('{{CAPTIONS}}', hasCaptions ? ' Include the scene description text at the bottom of each panel.' : '')
      .replace('{{SCENES}}', panelDescriptions)
      .replace('{{CAPTION_REQUIREMENT}}', hasCaptions ? '\n- Text captions at bottom of each panel' : '');

    console.log('Step 3: Generating storyboard image with custom prompt...');

    const imageResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: storyboardPrompt }
        ],
        modalities: ['image', 'text'],
        image_config: { aspect_ratio: '2:3' } // tall aspect ratio for 2x6 grid
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('AI storyboard generation error:', errorText);
      return new Response(
        JSON.stringify({ error: `AI: Failed to generate storyboard - ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.choices[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image URL in response');
      return new Response(
        JSON.stringify({ error: 'No storyboard image generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Storyboard generated successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        sceneDescriptions,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
