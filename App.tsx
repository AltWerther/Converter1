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
 * Converts a number into a string representation without using scientific notation.
 * @param num The number to convert.
 * @returns A string representing the number in standard decimal notation.
 */
const toNonScientific = (num: number): string => {
    const numStr = String(num);
    if (!numStr.includes('e')) {
        return numStr;
    }

    const match = numStr.match(/^(-?)(\d)\.?(\d*)e([+-]\d+)$/);
    if (!match) {
        return numStr;
    }

    const sign = match[1];
    const intPart = match[2];
    const fracPart = match[3] || '';
    let exp = parseInt(match[4], 10);
    
    let wholeNumStr = intPart + fracPart;

    if (exp > 0) { // Positive exponent
        if (exp >= fracPart.length) {
            wholeNumStr = wholeNumStr.padEnd(wholeNumStr.length + exp - fracPart.length, '0');
        } else {
            wholeNumStr = wholeNumStr.slice(0, exp + 1) + '.' + wholeNumStr.slice(exp + 1);
        }
    } else { // Negative exponent
        exp = -exp;
        wholeNumStr = '0.' + '0'.repeat(exp - 1) + wholeNumStr;
    }

    return sign + wholeNumStr;
};

/**
 * Formats a floating-point number for display, avoiding scientific notation and
 * truncating to a specified number of decimal places.
 * @param num The number to format.
 * @param precision The number of decimal places to keep.
 * @returns The formatted string.
 */
const formatDecimalForDisplay = (num: number, precision: number): string => {
    if (!isFinite(num)) return String(num);
    if (num === 0) return (0).toFixed(precision);

    const fullDecimalString = toNonScientific(num);
    
    const [integerPart, decimalPart = ''] = fullDecimalString.split('.');
    
    if (precision === 0) {
        return integerPart;
    }
    
    const truncatedDecimalPart = decimalPart.substring(0, precision);
    const paddedDecimalPart = truncatedDecimalPart.padEnd(precision, '0');
    
    return `${integerPart}.${paddedDecimalPart}`;
};


const App: React.FC = () => {
  const [dataType, setDataType] = useState<DataType>(DataType.Float32);
  const [decimalValue, setDecimalValue] = useState<string>('');
  const [binaryValue, setBinaryValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [lastChanged, setLastChanged] = useState<'decimal' | 'binary' | null>(null);
  const [binaryInputMode, setBinaryInputMode] = useState<'binary' | 'hex'>('binary');
  const [precision, setPrecision] = useState<number>(7);

  const isFloatType = useMemo(() => DATA_TYPE_DETAILS[dataType].isFloat, [dataType]);

  useEffect(() => {
    if (isFloatType) {
        setPrecision(dataType === DataType.Float32 ? 7 : 15);
    }
  }, [dataType, isFloatType]);

  useEffect(() => {
    if (lastChanged !== 'decimal' && binaryValue && isFloatType) {
        const result = convertBinaryToDecimal(binaryValue, dataType);
        if (typeof result === 'number') {
            const decimalString = formatDecimalForDisplay(result, precision);
            setDecimalValue(decimalString);
        }
    }
  }, [precision, isFloatType, binaryValue, dataType, lastChanged]);

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
  
  const handleBinaryHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setLastChanged('binary');

    if (rawValue === '') {
        setBinaryValue('');
        setDecimalValue('');
        setError(null);
        return;
    }

    let currentBinary = '';
    let hasError = false;

    if (binaryInputMode === 'hex') {
        const hexValue = rawValue.replace(/\s/g, '');
        const binaryResult = convertHexToBinary(hexValue);
        if (typeof binaryResult === 'string') {
            currentBinary = binaryResult;
        } else {
            setError(binaryResult.error);
            hasError = true;
        }
    } else { // binary mode
        let binaryString = rawValue.replace(/\s/g, '');
        if (!/^[01]*$/.test(binaryString)) {
            setError('Invalid binary input');
            hasError = true;
        } else {
            currentBinary = binaryString;
        }
    }

    if (hasError) {
        setBinaryValue('');
        setDecimalValue('');
        return;
    }

    setBinaryValue(currentBinary);
    const result = convertBinaryToDecimal(currentBinary, dataType);
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
  }, [dataType, binaryInputMode, isFloatType, precision]);

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

  const handleModeChange = (mode: 'binary' | 'hex') => {
    if (mode !== binaryInputMode) {
        const currentBinary = binaryValue;
        setBinaryInputMode(mode);
        // re-evaluate decimal from binary when switching, if binary exists
        if(currentBinary) {
            const result = convertBinaryToDecimal(currentBinary, dataType);
            if (typeof result === 'number') {
                const decimalString = isFloatType
                    ? formatDecimalForDisplay(result, precision)
                    : String(result);
                setDecimalValue(decimalString);
            }
        }
    }
  };

  const binaryHexDisplayValue = useMemo(() => {
    if (!binaryValue) return '';
    if (binaryInputMode === 'hex') {
        return formatHexString(convertBinaryToHex(binaryValue));
    }
    return formatBinaryString(binaryValue, dataType);
  }, [binaryInputMode, binaryValue, dataType]);

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 flex flex-col items-center justify-center p-4 font-sans">
      <main className="w-full max-w-4xl mx-auto bg-brand-light-dark rounded-xl shadow-2xl p-6 md:p-10 space-y-8">
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-300">
                    {binaryInputMode === 'binary' ? 'Binary' : 'Hexadecimal'}
                </h2>
                <div className="flex space-x-1 bg-brand-dark p-1 rounded-md">
                    <button
                        onClick={() => handleModeChange('binary')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${binaryInputMode === 'binary' ? 'bg-brand-blue text-white' : 'text-gray-400 hover:bg-brand-gray'}`}
                        aria-pressed={binaryInputMode === 'binary'}
                    >
                        Bin
                    </button>
                    <button
                        onClick={() => handleModeChange('hex')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${binaryInputMode === 'hex' ? 'bg-brand-blue text-white' : 'text-gray-400 hover:bg-brand-gray'}`}
                        aria-pressed={binaryInputMode === 'hex'}
                    >
                        Hex
                    </button>
                </div>
            </div>
            <ConverterInput 
                id="binary-hex-input"
                label=""
                value={binaryHexDisplayValue}
                onChange={handleBinaryHexChange}
                placeholder={binaryInputMode === 'hex' ? `e.g., ${convertBinaryToHex(DATA_TYPE_DETAILS[dataType].example.replace(/\s/g,'').substring(0,8))}...` : `e.g., ${DATA_TYPE_DETAILS[dataType].example}`}
                type="text"
                error={lastChanged === 'binary' ? error : null}
                isBinary={true}
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
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