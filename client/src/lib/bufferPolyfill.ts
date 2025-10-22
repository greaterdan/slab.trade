// Buffer polyfill for browser environment
let Buffer: any;

try {
  // Try to import the real Buffer
  const bufferModule = require('buffer');
  Buffer = bufferModule.Buffer;
} catch (e) {
  // Fallback Buffer implementation
  console.warn('Buffer module not available, using fallback');
  
  function BufferFallback() {
    throw new Error('Buffer is not available. Please use the polyfill.');
  }
  
  BufferFallback.from = function(data: any, encoding?: any) {
    if (typeof data === 'string') {
      const bytes = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        bytes[i] = data.charCodeAt(i);
      }
      return bytes;
    }
    return new Uint8Array(data);
  };
  
  BufferFallback.isBuffer = function(obj: any) {
    return obj instanceof Uint8Array;
  };
  
  Buffer = BufferFallback;
}

// AGGRESSIVE BUFFER POLYFILL
// Make Buffer available everywhere possible
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
  (window as any).globalThis = window;
}

// Also make it available on globalThis
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
  (globalThis as any).global = globalThis;
}

// Set up process if needed
if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = { env: {} };
}

// Ensure Buffer is available immediately
if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

export { Buffer };
