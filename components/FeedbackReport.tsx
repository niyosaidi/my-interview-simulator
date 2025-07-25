
import React from 'react';

interface FeedbackReportProps {
  feedback: string;
  onStartNew: () => void;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ feedback, onStartNew }) => {
  const renderFormattedText = (text: string) => {
    const sections = text.split(/\*\*(Overall Assessment|Key Strengths|Areas for Improvement)\*\*/).filter(s => s.trim() !== '');
    
    if (sections.length === 0 && text) {
        return <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{text}</p>;
    }

    return sections.map((section, index) => {
      if (index % 2 === 0) { // This is a title
        return <h3 key={index} className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 mt-6">{section.trim()}</h3>;
      }
      
      // This is content
      const content = section.trim();
      const prevTitle = sections[index-1];

      if (prevTitle.includes('Strengths') || prevTitle.includes('Improvement')) {
        const points = content.split(/[\n-]/).map(p => p.trim()).filter(Boolean);
        return (
          <ul key={index} className="list-disc list-outside pl-5 space-y-2 text-slate-800">
            {points.map((point, i) => <li key={i}>{point.replace(/^\*/, '').trim()}</li>)}
          </ul>
        );
      }
      
      return (
        <p key={index} className="text-slate-800 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-xl animate-fade-in">
      <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-8">Interview Feedback Report</h2>
      <div className="max-w-none">
        {renderFormattedText(feedback)}
      </div>
      <div className="text-center mt-12">
        <button
          onClick={onStartNew}
          className="bg-[#5D3EBE] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#4C3299] transition-transform transform hover:scale-105"
        >
          Start New Interview
        </button>
      </div>
    </div>
  );
};

export default FeedbackReport;
