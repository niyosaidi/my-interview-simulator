
import React, { useState } from 'react';
import { type InterviewDetails } from '../types';

interface SetupFormProps {
  onStartInterview: (details: Omit<InterviewDetails, 'interviewerName'>) => void;
  isLoading: boolean;
}

const InputField: React.FC<{
  id: keyof Omit<InterviewDetails, 'interviewerName'>;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}> = ({ id, label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-[#5D3EBE] focus:border-[#5D3EBE] transition"
      required
    />
  </div>
);

const SetupForm: React.FC<SetupFormProps> = ({ onStartInterview, isLoading }) => {
  const [details, setDetails] = useState<Omit<InterviewDetails, 'interviewerName'>>({
    companyName: '',
    jobRole: '',
    companyUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartInterview(details);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Interview Setup</h2>
      <p className="text-center text-slate-500 mb-6">Enter the details to begin your simulation.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField id="companyName" label="Company Name" value={details.companyName} onChange={handleChange} placeholder="e.g., Innovate Inc." />
        <InputField id="jobRole" label="Job Role" value={details.jobRole} onChange={handleChange} placeholder="e.g., Senior Software Engineer" />
        <InputField id="companyUrl" label="Company Homepage URL" value={details.companyUrl} onChange={handleChange} placeholder="e.g., https://innovate.com" type="url" />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#5D3EBE] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#4C3299] transition-colors duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Start Interview'}
        </button>
      </form>
    </div>
  );
};

export default SetupForm;