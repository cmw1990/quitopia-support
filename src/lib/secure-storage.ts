interface StorageItem {
  value: any;
  timestamp: number;
  expiry?: number;
}

class SecureStorage {
  private static instance: SecureStorage;
  private readonly prefix = 'easier-focus-';
  private readonly defaultExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

  private constructor() {
    this.cleanExpiredItems();
  }

  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  public setItem(key: string, value: any, expiry?: number): void {
    const item: StorageItem = {
      value,
      timestamp: Date.now(),
      expiry: expiry || this.defaultExpiry
    };

    try {
      const encryptedValue = this.encrypt(JSON.stringify(item));
      localStorage.setItem(this.prefix + key, encryptedValue);
    } catch (error) {
      console.error('Error storing data:', error);
      // Fallback to unencrypted storage in case of encryption failure
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    }
  }

  public getItem<T>(key: string): T | null {
    const rawData = localStorage.getItem(this.prefix + key);
    if (!rawData) return null;

    try {
      let item: StorageItem;
      try {
        // Try to decrypt first
        const decrypted = this.decrypt(rawData);
        item = JSON.parse(decrypted);
      } catch {
        // If decryption fails, try parsing directly (for legacy or fallback data)
        item = JSON.parse(rawData);
      }

      // Check if item has expired
      if (item.expiry && Date.now() - item.timestamp > item.expiry) {
        this.removeItem(key);
        return null;
      }

      return item.value as T;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  public removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  public clear(): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  private cleanExpiredItems(): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        this.getItem(key.slice(this.prefix.length)); // This will remove if expired
      }
    }
  }

  // Simple XOR encryption/decryption for basic security
  // In production, use a proper encryption library
  private encrypt(text: string): string {
    const key = 'easier-focus-key'; // In production, use a secure key management system
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
  }

  private decrypt(encoded: string): string {
    const key = 'easier-focus-key';
    const text = atob(encoded); // Base64 decode
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  // Data sync methods for future implementation
  public async sync(): Promise<void> {
    // TODO: Implement sync with backend
  }

  public async import(data: Record<string, any>): Promise<void> {
    Object.entries(data).forEach(([key, value]) => {
      this.setItem(key, value);
    });
  }

  public async export(): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const value = this.getItem(key.slice(this.prefix.length));
        if (value) {
          data[key.slice(this.prefix.length)] = value;
        }
      }
    }
    return data;
  }
}

export const secureStorage = SecureStorage.getInstance();
