
export const pythonScriptTemplate = `import struct
import sys

# Configuration for supported data types
DATA_TYPE_DETAILS = {
    'Int8': {'bits': 8, 'signed': True, 'is_float': False, 'min': -128, 'max': 127},
    'UInt8': {'bits': 8, 'signed': False, 'is_float': False, 'min': 0, 'max': 255},
    'Int16': {'bits': 16, 'signed': True, 'is_float': False, 'min': -32768, 'max': 32767},
    'UInt16': {'bits': 16, 'signed': False, 'is_float': False, 'min': 0, 'max': 65535},
    'Int32': {'bits': 32, 'signed': True, 'is_float': False, 'min': -2147483648, 'max': 2147483647},
    'UInt32': {'bits': 32, 'signed': False, 'is_float': False, 'min': 0, 'max': 4294967295},
    'Float32': {'bits': 32, 'signed': True, 'is_float': True},
    'Float64': {'bits': 64, 'signed': True, 'is_float': True},
}

def format_binary(binary_str, data_type):
    """Formats binary string with spaces for readability."""
    details = DATA_TYPE_DETAILS.get(data_type)
    if not details: return binary_str
    
    if details['is_float']:
        # IEEE 754 Formatting
        if data_type == 'Float32':
            # 1 bit sign, 8 bits exponent, 23 bits mantissa
            return f"{binary_str[0]} {binary_str[1:9]} {binary_str[9:]}"
        else: # Float64
            # 1 bit sign, 11 bits exponent, 52 bits mantissa
            return f"{binary_str[0]} {binary_str[1:12]} {binary_str[12:]}"
    else:
        # Integer Formatting: Group by 8 bits (1 byte)
        return ' '.join(binary_str[i:i+8] for i in range(0, len(binary_str), 8))

def decimal_to_binary(decimal_str, data_type):
    """Converts a decimal string to a binary string based on data type."""
    details = DATA_TYPE_DETAILS.get(data_type)
    if not details: return "Error: Unknown Type"
    
    if details['is_float']:
        try:
            val = float(decimal_str)
            fmt = '>f' if data_type == 'Float32' else '>d'
            packed = struct.pack(fmt, val)
            # Convert bytes to binary string
            return ''.join(f'{b:08b}' for b in packed)
        except ValueError:
            return "Error: Invalid Floating Point Number"
        except OverflowError:
            return "Error: Value too large for type"
    else:
        try:
            val = int(decimal_str)
            if val < details['min'] or val > details['max']:
                return f"Error: Value out of range ({details['min']} to {details['max']})"
            
            # Handle negative numbers for signed integers (2's complement)
            if val < 0:
                val = (1 << details['bits']) + val
            
            return f'{val:0{details["bits"]}b}'
        except ValueError:
            return "Error: Invalid Integer"

def binary_to_decimal(binary_str, data_type):
    """Converts a binary string to a decimal number (float or int)."""
    # Clean input
    binary = binary_str.replace(" ", "").replace("\\t", "")
    details = DATA_TYPE_DETAILS.get(data_type)
    
    if not all(c in '01' for c in binary):
        return "Error: Invalid binary characters (only 0 and 1 allowed)"

    if len(binary) != details['bits']:
        # Strict length check with helpful error
        if not details['is_float'] and len(binary) < details['bits']:
             # Auto-pad integers for convenience if user typed short binary
            binary = binary.zfill(details['bits'])
        else:
            return f"Error: Expected {details['bits']} bits, got {len(binary)}"
        
    if details['is_float']:
        try:
            # Split binary into 8-bit chunks
            bytes_list = [int(binary[i:i+8], 2) for i in range(0, len(binary), 8)]
            packed = bytes(bytes_list)
            fmt = '>f' if data_type == 'Float32' else '>d'
            return struct.unpack(fmt, packed)[0]
        except Exception as e:
            return f"Error: {e}"
    else:
        val = int(binary, 2)
        if details['signed']:
            if binary[0] == '1':
                val -= (1 << details['bits'])
        return val

def main():
    print("="*50)
    print("  Binary-Decimal Converter (Standalone Python Tool)")
    print("="*50)
    
    types_list = list(DATA_TYPE_DETAILS.keys())
    
    while True:
        print("\\n" + "-"*50)
        print(f"Available Types: {', '.join(types_list)}")
        dtype_input = input("Select Data Type (or 'q' to quit): ").strip()
        
        if dtype_input.lower() in ['q', 'quit', 'exit']:
            break
        
        # Case-insensitive matching
        dtype = next((t for t in types_list if t.lower() == dtype_input.lower()), None)
        
        if not dtype:
            print("Invalid data type selected.")
            continue
            
        print(f"Selected: {dtype} ({DATA_TYPE_DETAILS[dtype]['bits']} bits)")
        
        action = input("Convert (D)ecimal to Binary or (B)inary to Decimal? [D/B]: ").strip().upper()
        
        if action == 'D':
            val = input(f"Enter {dtype} decimal value: ").strip()
            result = decimal_to_binary(val, dtype)
            if result.startswith("Error"):
                print(result)
            else:
                print(f"Binary: {format_binary(result, dtype)}")
                print(f"Raw:    {result}")
                
        elif action == 'B':
            val = input(f"Enter {dtype} binary string: ").strip()
            result = binary_to_decimal(val, dtype)
            print(f"Decimal: {result}")
        else:
            print("Invalid action.")

if __name__ == "__main__":
    main()
`;
