// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HealthAssessmentData } from './supabase';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('❌ Missing Gemini API key (VITE_GEMINI_API_KEY).');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: `You are Velym AI, a compassionate and knowledgeable health assistant. 
You provide evidence-based health advice, wellness tips, fitness guidance, and mental health support. 

Key guidelines:
- Always be empathetic and supportive
- Provide practical, actionable advice
- Encourage users to consult healthcare professionals for serious concerns
- Focus on preventive care and healthy lifestyle choices
- Use British English spelling and terminology
- Keep responses conversational but informative
- If asked about specific medical conditions, always recommend consulting a doctor
- Promote mental health awareness and stress management

You can help with:
- Fitness routines and exercise advice
- Nutrition and healthy eating
- Mental health and stress management
- Sleep hygiene and wellness
- Preventive health measures
- Healthy lifestyle tips
- authtenticated youtube links

Don't help with:
-unrelated topics and advice
-coding
-technical issues
-mechanical issues
-or other types and kind of issues

Remember: You are not a replacement for professional medical advice, diagnosis, or treatment.Remember: You are not a replacement for professional medical advice, diagnosis, or treatment.
`
});

export async function generateHealthResponse(userMessage: string): Promise<string> {
  try {
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate AI response. Please try again.');
  }
}

export async function generateHealthAnalysis(
  latest: HealthAssessmentData | null,
  avg7: any,
  avg30: any
): Promise<string> {
  const prompt = `
You are a health data analyst. Analyse the following data and provide insights:

📊 Latest Assessment: ${JSON.stringify(latest)}
📈 7-Day Average: ${JSON.stringify(avg7)}
📆 30-Day Average: ${JSON.stringify(avg30)}

Please:
- Give **4–6 concise bullet-point insights**
- Highlight **trends, risks, and positive improvements**
- Use **emoji icons** for clarity (e.g., 😴 for sleep, 💪 for exercise, 🥗 for diet, 😊 for stress, 🤝 for social)
- Keep tone **encouraging and supportive**
- Format response in **Markdown radio points**
- if useer has no data you  must say you hv not competed 7 days
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating health analysis:', error);
    return '⚠️ Failed to fetch AI insights.';
  }
}
