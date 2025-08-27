import React, { useState, useCallback, FormEvent } from 'react';
import { InterviewState, type ChatMessage, type InterviewDetails } from './types';
import * as geminiService from './services/geminiService';
import SetupForm from './components/SetupForm';
import ChatWindow from './components/ChatWindow';
import FeedbackReport from './components/FeedbackReport';

const App: React.FC = () => {
    const [interviewState, setInterviewState] = useState<InterviewState>(InterviewState.SETUP);
    const [details, setDetails] = useState<Omit<InterviewDetails, 'interviewerName'> | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [feedback, setFeedback] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');

    const handleStartInterview = useCallback(async (interviewDetails: Omit<InterviewDetails, 'interviewerName'>) => {
        setError(null); // Clear previous errors on a new attempt

        const { companyName, companyUrl } = interviewDetails;

        // Automatically prepend https:// if the protocol is missing
        let fullUrl = companyUrl;
        if (!/^https?:\/\//i.test(companyUrl)) {
            fullUrl = `https://${companyUrl}`;
        }

        try {
            const hostname = new URL(fullUrl).hostname.toLowerCase();
            const companyWords = companyName.toLowerCase()
                .replace(/[,.]/g, '') // remove commas and periods
                .split(/\s+/)
                // Filter out common business suffixes and articles
                .filter(word => !['the', 'a', 'an', 'and', 'co', 'corp', 'corporation', 'inc', 'ltd', 'llc', '&'].includes(word) && word.length > 1);

            if (companyWords.length === 0 && companyName.length > 0) {
                setError("Please provide a more specific company name.");
                return;
            }

            // Check 1: See if any significant word from the company name is in the URL's hostname.
            const significantWordInUrl = companyWords.some(word => hostname.includes(word));
            
            // Check 2: Check for an acronym.
            let acronymInUrl = false;
            if (companyWords.length > 1) { // Only form acronyms for multi-word names
                const acronym = companyWords.map(word => word[0]).join('');
                if (acronym.length > 1) { // Only check for acronyms of 2 or more letters
                    acronymInUrl = hostname.includes(acronym);
                }
            }

            if (!significantWordInUrl && !acronymInUrl && companyWords.length > 0) {
                setError("The company name doesn't seem to match the URL. Please double-check the company's homepage URL.");
                return;
            }
        } catch (e) {
            setError("The provided URL is not valid. Please enter a valid URL like 'https://company.com'.");
            return;
        }

        setIsLoading(true);
        // Use the validated and potentially corrected URL
        const fullDetails: InterviewDetails = { ...interviewDetails, companyUrl: fullUrl };
        setDetails(fullDetails);
        geminiService.startChatSession(fullDetails);
        const firstQuestion = await geminiService.getFirstQuestion(fullDetails);
        if (firstQuestion.includes("error")) {
            setError(firstQuestion);
            setInterviewState(InterviewState.SETUP);
        } else {
            setChatHistory([{ speaker: 'ai', text: firstQuestion }]);
            setInterviewState(InterviewState.INTERVIEWING);
        }
        setIsLoading(false);
    }, []);

    const handleSendMessage = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { speaker: 'user', text: userInput };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        const response = await geminiService.getFollowUpQuestion(userInput);
        const aiResponse: ChatMessage = { speaker: 'ai', text: response };
        setChatHistory(prev => [...prev, aiResponse]);
        setIsLoading(false);
    }, [userInput, isLoading]);

    const handleEndInterview = useCallback(async () => {
        if (!details) return;
        setInterviewState(InterviewState.LOADING_FEEDBACK);
        const finalFeedback = await geminiService.getFeedback(chatHistory, details);
        setFeedback(finalFeedback);
        setInterviewState(InterviewState.FEEDBACK);
    }, [chatHistory, details]);

    const handleStartNew = () => {
        setInterviewState(InterviewState.SETUP);
        setDetails(null);
        setChatHistory([]);
        setFeedback('');
        setError(null);
    };

    const renderContent = () => {
        switch (interviewState) {
            case InterviewState.SETUP:
                return (
                    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
                        <header className="text-center mb-8">
                            <h1 className="text-5xl font-extrabold text-slate-800">ProView AI</h1>
                            <p className="text-lg text-slate-600 mt-2">Your Personal AI Interview Coach</p>
                        </header>
                        <SetupForm onStartInterview={handleStartInterview} isLoading={isLoading} />
                        {error && <p className="mt-4 text-red-600">{error}</p>}
                    </div>
                );
            case InterviewState.INTERVIEWING:
                return (
                    <div className="w-full h-screen flex flex-col bg-white">
                        <header className="bg-[#5D3EBE] text-white p-4 shadow-md text-center z-10">
                            <h1 className="text-xl font-bold">{details?.companyName}</h1>
                            <p className="text-sm opacity-90">Interview for {details?.jobRole}</p>
                        </header>
                        <div className="flex-grow flex flex-col overflow-hidden">
                            <ChatWindow messages={chatHistory} />
                            <div className="p-4 bg-white border-t border-slate-200">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder={isLoading ? "Thinking..." : "Type your answer..."}
                                        className="flex-grow px-4 py-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-[#5D3EBE] focus:outline-none transition"
                                        disabled={isLoading}
                                    />
                                    <button type="submit" className="bg-[#5D3EBE] text-white rounded-full p-3 hover:bg-[#4C3299] disabled:bg-slate-400 transition-colors flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                    </button>
                                </form>
                                <button
                                    onClick={handleEndInterview}
                                    className="w-full mt-3 bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    End Interview & Get Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case InterviewState.LOADING_FEEDBACK:
                return (
                    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100 text-center">
                        <svg className="animate-spin h-12 w-12 text-[#5D3EBE] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h2 className="text-2xl font-semibold text-slate-700">Analyzing your performance...</h2>
                        <p className="text-slate-500 mt-2">Generating your detailed feedback report.</p>
                    </div>
                );
            case InterviewState.FEEDBACK:
                return (
                    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-100">
                      <FeedbackReport feedback={feedback} onStartNew={handleStartNew} />
                    </div>
                );
        }
    };

    return <main>{renderContent()}</main>;
};

export default App;