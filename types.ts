export enum DataType {
  Int8 = 'Int8',
  UInt8 = 'UInt8',
  Int16 = 'Int16',
  UInt16 = 'UInt16',
  Int32 = 'Int32',
  UInt32 = 'UInt32',
  Float32 = 'Float32',
  Float64 = 'Float64',
}

// FIX: Define and export the missing ConversionHistoryItem interface.
export interface ConversionHistoryItem {
  id: string;
  decimal: string;
  binary: string;
  dataType: DataType;
  timestamp: number;
}

interface DataTypeDetail {
  bits: number;
  signed: boolean;
  isFloat: boolean;
  min: number;
  max: number;
  description: string;
  example: string;
}

export const DATA_TYPE_DETAILS: Record<DataType, DataTypeDetail> = {
  [DataType.Int8]: { bits: 8, signed: true, isFloat: false, min: -128, max: 127, description: '8-bit signed integer.', example: '11111111' },
  [DataType.UInt8]: { bits: 8, signed: false, isFloat: false, min: 0, max: 255, description: '8-bit unsigned integer.', example: '10000000' },
  [DataType.Int16]: { bits: 16, signed: true, isFloat: false, min: -32768, max: 32767, description: '16-bit signed integer.', example: '1000...0001' },
  [DataType.UInt16]: { bits: 16, signed: false, isFloat: false, min: 0, max: 65535, description: '16-bit unsigned integer.', example: '1111...1111' },
  [DataType.Int32]: { bits: 32, signed: true, isFloat: false, min: -2147483648, max: 2147483647, description: '32-bit signed integer.', example: '0111...1111' },
  [DataType.UInt32]: { bits: 32, signed: false, isFloat: false, min: 0, max: 4294967295, description: '32-bit unsigned integer.', example: '1000...0000' },
  [DataType.Float32]: { bits: 32, signed: true, isFloat: true, min: -3.4e38, max: 3.4e38, description: '32-bit single-precision float (IEEE 754).', example: '0 10000000 1001001...'},
  [DataType.Float64]: { bits: 64, signed: true, isFloat: true, min: -1.8e308, max: 1.8e308, description: '64-bit double-precision float (IEEE 754).', example: '0 100...000 1001...'},
};
