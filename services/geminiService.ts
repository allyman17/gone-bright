import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { HueLight } from "../types";

// We need a reference to the active HueService to execute tools
import { HueService } from "./hueService";

// Define the tool for Gemini
const setLightStateTool: FunctionDeclaration = {
  name: 'set_light_state',
  description: 'Control a specific light or all lights. Can turn on/off, set brightness, and set color.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      lightName: {
        type: Type.STRING,
        description: 'The name of the light to control. Use "all" to control all lights.'
      },
      on: {
        type: Type.BOOLEAN,
        description: 'Whether to turn the light on (true) or off (false).'
      },
      brightness: {
        type: Type.NUMBER,
        description: 'Brightness level from 0 to 100.'
      },
      colorName: {
        type: Type.STRING,
        description: 'Color name (e.g., red, blue, warm, cool, white).'
      }
    },
    required: ['lightName']
  }
};

export class GeminiAssistant {
  private ai: GoogleGenAI;
  private hueService: HueService;
  private lightsCache: HueLight[];

  constructor(hueService: HueService, lights: HueLight[]) {
    this.hueService = hueService;
    this.lightsCache = lights;
    // Using process.env.API_KEY as per instructions
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async processUserRequest(userPrompt: string): Promise<string> {
    try {
      // 1. Contextualize the prompt with current state
      const lightNames = this.lightsCache.map(l => l.metadata.name).join(', ');
      
      const systemInstruction = `You are Gone Bright , a smart home assistant. 
      You have access to the following lights: ${lightNames}.
      If the user asks to change lights, use the 'set_light_state' tool.
      If the user just wants to chat, reply helpfully.
      Keep responses concise and friendly.`;

      // 2. Call Gemini with Tools
      const model = 'gemini-2.5-flash';
      const result = await this.ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
            systemInstruction,
            tools: [{ functionDeclarations: [setLightStateTool] }],
        }
      });

      // 3. Handle Tool Calls or Text Response
      // Check for function calls
      const functionCalls = result.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        let responseText = "";
        
        for (const call of functionCalls) {
            if (call.name === 'set_light_state') {
                const args = call.args as any;
                const resultMsg = await this.executeLightCommand(args);
                responseText += resultMsg + " ";
            }
        }
        
        // Optional: Send tool result back to model for a natural summary, 
        // but for latency, we can just return the confirmation.
        return responseText || "Done.";
      }

      return result.text || "I didn't understand that.";

    } catch (error) {
      console.error("Gemini Error:", error);
      return "Sorry, I had trouble connecting to the AI brain.";
    }
  }

  private async executeLightCommand(args: { lightName: string, on?: boolean, brightness?: number, colorName?: string }): Promise<string> {
    const { lightName, on, brightness, colorName } = args;
    
    // Filter lights
    const targetLights = lightName.toLowerCase() === 'all' 
        ? this.lightsCache 
        : this.lightsCache.filter(l => l.metadata.name.toLowerCase().includes(lightName.toLowerCase()));

    if (targetLights.length === 0) return `I couldn't find a light named "${lightName}".`;

    const payload: any = {};
    if (on !== undefined) payload.on = { on };
    if (brightness !== undefined) payload.dimming = { brightness };
    if (colorName) {
        // Basic color mapping
        const colors: Record<string, { x: number, y: number }> = {
            red: { x: 0.67, y: 0.32 },
            green: { x: 0.41, y: 0.52 },
            blue: { x: 0.17, y: 0.04 },
            warm: { x: 0.46, y: 0.41 },
            cool: { x: 0.31, y: 0.33 },
            white: { x: 0.32, y: 0.33 },
            purple: { x: 0.27, y: 0.13 },
            orange: { x: 0.56, y: 0.40 }
        };
        const c = colors[colorName.toLowerCase()];
        if (c) payload.color = { xy: c };
    }

    // Execute updates
    const promises = targetLights.map(l => this.hueService.updateLight(l.id, payload));
    await Promise.all(promises);

    const actionDesc = [
        on !== undefined ? (on ? 'turned on' : 'turned off') : '',
        brightness !== undefined ? `set to ${brightness}%` : '',
        colorName ? `changed to ${colorName}` : ''
    ].filter(Boolean).join(', ');

    return `OK, ${lightName} ${actionDesc}.`;
  }
}
