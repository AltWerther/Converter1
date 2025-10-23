import React, { useState } from 'react';

// ClipboardIcon component defined within the same file as it's only used here.
const ClipboardIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


interface ConverterInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type: 'text' | 'number';
  error: string | null;
  isBinary?: boolean;
}

const ConverterInput: React.FC<ConverterInputProps> = ({ id, label, value, onChange, placeholder, type, error, isBinary = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      {label && <label htmlFor={id} className="text-lg font-semibold text-gray-300">{label}</label>}
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={onChange as any}
          placeholder={placeholder}
          className={`w-full bg-brand-dark border ${error ? 'border-red-500' : 'border-brand-gray'} rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors duration-200 resize-none ${isBinary ? 'font-mono text-lg break-all' : 'text-xl'}`}
          rows={isBinary ? 4 : 1}
        />
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? <CheckIcon className="w-6 h-6 text-green-400" /> : <ClipboardIcon className="w-6 h-6" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default ConverterInput;