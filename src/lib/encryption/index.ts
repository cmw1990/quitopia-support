import { webcrypto } from 'crypto';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  encryptedMessage: string;
  key: string;
}

/**
 * Generate a new RSA key pair for end-to-end encryption
 */
export const generateKeyPair = async (): Promise<KeyPair> => {
  const { publicKey, privateKey } = await webcrypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedPublicKey = await webcrypto.subtle.exportKey(
    'spki',
    publicKey
  );
  const exportedPrivateKey = await webcrypto.subtle.exportKey(
    'pkcs8',
    privateKey
  );

  return {
    publicKey: Buffer.from(exportedPublicKey).toString('base64'),
    privateKey: Buffer.from(exportedPrivateKey).toString('base64')
  };
};

/**
 * Encrypt a message using the recipient's public key
 * Returns both the encrypted message and the symmetric key used
 */
export const encryptMessage = async (
  message: string,
  recipientPublicKey: string
): Promise<EncryptedMessage> => {
  // Import recipient's public key
  const publicKey = await webcrypto.subtle.importKey(
    'spki',
    Buffer.from(recipientPublicKey, 'base64'),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );

  // Generate a random symmetric key
  const symmetricKey = await webcrypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Export symmetric key
  const exportedSymmetricKey = await webcrypto.subtle.exportKey(
    'raw',
    symmetricKey
  );

  // Encrypt symmetric key with recipient's public key
  const encryptedKey = await webcrypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    exportedSymmetricKey
  );

  // Generate IV
  const iv = webcrypto.getRandomValues(new Uint8Array(12));

  // Encrypt message with symmetric key
  const encodedMessage = new TextEncoder().encode(message);
  const encryptedData = await webcrypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    symmetricKey,
    encodedMessage
  );

  // Combine IV and encrypted data
  const finalMessage = JSON.stringify({
    iv: Buffer.from(iv).toString('base64'),
    encryptedData: Buffer.from(encryptedData).toString('base64')
  });

  return {
    encryptedMessage: finalMessage,
    key: Buffer.from(encryptedKey).toString('base64')
  };
};

/**
 * Decrypt a message using the recipient's private key
 */
export const decryptMessage = async (
  encryptedMessage: string,
  privateKeyString: string
): Promise<string> => {
  try {
    // Import private key
    const privateKey = await webcrypto.subtle.importKey(
      'pkcs8',
      Buffer.from(privateKeyString, 'base64'),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );

    // Parse message components
    const { iv, encryptedData } = JSON.parse(encryptedMessage);

    // Decrypt symmetric key
    const symmetricKeyData = await webcrypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      privateKey,
      Buffer.from(encryptedData, 'base64')
    );

    // Import symmetric key
    const symmetricKey = await webcrypto.subtle.importKey(
      'raw',
      symmetricKeyData,
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['decrypt']
    );

    // Decrypt message
    const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: Buffer.from(iv, 'base64')
      },
      symmetricKey,
      Buffer.from(encryptedData, 'base64')
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Encrypted message]';
  }
}; 