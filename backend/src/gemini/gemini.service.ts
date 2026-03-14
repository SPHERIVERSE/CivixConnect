import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI, ChatSession, Content } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

// Helper function to convert local file to Gemini format
function fileToGenerativePart(filePath: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

@Injectable()
export class GeminiService {
  private ai: GoogleGenerativeAI;
  private chatSessions: Map<string, ChatSession> = new Map(); 

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured.');
    }

    this.ai = new GoogleGenerativeAI(apiKey);
  }

  private getChatSession(sessionId: string): ChatSession {
    if (!this.chatSessions.has(sessionId)) {
      const model = this.ai.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          systemInstruction: "You are Swavi, a helpful chatbot for the Swachh-Vikas smart city cleanliness and waste management platform. Provide concise and informative responses related to civic reports, training, or marketplace activities only.",
      });
      
      const chat = model.startChat({});
      this.chatSessions.set(sessionId, chat);
    }
    return this.chatSessions.get(sessionId)!;
  }

  async sendMessage(sessionId: string, message: string, context?: string): Promise<string> {
    const chat = this.getChatSession(sessionId);
    try {
      let fullMessage = message;
      
      if (context && context.length > 0) {
        fullMessage = `[CONTEXT: Use the following information as primary context for your response: ${context}]\n\nUSER QUERY: ${message}`;
      }

      const response = await chat.sendMessage(fullMessage);
      const responseObj: any = response; 

      const firstCandidate = responseObj.candidates?.[0];
      if (firstCandidate?.finishReason === 'SAFETY' || responseObj.promptFeedback?.blockReason) {
          throw new InternalServerErrorException(
              'AI response was blocked by safety filters. Please try a different or less sensitive query.'
          );
      }

      const text = response.response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || text.length === 0) {
        throw new InternalServerErrorException('No text could be extracted from the AI response.');
      }

      return text;

    } catch (error) {
      console.error('Gemini API Error:', error);
      if (error instanceof InternalServerErrorException) {
          throw error;
      }
      throw new InternalServerErrorException('Could not get a response from the AI.'); 
    }
  }

  /**
   * Multimodal AI Triage: Analyzes text AND the actual image bytes.
   */
  async analyzeCivicReport(input: {
    title: string;
    description?: string;
    type: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    localFilePath?: string;
  }): Promise<{
    detectedType: string | null;
    confidence: number | null;
    severityScore: number | null;
    priority: string | null;
    summary: string | null;
    flaggedAsSpam: boolean;
  }> {
    try {
      const model = this.ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
You are a highly critical and strict AI triage inspector for a city infrastructure platform.
Your job is to verify citizen reports based strictly on visual evidence.

CRITICAL INSTRUCTION:
If an image is attached, you MUST analyze the pixels. If the image clearly DOES NOT match the citizen's selected issue type (for example, a photo of a dog, a selfie, a meme, or a blank screen instead of a broken streetlight or pothole):
1. You MUST set "flaggedAsSpam" to true.
2. You MUST set "detectedType" to "UNKNOWN".
3. You MUST state the discrepancy in the "summary" (e.g., "Image shows a dog, not a streetlight.").
4. You MUST set "severityScore" to 0.

Return a STRICT JSON object with the following shape and NOTHING ELSE:
{
  "detectedType": "one of: illegal_dumping | open_toilet | dirty_toilet | overflow_dustbin | dead_animal | fowl | public_bin_request | public_toilet_request | POTHOLE | BROKEN_STREETLIGHT | ROAD_DAMAGE | WATER_LEAK | FALLEN_TREE | BROKEN_FOOTPATH | UNKNOWN",
  "confidence": 0.0-1.0,
  "severityScore": integer 1-10,
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "summary": "single sentence summary for admins",
  "flaggedAsSpam": true | false
}

Context for this report:
- Title: ${input.title}
- Description: ${input.description ?? 'N/A'}
- Citizen selected type: ${input.type}
- GPS Coordinates: ${input.latitude}, ${input.longitude}
`;

      const promptParts: any[] = [prompt];

      // 👇 ADD THESE LOGS TO DEBUG THE FILE PATH
      console.log('--- AI TRIAGE INITIATED ---');
      console.log('Looking for image at:', input.localFilePath);

      if (input.localFilePath) {
        if (fs.existsSync(input.localFilePath)) {
          console.log('✅ Image found! Attaching to Gemini prompt.');
          const ext = input.localFilePath.split('.').pop()?.toLowerCase();
          const mimeType = ext === 'png' ? 'image/png' : (ext === 'webp' ? 'image/webp' : 'image/jpeg');
          promptParts.push(fileToGenerativePart(input.localFilePath, mimeType));
        } else {
          console.log('❌ ERROR: Image path does not exist on disk:', input.localFilePath);
        }
      } else {
        console.log('⚠️ No localFilePath provided to Gemini service.');
      }

      const response = await model.generateContent(promptParts);
      const text = (response as any).response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (!text) {
        throw new InternalServerErrorException('No text from AI when analyzing civic report.');
      }

      let parsed: any;
      try {
        const jsonText = text.trim().replace(/^[`\s]*json/i, '').replace(/```/g, '');
        parsed = JSON.parse(jsonText);
      } catch (e) {
        throw new InternalServerErrorException('Failed to parse AI civic report analysis JSON.');
      }

      return {
        detectedType: typeof parsed.detectedType === 'string' ? parsed.detectedType : null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null,
        severityScore: typeof parsed.severityScore === 'number' ? parsed.severityScore : null,
        priority: typeof parsed.priority === 'string' ? parsed.priority : null,
        summary: typeof parsed.summary === 'string' ? parsed.summary : null,
        flaggedAsSpam: !!parsed.flaggedAsSpam,
      };
    } catch (error) {
      console.error('Gemini civic analysis error:', error);
      return {
        detectedType: null,
        confidence: null,
        severityScore: null,
        priority: null,
        summary: null,
        flaggedAsSpam: false,
      };
    }
  }

  async compareCivicReports(input: {
    existing: { title: string; description?: string; type: string };
    incoming: { title: string; description?: string; type: string };
  }): Promise<number> {
    try {
      const model = this.ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
You are a strict similarity scoring engine for civic issue reports.
You will receive two reports (existing and incoming) with title, description and type.
Return ONLY a floating-point number between 0.0 and 1.0 representing how likely they are the SAME physical issue.

Existing:
- Title: ${input.existing.title}
- Description: ${input.existing.description ?? 'N/A'}
- Type: ${input.existing.type}

Incoming:
- Title: ${input.incoming.title}
- Description: ${input.incoming.description ?? 'N/A'}
- Type: ${input.incoming.type}

Return format: just the number, e.g. 0.87
`;

      const response = await model.generateContent(prompt);
      const text = (response as any).response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      if (!text) return 0;

      const numeric = parseFloat(text.trim());
      if (Number.isNaN(numeric)) return 0;
      return Math.max(0, Math.min(1, numeric));
    } catch (error) {
      console.error('Gemini civic duplicate compare error:', error);
      return 0;
    }
  }

  async getChatHistory(sessionId: string): Promise<Content[]> {
    const chat = this.getChatSession(sessionId);
    return chat.getHistory();
  }
}