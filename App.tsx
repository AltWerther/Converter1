
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DataType, DATA_TYPE_DETAILS } from './types';
import { 
  convertDecimalToBinary, 
  convertBinaryToDecimal, 
  formatBinaryString,
  convertHexToBinary,
  convertBinaryToHex,
  formatHexString
} from './services/converterService';
import DataTypeSelector from './components/DataTypeSelector';
import ConverterInput from './components/ConverterInput';
import PrecisionSlider from './components/PrecisionSlider';

/**
 * Formats a floating-point number for display, avoiding scientific notation and
 * rounding to a specified number of decimal places using fixed-point notation.
 * @param num The number to format.
 * @param precision The number of decimal places to keep.
 * @returns The formatted string.
 */
const formatDecimalForDisplay = (num: number, precision: number): string => {
    if (!isFinite(num)) return String(num);
    return num.toFixed(precision);
};

const App: React.FC = () => {
  const [dataType, setDataType] = useState<DataType>(DataType.Float32);
  const [decimalValue, setDecimalValue] = useState<string>('');
  const [binaryValue, setBinaryValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [lastChanged, setLastChanged] = useState<'decimal' | 'binary' | 'hex' | null>(null);
  const [precision, setPrecision] = useState<number>(7);

  const isFloatType = useMemo(() => DATA_TYPE_DETAILS[dataType].isFloat, [dataType]);

  useEffect(() => {
    if (isFloatType) {
        setPrecision(dataType === DataType.Float32 ? 7 : 15);
    }
  }, [dataType, isFloatType]);

  // Sync Decimal Display when Binary changes (unless user is typing in decimal)
  useEffect(() => {
    if (lastChanged !== 'decimal' && binaryValue && isFloatType) {
        const result = convertBinaryToDecimal(binaryValue, dataType);
        if (typeof result === 'number') {
            const decimalString = formatDecimalForDisplay(result, precision);
            setDecimalValue(decimalString);
        }
    }
  }, [binaryValue, dataType, isFloatType, lastChanged]); // precision is intentionally excluded to prevent overwrite on slider change via this effect

  // Update Decimal Display when Precision changes, regardless of source
  useEffect(() => {
    if (isFloatType && binaryValue) {
        const result = convertBinaryToDecimal(binaryValue, dataType);
        if (typeof result === 'number') {
            const decimalString = formatDecimalForDisplay(result, precision);
            setDecimalValue(decimalString);
        }
    }
  }, [precision]); // Only triggers on precision change

  const handleDecimalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDecimalValue(value);
    setLastChanged('decimal');

    const lowerCaseValue = value.toLowerCase();
    if (value === '' || value === '-' || value.endsWith('.') || lowerCaseValue.endsWith('e') || lowerCaseValue.endsWith('e-') || lowerCaseValue.endsWith('e+')) {
      setBinaryValue('');
      setError(null);
      return;
    }

    const num = parseFloat(value);
    if (!isNaN(num)) {
      const result = convertDecimalToBinary(num, dataType);
      if (typeof result === 'string') {
        setBinaryValue(result);
        setError(null);
      } else {
        setBinaryValue('');
        setError(result.error);
      }
    } else {
      setBinaryValue('');
      setError('Invalid decimal input');
    }
  }, [dataType]);
  
  const handleBinaryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setLastChanged('binary');

    if (rawValue === '') {
        setBinaryValue('');
        setDecimalValue('');
        setError(null);
        return;
    }

    const binaryString = rawValue.replace(/\s/g, '');
    if (!/^[01]*$/.test(binaryString)) {
        setBinaryValue('');
        setDecimalValue('');
        setError('Invalid binary input');
        return;
    }
    
    setBinaryValue(binaryString);
    const result = convertBinaryToDecimal(binaryString, dataType);
    if (typeof result === 'number') {
        const decimalString = isFloatType 
            ? formatDecimalForDisplay(result, precision) 
            : String(result);
        
        setDecimalValue(decimalString);
        setError(null);
    } else {
        setDecimalValue('');
        setError(result.error);
    }
  }, [dataType, isFloatType, precision]);

  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setLastChanged('hex');

    if (rawValue === '') {
        setBinaryValue('');
        setDecimalValue('');
        setError(null);
        return;
    }

    const hexValue = rawValue.replace(/\s/g, '');
    const binaryResult = convertHexToBinary(hexValue);
    
    if (typeof binaryResult === 'string') {
        setBinaryValue(binaryResult);
        const decimalResult = convertBinaryToDecimal(binaryResult, dataType);
        if (typeof decimalResult === 'number') {
             const decimalString = isFloatType 
                ? formatDecimalForDisplay(decimalResult, precision) 
                : String(decimalResult);
            setDecimalValue(decimalString);
            setError(null);
        } else {
            setDecimalValue('');
            setError(decimalResult.error);
        }
    } else {
        setBinaryValue('');
        setDecimalValue('');
        setError(binaryResult.error);
    }
  }, [dataType, isFloatType, precision]);

  const clearInputs = () => {
    setDecimalValue('');
    setBinaryValue('');
    setError(null);
    setLastChanged(null);
  };
  
  const handleDataTypeChange = useCallback((newType: DataType) => {
    setDataType(newType);
    clearInputs();
  }, []);

  const binaryDisplayValue = useMemo(() => formatBinaryString(binaryValue, dataType), [binaryValue, dataType]);
  const hexDisplayValue = useMemo(() => formatHexString(convertBinaryToHex(binaryValue)), [binaryValue]);

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 flex flex-col items-center justify-center p-4 font-sans">
      <main className="w-full max-w-5xl mx-auto bg-brand-light-dark rounded-xl shadow-2xl p-6 md:p-10 space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Binary-Decimal Converter</h1>
          <p className="text-gray-400 mt-2 text-lg">Real-time conversion for various data types</p>
        </header>
        
        <div className="space-y-4">
          <div>
            <DataTypeSelector selectedType={dataType} onChange={handleDataTypeChange} />
          </div>
          {isFloatType && (
            <div className="pt-2">
                <PrecisionSlider 
                    precision={precision} 
                    onChange={setPrecision}
                    max={dataType === DataType.Float32 ? 10 : 20}
                />
            </div>
          )}
          <p className="text-sm text-gray-400 text-center">{DATA_TYPE_DETAILS[dataType].description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <ConverterInput 
            id="decimal-input"
            label="Decimal"
            value={decimalValue}
            onChange={handleDecimalChange}
            placeholder="e.g., -123.45 or 6.022e23"
            type="text"
            error={lastChanged === 'decimal' ? error : null}
          />
          
          <div className="space-y-6">
             <ConverterInput 
                id="hex-input"
                label="Hexadecimal"
                value={hexDisplayValue}
                onChange={handleHexChange}
                placeholder={`e.g., ${convertBinaryToHex(DATA_TYPE_DETAILS[dataType].example.replace(/\s/g,''))}`}
                type="text"
                error={lastChanged === 'hex' ? error : null}
                isBinary={true}
                rows={1}
            />
            <ConverterInput 
                id="binary-input"
                label="Binary"
                value={binaryDisplayValue}
                onChange={handleBinaryChange}
                placeholder={`e.g., ${DATA_TYPE_DETAILS[dataType].example}`}
                type="text"
                error={lastChanged === 'binary' ? error : null}
                isBinary={true}
                rows={4}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={clearInputs}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-8 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-light-dark focus:ring-red-500"
            aria-label="Clear inputs"
          >
            Clear
          </button>
        </div>

      </main>
      <footer className="text-center mt-8 text-gray-500">
        <p>Built for precision and performance.</p>
      </footer>
    </div>
  );
};

export default App;
