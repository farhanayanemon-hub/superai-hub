import { GoogleGenerativeAI } from '@google/generative-ai';
import { TOOLS, type ToolItem } from './config.js';
import { generateAiImage, type GeneratedImageResult } from './imageGenerator.js';

export interface BrainResponse {
  type: 'text' | 'image';
  text?: string;
  image?: GeneratedImageResult;
  toolMatched?: string;
}

export class CentralBrainRouter {
  private defaultApiKey: string;

  constructor(defaultApiKey: string = '') {
    this.defaultApiKey = defaultApiKey || process.env.GEMINI_API_KEY || '';
  }

  /**
   * Main entry point to process an incoming self-chat WhatsApp message.
   */
  async processMessage(userMessage: string, customApiKey?: string): Promise<BrainResponse> {
    const query = userMessage.trim();
    if (!query) {
      return {
        type: 'text',
        text: 'Please write a prompt! For example: "Write a Facebook ad for sneakers", "Draft sick leave email to my boss", or "/image a futuristic cybernetic tiger".'
      };
    }

    // 1. Image Generation Intent Check
    if (this.isImageIntent(query)) {
      const imageResult = await generateAiImage(query);
      return {
        type: 'image',
        image: imageResult,
        toolMatched: 'ai_image_generator'
      };
    }

    // 2. Help / Menu Intent Check
    if (this.isHelpIntent(query)) {
      return {
        type: 'text',
        text: this.getHelpMenuText()
      };
    }

    // 3. Match against 50+ Tools Catalog
    const matchedTool = this.findMatchingTool(query);

    // 4. Execute with Gemini Flash
    const apiKey = customApiKey || this.defaultApiKey;
    if (!apiKey) {
      return {
        type: 'text',
        text: `⚠️ *Gemini API Key Missing!*\n\nPlease connect your free Google AI Studio API key in your SuperAI web dashboard, or configure \`GEMINI_API_KEY\` in your engine \`.env\`.\n\n(Get your free key here: https://aistudio.google.com/app/apikey)`
      };
    }

    const aiText = await this.generateGeminiResponse(apiKey, query, matchedTool);
    return {
      type: 'text',
      text: aiText,
      toolMatched: matchedTool?.id
    };
  }

  private isImageIntent(query: string): boolean {
    const lower = query.toLowerCase();
    return (
      lower.startsWith('/image') ||
      lower.startsWith('generate image') ||
      lower.startsWith('draw a ') ||
      lower.startsWith('create photo') ||
      lower.startsWith('generate picture')
    );
  }

  private isHelpIntent(query: string): boolean {
    const clean = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    return ['help', 'menu', 'commands', 'tools', 'start'].includes(clean);
  }

  private findMatchingTool(query: string): ToolItem | undefined {
    const lower = query.toLowerCase();
    for (const tool of TOOLS) {
      for (const kw of tool.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return tool;
        }
      }
    }
    return undefined;
  }

  private async generateGeminiResponse(
    apiKey: string,
    userQuery: string,
    tool?: ToolItem
  ): Promise<string> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      });

      let systemContext = '';
      if (tool) {
        systemContext = `You are a domain expert using the SuperAI Hub tool "${tool.name}" (${tool.nameEn}).
Tool Category: ${tool.categoryName}
Instructions:
${tool.systemPrompt}

Important Formatting Guidelines for WhatsApp:
- Use WhatsApp markdown (*bold*, _italics_, ~strike~, \`\`\`monospace\`\`\`).
- Use appealing bullet points and emojis.
- Write directly in polished, high-converting English.
- Avoid generic filler text. Jump straight into high-value actionable output.`;
      } else {
        systemContext = `You are the Central AI Brain of SuperAI Hub, assisting a user directly inside their WhatsApp self-chat.
You have mastery over E-Commerce sales, social media growth, career communications, and technical workflows.
Format with clean WhatsApp markdown (*bold*, _italics_, emojis, bullet points).
Respond in natural, persuasive, and executive-level English.`;
      }

      const prompt = `${systemContext}\n\nUser Message:\n"${userQuery}"\n\nPlease output the response now:`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return text || 'Sorry, no response was generated. Please try again.';
    } catch (err: any) {
      console.error('Gemini generation error:', err);
      return `❌ *SuperAI Brain Error:* ${err.message || 'Error processing request.'}`;
    }
  }

  private getHelpMenuText(): string {
    return `🤖 *SuperAI Hub - 50+ AI Personal Assistant* 🚀

Message yourself directly in WhatsApp, and our Central Brain automatically selects the right tool to deliver instant results.

📌 *Popular Commands & Usage Examples:*
1️⃣ *E-Commerce & Sales:*
   • "Write a viral Facebook ad copy for oversized cotton T-shirts"
   • "How to respond when customer says price is too high?"
   • "Plan a 20% OFF flash sale campaign"

2️⃣ *Social Media & Content:*
   • \`/image a futuristic cybernetic tiger prowling neon city streets\`
   • "30s viral TikTok script on time management"
   • "YouTube SEO title and tags for SvelteKit tutorial"

3️⃣ *Career & Productivity:*
   • "Draft a professional 3-day sick leave email to my manager"
   • "Rewrite this draft into executive corporate English: [your text]"
   • "Evaluate this IELTS Writing Task-2 essay"

4️⃣ *Technical & Freelancing:*
   • "Excel: Formula to find duplicate values between Column A & B"
   • "Winning Upwork proposal for Full-Stack Developer job"

✨ *Tip:* Send \`/image [prompt]\` at any time to generate high-resolution AI art directly in chat!`;
  }
}
