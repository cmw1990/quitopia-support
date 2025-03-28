/**
 * Browser-compatible encryption utilities using Web Crypto API
 */

/**
 * Generate a new RSA key pair for end-to-end encryption 
 */
export const generateKeyPair = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Export the keys to PEM format
    const publicKeyBuffer = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    const privateKeyBuffer = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );

    // Convert to base64
    const publicKeyBase64 = btoa(
      Array.from(new Uint8Array(publicKeyBuffer))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    const privateKeyBase64 = btoa(
      Array.from(new Uint8Array(privateKeyBuffer))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );

    // Format as PEM
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`;

    return {
      publicKey,
      privateKey,
    };
  } catch (error) {
    console.error("Error generating key pair:", error);
    throw error;
  }
};

/**
 * Helper function to convert PEM to CryptoKey
 */
const importRsaKey = async (pem, isPublic) => {
  // Remove headers and convert from base64
  const pemContents = pem
    .replace(isPublic ? /-+BEGIN PUBLIC KEY-+(\r?\n)?|-+END PUBLIC KEY-+(\r?\n)?/g : /-+BEGIN PRIVATE KEY-+(\r?\n)?|-+END PRIVATE KEY-+(\r?\n)?/g, '')
    .replace(/\r?\n/g, '');
  
  const binaryDer = window.atob(pemContents);
  const buffer = new Uint8Array(binaryDer.length);
  
  for (let i = 0; i < binaryDer.length; i++) {
    buffer[i] = binaryDer.charCodeAt(i);
  }
  
  return window.crypto.subtle.importKey(
    isPublic ? 'spki' : 'pkcs8',
    buffer.buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    false,
    isPublic ? ['encrypt'] : ['decrypt']
  );
};

/**
 * Encrypt a message using the recipient's public key
 */
export const encryptMessage = async (message, recipientPublicKey) => {
  try {
    // Import recipient's public key
    const publicKey = await importRsaKey(recipientPublicKey, true);
    
    // Generate a random symmetric key
    const symmetricKey = window.crypto.getRandomValues(new Uint8Array(32));
    
    // Encrypt the symmetric key with RSA
    const encryptedKey = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      publicKey,
      symmetricKey
    );
    
    // Generate IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Convert message to ArrayBuffer
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(message);
    
    // Import symmetric key for AES
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      symmetricKey,
      {
        name: "AES-GCM",
      },
      false,
      ["encrypt"]
    );
    
    // Encrypt the message with AES-GCM
    const encryptedMessage = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      messageBuffer
    );
    
    // Convert to base64 for storage/transmission
    const encryptedKeyBase64 = btoa(
      Array.from(new Uint8Array(encryptedKey))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    const ivBase64 = btoa(
      Array.from(iv)
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    const encryptedDataBase64 = btoa(
      Array.from(new Uint8Array(encryptedMessage))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    
    // Return the encrypted package
    const finalMessage = JSON.stringify({
      iv: ivBase64,
      encryptedData: encryptedDataBase64,
    });
    
    return {
      encryptedMessage: finalMessage,
      key: encryptedKeyBase64,
    };
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
};

/**
 * Decrypt a message using the recipient's private key
 */
export const decryptMessage = async (encryptedMessageWithKey, privateKey) => {
  try {
    // Parse the encrypted package
    const { encryptedMessage, key } = JSON.parse(encryptedMessageWithKey);
    const { iv, encryptedData } = JSON.parse(encryptedMessage);
    
    // Import private key
    const rsaPrivateKey = await importRsaKey(privateKey, false);
    
    // Convert from base64
    const encryptedKeyBuffer = Uint8Array.from(atob(key), c => c.charCodeAt(0)).buffer;
    const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    const encryptedDataBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0)).buffer;
    
    // Decrypt the symmetric key
    const symmetricKeyBuffer = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      rsaPrivateKey,
      encryptedKeyBuffer
    );
    
    // Import symmetric key for AES
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      symmetricKeyBuffer,
      {
        name: "AES-GCM",
      },
      false,
      ["decrypt"]
    );
    
    // Decrypt the message
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
      },
      aesKey,
      encryptedDataBuffer
    );
    
    // Convert ArrayBuffer to string
    const decoder = new TextDecoder();
    const decryptedMessage = decoder.decode(decryptedBuffer);
    
    return decryptedMessage;
  } catch (error) {
    console.error("Decryption error:", error);
    return "[Encrypted message - unable to decrypt]";
  }
}; 