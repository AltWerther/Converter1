import React from 'react';

interface PrecisionSliderProps {
  precision: number;
  onChange: (precision: number) => void;
  max: number;
}

const PrecisionSlider: React.FC<PrecisionSliderProps> = ({ precision, onChange, max }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="precision-slider" className="flex justify-between text-sm font-medium text-gray-400">
        <span>Decimal Places</span>
        <span className="font-semibold text-white bg-brand-gray px-2 py-0.5 rounded">{precision}</span>
      </label>
      <input
        id="precision-slider"
        type="range"
        min="0"
        max={max}
        value={precision}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-brand-gray rounded-lg appearance-none cursor-pointer custom-slider"
        aria-label="Set number of decimal places for floating-point conversion"
      />
      <style>{`
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #00BFFF;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #2d3748;
        }

        .custom-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #00BFFF;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #2d3748;
        }
      `}</style>
    </div>
  );
};

export default PrecisionSlider;