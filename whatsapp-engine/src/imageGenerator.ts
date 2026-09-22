import axios from 'axios';

export interface GeneratedImageResult {
  imageUrl: string;
  imageBuffer?: Buffer;
  caption: string;
}

/**
 * Generates an image using Pollinations.ai / Flux API.
 */
export async function generateAiImage(userPrompt: string): Promise<GeneratedImageResult> {
  const cleanPrompt = userPrompt
    .replace(/^\/image/i, '')
    .replace(/^generate image/i, '')
    .replace(/^draw/i, '')
    .trim() || 'futuristic glowing neon cityscape, 8k cinematic masterpiece';

  const encoded = encodeURIComponent(cleanPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true`;

  const caption = `🎨 *SuperAI Image Generator (Flux/Pollinations)*\n\n📌 *Prompt:* "${cleanPrompt}"\n⚡ Resolution: 1024x1024 HD\n✨ SuperAI Hub WhatsApp Assistant`;

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 25000
    });
    return {
      imageUrl,
      imageBuffer: Buffer.from(response.data),
      caption
    };
  } catch (err: any) {
    console.warn('Failed to fetch image buffer, falling back to direct URL:', err.message);
    return {
      imageUrl,
      caption
    };
  }
}
