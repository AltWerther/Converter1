import React from 'react';
import { ConversionHistoryItem } from '../types';
import { formatBinaryString, convertBinaryToHex, formatHexString } from '../services/converterService';

interface HistoryItemProps {
  item: ConversionHistoryItem;
  onSelect: (item: ConversionHistoryItem) => void;
  binaryInputMode: 'binary' | 'hex';
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onSelect, binaryInputMode }) => {
  const isHexMode = binaryInputMode === 'hex';
  const displayLabel = isHexMode ? 'Hexadecimal' : 'Binary';
  const displayValue = isHexMode
    ? formatHexString(convertBinaryToHex(item.binary))
    : formatBinaryString(item.binary, item.dataType);

  return (
    <button 
      onClick={() => onSelect(item)} 
      className="w-full text-left p-3 rounded-lg bg-brand-dark hover:bg-brand-gray/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
      aria-label={`Select conversion for decimal ${item.decimal}`}
    >
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="font-semibold bg-brand-gray text-gray-200 px-2 py-0.5 rounded">{item.dataType}</span>
        <span className="text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
        <div className="truncate">
          <p className="text-xs text-gray-400">Decimal</p>
          <p className="font-mono">{item.decimal}</p>
        </div>
        <div className="truncate">
          <p className="text-xs text-gray-400">{displayLabel}</p>
          <p className="font-mono">{displayValue}</p>
        </div>
      </div>
    </button>
  );
};

export default HistoryItem;