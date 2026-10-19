import { json, type RequestHandler } from '@sveltejs/kit';
import {
  buildVisualGenerationParams,
  VISUAL_ASPECT_RATIO_DIMS,
  type VisualGenerationParams
} from '$lib/services/ceoRouter';

export interface GenerateImageRequest {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  seed?: number;
  model?: string;
  helperId?: string;
}

export const GET: RequestHandler = async () => {
  return json({
    endpoint: '/api/generate-image',
    status: 'active',
    description: 'Dedicated live AI image generation pipeline for commercial assets and logos (#34 & #35)',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3'],
    dimensions: VISUAL_ASPECT_RATIO_DIMS,
    defaultModel: 'flux',
    visualHelpers: [
      { id: 'ai_commercial_image_generator', code: '#34', name: 'AI Commercial Image Generator' },
      { id: 'ai_business_logo_generator', code: '#35', name: 'AI Business Logo Generator' }
    ]
  });
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return json(
        {
          success: false,
          error: 'Invalid JSON request payload.'
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return json(
        {
          success: false,
          error: 'Request body must be a valid JSON object.'
        },
        { status: 400 }
      );
    }

    const { prompt, aspectRatio, seed, model, helperId } = body as GenerateImageRequest;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return json(
        {
          success: false,
          error: 'A valid non-empty "prompt" is required for image generation.'
        },
        { status: 400 }
      );
    }

    // Compute parameters, width/height, seed, and live Flux Pollinations URL
    const params: VisualGenerationParams = buildVisualGenerationParams(prompt, {
      aspectRatio,
      seed,
      model,
      helperId
    });

    return json({
      success: true,
      imageUrl: params.imageUrl,
      caption: params.caption,
      prompt: params.prompt,
      dimensions: {
        width: params.width,
        height: params.height
      },
      aspectRatio: params.aspectRatio,
      seed: params.seed,
      model: params.model,
      provider: 'flux'
    });
  } catch (err: any) {
    return json(
      {
        success: false,
        error: err?.message || 'Internal server error while generating image.'
      },
      { status: 500 }
    );
  }
};
