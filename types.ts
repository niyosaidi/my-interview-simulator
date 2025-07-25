
export enum InterviewState {
  SETUP = 'SETUP',
  INTERVIEWING = 'INTERVIEWING',
  LOADING_FEEDBACK = 'LOADING_FEEDBACK',
  FEEDBACK = 'FEEDBACK',
}

export interface ChatMessage {
  speaker: 'user' | 'ai';
  text: string;
}

export interface InterviewDetails {
  companyName: string;
  jobRole: string;
  companyUrl: string;
}