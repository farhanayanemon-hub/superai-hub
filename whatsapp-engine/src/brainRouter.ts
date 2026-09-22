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
        text: 'অনুগ্রহ করে কিছু লিখুন! যেমন: "ফেসবুক অ্যাড লিখে দাও", "বসের ছুটির ইমেইল", অথবা "/image একটি রোবটের ছবি"।'
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
        text: `⚠️ *Gemini API Key সেট করা নেই!*\n\nদয়া করে ওয়েব ড্যাশবোর্ডে গিয়ে আপনার ফ্রি Google AI Studio API Key যুক্ত করুন অথবা WhatsApp ইঞ্জিনের \`.env\` ফাইলে \`GEMINI_API_KEY\` দিন।\n\n(কীভাবে ফ্রি কী পাবেন: https://aistudio.google.com/app/apikey)`
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
      lower.startsWith('ছবি বানাও') ||
      lower.startsWith('ছবি আঁকো') ||
      lower.startsWith('generate image') ||
      lower.startsWith('draw a ')
    );
  }

  private isHelpIntent(query: string): boolean {
    const clean = query.toLowerCase().replace(/[^a-z0-9বাংলা]/g, '');
    return ['help', 'menu', 'মেনু', 'সাহায্য', 'কমান্ড', 'টুলস'].includes(clean);
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
- Write directly in natural Bengali (or professional English where appropriate).
- Avoid generic filler text. Jump straight into high-value actionable output.`;
      } else {
        systemContext = `You are the Central AI Brain of SuperAI Hub, assisting a user directly inside their WhatsApp self-chat.
You have mastery over F-Commerce sales, social media growth, career communications, and technical workflows.
Format with clean WhatsApp markdown (*bold*, _italics_, emojis, bullet points).
Respond in natural, persuasive, and executive-level Bengali or English matching the user's language.`;
      }

      const prompt = `${systemContext}\n\nUser Message:\n"${userQuery}"\n\nPlease output the response now:`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return text || 'দুঃখিত, কোনো রেসপন্স পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।';
    } catch (err: any) {
      console.error('Gemini generation error:', err);
      return `❌ *SuperAI Brain Error:* ${err.message || 'রিকোয়েস্ট প্রক্রিয়াকরণে সমস্যা হয়েছে।'}`;
    }
  }

  private getHelpMenuText(): string {
    return `🤖 *SuperAI Hub - ৫০+ AI পার্সোনাল অ্যাসিস্ট্যান্ট* 🚀

নিজের WhatsApp ইনবক্সেই যেকোনো মেসেজ লিখে পাঠান, আমাদের সেন্ট্রাল ব্রেন স্বয়ংক্রিয়ভাবে আপনাকে সমাধান দেবে।

📌 *জনপ্রিয় কমান্ড ও ব্যবহারের উদাহরণ:*
1️⃣ *F-Commerce সেলস:*
   • "টি-শার্টের একটা ভাইরাল ফেসবুক অ্যাড লিখে দাও"
   • "কাস্টমার দাম বেশি বললে কী উত্তর দেব?"
   • "ঈদের জন্য ২০% ছাড়ের ক্যাম্পেইন অফার বানাও"

2️⃣ *সোশ্যাল মিডিয়া ও কনটেন্ট:*
   • \`/image a futuristic cybernetic tiger in dhaka street\`
   • "ফ্রিল্যান্সিং নিয়ে ৩০ সেকেন্ডের রিলস স্ক্রিপ্ট"
   • "ইউটিউব ভিডিও এসইও টাইটেল ও ট্যাগস দাও"

3️⃣ *ক্যারিয়ার ও ডেইলি লাইফ:*
   • "বসের কাছে ছুটির প্রফেশনাল ইংরেজি ইমেইল"
   • "বাংলা থেকে কর্পোরেট ইংলিশ: [আপনার কথা]"
   • "IELTS Writing Task-2 এসে চেক করো"

4️⃣ *টেকনিক্যাল ও ফ্রিল্যান্সিং:*
   • "এক্সেল: Column A ও B মিলিয়ে ডুপ্লিকেট খোঁজার ফর্মুলা"
   • "আপওয়ার্কে বিড করার উইনিং কভার লেটার"

✨ *টিপস:* যেকোনো সময় নতুন ছবি তৈরি করতে \`/image [বর্ণনা]\` লিখে পাঠান!`;
  }
}
