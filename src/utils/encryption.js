// Generate a new encryption key
export const generateEncryptionKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
};

// Export key to string format
export const exportKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

// Import key from string format
export const importKey = async (keyStr) => {
  const keyData = Uint8Array.from(atob(keyStr), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypt data
export const encryptData = async (text) => {
  try {
    if (!text) return { encryptedData: '', key: '' };
    
    const key = await generateEncryptionKey();
    const exportedKey = await exportKey(key);
    
    const encodedText = new TextEncoder().encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedText
    );

    const encryptedArray = new Uint8Array(encryptedData);
    const combinedArray = new Uint8Array(iv.length + encryptedArray.length);
    combinedArray.set(iv);
    combinedArray.set(encryptedArray, iv.length);
    
    return {
      encryptedData: btoa(String.fromCharCode(...combinedArray)),
      key: exportedKey
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

// Decrypt data
export const decryptData = async (encryptedData, keyStr) => {
  try {
    // Handle empty or invalid data
    if (!encryptedData || !keyStr) {
      return encryptedData || ''; // Return original data if not encrypted
    }

    // Validate base64 string
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encryptedData)) {
      return encryptedData; // Return original data if not valid base64
    }

    const key = await importKey(keyStr);
    const combinedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    const iv = combinedArray.slice(0, 12);
    const encryptedContent = combinedArray.slice(12);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedContent
    );

    return new TextDecoder().decode(decryptedContent);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData; // Return original data if decryption fails
  }
}; 