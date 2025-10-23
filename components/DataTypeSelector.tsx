
import React from 'react';
import { DataType } from '../types';

interface DataTypeSelectorProps {
  selectedType: DataType;
  onChange: (type: DataType) => void;
}

const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({ selectedType, onChange }) => {
  return (
    <div>
      <label htmlFor="dataType" className="block text-sm font-medium text-gray-400 mb-2">Data Type</label>
      <select
        id="dataType"
        value={selectedType}
        onChange={(e) => onChange(e.target.value as DataType)}
        className="w-full bg-brand-gray/50 border border-brand-gray rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue sm:text-sm text-white"
      >
        {Object.values(DataType).map(type => (
          <option key={type} value={type} className="bg-brand-light-dark text-white">
            {type}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DataTypeSelector;
