import React from 'react';
import { ConversionHistoryItem } from '../types';
import HistoryItem from './HistoryItem';

interface HistoryListProps {
  history: ConversionHistoryItem[];
  onSelect: (item: ConversionHistoryItem) => void;
  onClear: () => void;
  binaryInputMode: 'binary' | 'hex';
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear, binaryInputMode }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-brand-gray">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Conversion History</h2>
        <button
          onClick={onClear}
          className="text-sm text-red-400 hover:text-red-500 hover:underline transition-colors focus:outline-none"
          aria-label="Clear conversion history"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {history.map(item => (
          <HistoryItem key={item.id} item={item} onSelect={onSelect} binaryInputMode={binaryInputMode} />
        ))}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
};

export default HistoryList;