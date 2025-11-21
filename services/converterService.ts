import { DataType, DATA_TYPE_DETAILS } from '../types';

type ConversionResult = string | { error: string };
type NumberConversionResult = number | { error:string };

export function formatBinaryString(binary: string, dataType: DataType): string {
    if (!binary) return '';
    const { isFloat } = DATA_TYPE_DETAILS[dataType];

    if (isFloat) {
        const signBitEnd = 1;
        const exponentLength = dataType === DataType.Float32 ? 8 : 11;
        const exponentEnd = signBitEnd + exponentLength;
        
        const sign = binary.substring(0, signBitEnd);
        const exponent = binary.substring(signBitEnd, exponentEnd);
        const mantissa = binary.substring(exponentEnd);

        // Filters out empty parts if the binary string is incomplete, joining only the available parts.
        return [sign, exponent, mantissa].filter(Boolean).join(' ');

    } else {
        const parts: string[] = [];
        // Group by 8 for integers
        for (let i = binary.length; i > 0; i -= 8) {
            parts.unshift(binary.substring(Math.max(0, i - 8), i));
        }
        return parts.join(' ');
    }
}

export function formatHexString(hex: string): string {
    if (!hex) return '';
    const parts: string[] = [];
    // Group by 2 characters (1 byte)
    for (let i = 0; i < hex.length; i += 2) {
        parts.push(hex.substring(i, i + 2));
    }
    return parts.join(' ');
}

export function convertBinaryToHex(binary: string): string {
    if (!binary || !/^[01]+$/.test(binary)) return '';
    
    // Pad left to ensure length is multiple of 4 so grouping is correct for the integer value
    const remainder = binary.length % 4;
    const padding = remainder === 0 ? 0 : 4 - remainder;
    const padded = binary.padStart(binary.length + padding, '0');
    
    let hex = '';
    for (let i = 0; i < padded.length; i += 4) {
        const chunk = padded.substring(i, i + 4);
        hex += parseInt(chunk, 2).toString(16).toUpperCase();
    }
    return hex;
}

export function convertHexToBinary(hex: string): ConversionResult {
    const sanitizedHex = hex.replace(/\s/g, '');
    if (!/^[0-9a-fA-F]*$/.test(sanitizedHex)) {
        return { error: 'Invalid hexadecimal string.' };
    }
    
    let binary = '';
    for (let i = 0; i < sanitizedHex.length; i++) {
        binary += parseInt(sanitizedHex[i], 16).toString(2).padStart(4, '0');
    }
    return binary;
}


export function convertDecimalToBinary(decimal: number, dataType: DataType): ConversionResult {
    const details = DATA_TYPE_DETAILS[dataType];

    if (!details.isFloat) {
        if (!Number.isInteger(decimal)) {
            return { error: 'Only integers are allowed for this data type.' };
        }
        if (decimal < details.min || decimal > details.max) {
            return { error: `Value out of range for ${dataType}.` };
        }

        let binary;
        if (details.signed && decimal < 0) {
            binary = (decimal + Math.pow(2, details.bits)).toString(2);
        } else {
            binary = decimal.toString(2);
        }
        
        return binary.padStart(details.bits, '0');
    }

    // Floating point conversion using ArrayBuffer and DataView
    const buffer = new ArrayBuffer(details.bits / 8);
    const view = new DataView(buffer);
    
    try {
        if (dataType === DataType.Float32) {
            view.setFloat32(0, decimal, false); // big-endian
        } else { // Float64
            view.setFloat64(0, decimal, false); // big-endian
        }
    } catch (e) {
        return { error: 'Invalid floating point number.' };
    }

    let binaryString = '';
    for (let i = 0; i < details.bits / 8; i++) {
        binaryString += view.getUint8(i).toString(2).padStart(8, '0');
    }

    return binaryString;
}

export function convertBinaryToDecimal(binary: string, dataType: DataType): NumberConversionResult {
    const details = DATA_TYPE_DETAILS[dataType];

    if (!/^[01]+$/.test(binary)) {
        return { error: 'Invalid binary string.' };
    }

    if (binary.length > details.bits) {
        return { error: `Binary string exceeds ${details.bits} bits for ${dataType}.` };
    }

    // Pad with leading zeros to ensure correct bit length for processing.
    // This right-aligns the bits, treating the input as the integer value of the bit pattern.
    const paddedBinary = binary.padStart(details.bits, '0');

    if (!details.isFloat) {
        const value = parseInt(paddedBinary, 2);
        // Check sign bit on the full width binary
        if (details.signed && paddedBinary[0] === '1') {
            return value - Math.pow(2, details.bits);
        }
        return value;
    }

    // Floating point conversion
    const buffer = new ArrayBuffer(details.bits / 8);
    const view = new DataView(buffer);
    
    // We construct the buffer byte by byte from the binary string.
    // Since the DataView reads as Big Endian (Network Byte Order), 
    // we map the first 8 bits of our string to the first byte (index 0), and so on.
    for (let i = 0; i < details.bits / 8; i++) {
        const byte = paddedBinary.substring(i * 8, (i + 1) * 8);
        view.setUint8(i, parseInt(byte, 2));
    }
    
    if (dataType === DataType.Float32) {
        return view.getFloat32(0, false); // big-endian
    } else { // Float64
        return view.getFloat64(0, false); // big-endian
    }
}
