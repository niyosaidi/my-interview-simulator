
import { GoogleGenAI, Chat } from "@google/genai";
import { type ChatMessage, type InterviewDetails } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

let chat: Chat | null = null;

const getSystemInstruction = (details: InterviewDetails): string => {
    return `You are a senior hiring manager at ${details.companyName} with over 10 years of industry experience. Your goal is to interview a candidate for the ${details.jobRole} position. 
    Analyze the candidate's responses carefully and ask relevant, insightful follow-up questions to gauge their skills, experience, and cultural fit. 
    Maintain a professional, thoughtful, and slightly critical tone, consistent with a senior manager at a company like ${details.companyName} (which has a website at ${details.companyUrl}). 
    Your questions should be open-ended and dig deeper into the candidate's previous statements. Do not greet or make small talk, just ask the question.
    **Keep your questions concise and to the point, ideally one to two sentences maximum.**`;
};

export const startChatSession = (details: InterviewDetails): void => {
    chat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: getSystemInstruction(details),
        }
    });
};


export const getFirstQuestion = async (details: InterviewDetails): Promise<string> => {
    try {
        if (!chat) {
            startChatSession(details);
        }
        const firstPrompt = `Start the interview with a strong, open-ended question relevant to the ${details.jobRole} role at ${details.companyName}.`;
        const response = await chat!.sendMessage({ message: firstPrompt });
        return response.text;
    } catch (error) {
        console.error("Error getting first question:", error);
        return "I seem to be having trouble connecting. Let's try starting over.";
    }
};

export const getFollowUpQuestion = async (message: string): Promise<string> => {
    if (!chat) {
        return "The interview session has not been started. Please start over.";
    }
    try {
        const response = await chat.sendMessage({ message: message });
        return response.text;
    } catch (error) {
        console.error("Error getting follow-up question:", error);
        return "An error occurred. Please try again or end the interview.";
    }
};

export const getFeedback = async (chatHistory: ChatMessage[], details: InterviewDetails): Promise<string> => {
    const transcript = chatHistory
        .map(msg => `${msg.speaker === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.text}`)
        .join('\n\n');

    const feedbackPrompt = `
        You are an expert career coach providing feedback on a job interview for a ${details.jobRole} position at ${details.companyName}.
        Based on the interview transcript below, write a comprehensive feedback report for the candidate.
        Use an encouraging yet professional tone. Reference specific things the candidate said.
        Format the report into three distinct sections with the exact following bolded titles.
        IMPORTANT: Do not use any bolding, italics, or other markdown in the content of the sections. Bolding is ONLY for the three section titles.

        ---
        TRANSCRIPT:
        ${transcript}
        ---

        FEEDBACK REPORT:
        **Overall Assessment**
        Provide a narrative summary here. The text must be plain.

        **Key Strengths**
        Use a bulleted list. Each bullet point MUST start with a hyphen '-'. The text for each point must be plain.

        **Areas for Improvement**
        Use a bulleted list. Each bullet point MUST start with a hyphen '-'. The text for each point must be plain.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: feedbackPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating feedback:", error);
        return "There was an error generating your feedback. Please try again later.";
    }
};
