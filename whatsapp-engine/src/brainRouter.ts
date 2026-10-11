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
   * Powered by the Master AI CEO Orchestrator + 75 Business & Freelancer AI Helpers (#01-#75).
   */
  async processMessage(userMessage: string, customApiKey?: string): Promise<BrainResponse> {
    const query = userMessage.trim();
    if (!query) {
      return {
        type: 'text',
        text: '👑 *EzboAgents Master AI CEO*\n\nSend any instruction in plain language, or use `#01` to `#75` to invoke a specific AI Helper! Examples:\n• `#01 Write a Facebook ad for a clothing brand`\n• `#24 Humanize this AI text`\n• `#34 Luxury perfume commercial photo`'
      };
    }

    // Enforce strict separation: Autonomous Store Agents are Web-Only and cannot be controlled via WhatsApp
    if (
      query.toLowerCase().startsWith('/store') ||
      query.toLowerCase().includes('store agent')
    ) {
      return {
        type: 'text',
        text: `🔒 *Autonomous Store Agents Notice*\n\nAgents unlocked from the *Agents Store* operate as standalone *Autonomous Agents*. They must be configured and used directly inside the Web Dashboard (https://ezboagents.com/dashboard) and cannot be controlled via WhatsApp or Telegram.\n\nHowever, you can control the *Master AI CEO* and all *75 AI Helpers (#01–#75)* right here in WhatsApp!`
      };
    }

    // 1. Image Generation Intent Check (#34 / #35 or /image)
    if (this.isImageIntent(query)) {
      const cleanPrompt = query.replace(/^#3[45]\s*/i, '');
      const imageResult = await generateAiImage(cleanPrompt);
      return {
        type: 'image',
        image: imageResult,
        toolMatched: 'ai_commercial_image_gen'
      };
    }

    // 2. Help / Menu / Helpers List Intent Check
    if (this.isHelpIntent(query)) {
      return {
        type: 'text',
        text: this.getHelpMenuText()
      };
    }

    // 3. Match against 75 AI Helpers Catalog (#01-#75 or keyword)
    const matchedTool = this.findMatchingTool(query);

    // 4. Execute with Gemini
    const apiKey = customApiKey || this.defaultApiKey;
    if (!apiKey) {
      return {
        type: 'text',
        text: `⚠️ *Gemini API Key Missing!*\n\nPlease connect your free Google AI Studio API key in the API Vault tab of your EzboAgents web dashboard.\n\n👉 Get your free key: https://aistudio.google.com/app/apikey`
      };
    }

    const aiText = await this.generateGeminiResponse(apiKey, query, matchedTool);
    return {
      type: 'text',
      text: aiText,
      toolMatched: matchedTool ? `${matchedTool.code || ''} ${matchedTool.name}`.trim() : 'ai_ceo'
    };
  }

  private isImageIntent(query: string): boolean {
    const lower = query.toLowerCase();
    return (
      lower.startsWith('/image') ||
      lower.startsWith('#34 ') ||
      lower.startsWith('#35 ') ||
      lower.startsWith('generate image') ||
      lower.startsWith('draw a ') ||
      lower.startsWith('create photo') ||
      lower.startsWith('generate picture')
    );
  }

  private isHelpIntent(query: string): boolean {
    const clean = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    return ['help', 'menu', 'commands', 'tools', 'helpers', 'ceo', 'start'].includes(clean);
  }

  private findMatchingTool(query: string): ToolItem | undefined {
    const codeMatch = query.match(/#(\d{1,2})\b/);
    if (codeMatch) {
      const targetCode = `#${codeMatch[1].padStart(2, '0')}`;
      const byCode = TOOLS.find((t) => t.code === targetCode);
      if (byCode) return byCode;
    }

    const lower = query.toLowerCase();
    for (const tool of TOOLS) {
      for (const kw of tool.keywords || []) {
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
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      });

      let systemContext = '';
      if (tool) {
        systemContext = `You are the Master AI CEO of EzboAgents, delegating this task to specialist helper [${tool.code || ''}] "${tool.name}" (${tool.categoryName}).
Begin your response with:
"⚡ *AI CEO → Delegated to [${tool.code || ''}] ${tool.name}*"

Helper Instructions:
${tool.systemPrompt}

Formatting Guidelines for WhatsApp:
- Use clean WhatsApp markdown (*bold*, _italics_, bullet points).
- Respond in the language requested by the user.
- Jump straight into high-value, copy-paste ready output.`;
      } else {
        systemContext = `You are the Master AI CEO of EzboAgents, controlling 75 specialized Business, Marketing & Freelancer AI Helpers (#01 to #75) directly inside the user's WhatsApp.
Format with clean WhatsApp markdown (*bold*, _italics_, emojis, bullet points).
Respond with executive, ready-to-use output.`;
      }

      const prompt = `${systemContext}\n\nUser Message:\n"${userQuery}"\n\nPlease output the response now:`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return text || 'Sorry, no response was generated. Please try again.';
    } catch (err: any) {
      console.error('Gemini generation error:', err);
      return `❌ *AI CEO Brain Error:* ${err.message || 'Error processing request.'}`;
    }
  }

  private getHelpMenuText(): string {
    return `👑 *EzboAgents — 1 Master AI CEO + 75 AI Helpers* 🚀

Simply write any task in plain language — the *Master AI CEO* will automatically select and command the right specialist from all 75 helpers!

📌 *7 Categories & Codes (#01 to #75):*
1️⃣ *Ads & Marketing (#01–#12):* FB/IG Ads (#01), Google Ads (#02), TikTok Script (#03), Target Audience (#04), 360° Marketing (#05)
2️⃣ *Social Media & Content (#13–#23):* Post Ideas (#13), 30-Day Calendar (#14), Viral Hooks (#15), Captions (#16), YouTube Script (#19)
3️⃣ *Writing & AI Humanizer (#24–#33):* 100% Humanizer (#24), Grammar (#25), Paraphraser (#26), Business Translator (#28)
4️⃣ *Image, Logo & Design (#34–#41):* Commercial Image Gen (#34), Business Logo Gen (#35), Thumbnail (#37), Poster (#38)
5️⃣ *SEO & Traffic (#42–#50):* Keyword Research (#42), SEO Blog (#43), E-Com Product SEO (#45)
6️⃣ *Freelancing (#51–#62):* Upwork Proposal (#51), Fiverr Gig SEO (#52), Client Closer (#53), Price Negotiation (#54)
7️⃣ *Business & Productivity (#63–#75):* Time Management (#63), Inbox Sales (#64), Excel Formula (#66), Profit Calculator (#67)

✨ *Examples:*
• \`#01 Write a high-converting Facebook ad copy for a clothing brand\`
• \`#24 Humanize this paragraph: [your text]\`
• \`#34 Luxury watch product photography on marble\`

🔒 *Note:* Autonomous Agents from the Agents Store are configured and used exclusively on the Web Dashboard and cannot be controlled via WhatsApp or Telegram.`;
  }
}
