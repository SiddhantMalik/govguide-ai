import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function explainText(text: string, context: string = "") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explain this government/legal term in very simple, plain language for a citizen. 
      Term: "${text}"
      Context: ${context}
      Keep it under 3 sentences. Avoid jargon.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't explain that right now.";
  }
}

export async function getMockInterviewResponse(history: { role: string; parts: { text: string }[] }[], message: string) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a helpful social worker helping a citizen prepare for a government benefits interview. Ask one question at a time. Be encouraging and clear. Help them understand what documents they might need based on their answers.",
      }
    });
    
    // Note: In a real extension, we'd pass history correctly. 
    // For this demo, we'll just send the message.
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    return "I'm having trouble connecting to the interview prep service.";
  }
}
