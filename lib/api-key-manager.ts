/**
 * API Key Rotation Manager
 * Manages multiple API keys with round-robin distribution and daily limits
 */

interface ApiKey {
  key: string;
  dailyUsage: number;
  dailyLimit: number;
  isActive: boolean;
  lastReset: Date;
  lastUsed?: Date;
}

interface ApiKeyConfig {
  service: 'replicate' | 'openai' | 'stability' | 'midjourney';
  keys: string[];
  defaultDailyLimit?: number;
}

class ApiKeyManager {
  private keyPools: Map<string, ApiKey[]> = new Map();
  private currentIndices: Map<string, number> = new Map();
  private defaultDailyLimit = 100;

  constructor() {
    this.initializeKeys();
  }

  /**
   * Initialize API keys from environment variables
   */
  private initializeKeys() {
    // Replicate API Keys
    const replicateKeys = this.parseApiKeys(process.env.REPLICATE_API_KEYS);
    if (replicateKeys.length > 0) {
      this.registerService('replicate', replicateKeys);
    }

    // OpenAI API Keys
    const openaiKeys = this.parseApiKeys(process.env.OPENAI_API_KEYS);
    if (openaiKeys.length > 0) {
      this.registerService('openai', openaiKeys);
    }

    // Stability AI Keys
    const stabilityKeys = this.parseApiKeys(process.env.STABILITY_API_KEYS);
    if (stabilityKeys.length > 0) {
      this.registerService('stability', stabilityKeys);
    }

    // Generic AI Model Keys
    const aiModelKeys = this.parseApiKeys(process.env.AI_MODEL_API_KEYS);
    if (aiModelKeys.length > 0) {
      this.registerService('generic', aiModelKeys);
    }
  }

  /**
   * Parse comma-separated API keys from env variable
   */
  private parseApiKeys(envValue: string | undefined): string[] {
    if (!envValue) return [];
    return envValue
      .split(',')
      .map(key => key.trim())
      .filter(key => key.length > 0);
  }

  /**
   * Register a service with its API keys
   */
  registerService(service: string, keys: string[], dailyLimit?: number): void {
    const apiKeys: ApiKey[] = keys.map(key => ({
      key,
      dailyUsage: 0,
      dailyLimit: dailyLimit || this.defaultDailyLimit,
      isActive: true,
      lastReset: new Date(),
    }));

    this.keyPools.set(service, apiKeys);
    this.currentIndices.set(service, 0);
  }

  /**
   * Get next available API key using round-robin strategy
   */
  getNextKey(service: string): string | null {
    const keys = this.keyPools.get(service);
    if (!keys || keys.length === 0) {
      console.error(`No API keys registered for service: ${service}`);
      return null;
    }

    const currentIndex = this.currentIndices.get(service) || 0;
    let attempts = 0;
    const maxAttempts = keys.length;

    // Try to find an available key
    while (attempts < maxAttempts) {
      const index = (currentIndex + attempts) % keys.length;
      const apiKey = keys[index];

      // Check if key needs daily reset
      if (this.shouldResetKey(apiKey)) {
        this.resetKey(apiKey);
      }

      // Check if key is available
      if (apiKey.isActive && apiKey.dailyUsage < apiKey.dailyLimit) {
        // Update usage and last used time
        apiKey.dailyUsage++;
        apiKey.lastUsed = new Date();

        // Update current index for next call
        this.currentIndices.set(service, (index + 1) % keys.length);

        return apiKey.key;
      }

      attempts++;
    }

    // All keys exhausted
    console.error(`All API keys exhausted for service: ${service}`);
    return null;
  }

  /**
   * Get a random key (alternative strategy)
   */
  getRandomKey(service: string): string | null {
    const keys = this.keyPools.get(service);
    if (!keys || keys.length === 0) return null;

    // Filter active keys with available quota
    const availableKeys = keys.filter(
      key => key.isActive && key.dailyUsage < key.dailyLimit
    );

    if (availableKeys.length === 0) return null;

    // Pick random key
    const randomIndex = Math.floor(Math.random() * availableKeys.length);
    const apiKey = availableKeys[randomIndex];

    // Update usage
    apiKey.dailyUsage++;
    apiKey.lastUsed = new Date();

    return apiKey.key;
  }

  /**
   * Check if a key should be reset (new day)
   */
  private shouldResetKey(apiKey: ApiKey): boolean {
    const now = new Date();
    const lastReset = apiKey.lastReset;
    
    return (
      now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    );
  }

  /**
   * Reset a key's daily usage
   */
  private resetKey(apiKey: ApiKey): void {
    apiKey.dailyUsage = 0;
    apiKey.lastReset = new Date();
    apiKey.isActive = true;
  }

  /**
   * Manually reset all keys for a service
   */
  resetService(service: string): void {
    const keys = this.keyPools.get(service);
    if (!keys) return;

    keys.forEach(key => this.resetKey(key));
  }

  /**
   * Reset all keys across all services
   */
  resetAllKeys(): void {
    for (const [service] of this.keyPools) {
      this.resetService(service);
    }
  }

  /**
   * Get usage statistics for a service
   */
  getServiceStats(service: string): {
    totalKeys: number;
    activeKeys: number;
    totalUsage: number;
    totalLimit: number;
    utilizationRate: number;
  } | null {
    const keys = this.keyPools.get(service);
    if (!keys) return null;

    const totalKeys = keys.length;
    const activeKeys = keys.filter(k => k.isActive && k.dailyUsage < k.dailyLimit).length;
    const totalUsage = keys.reduce((sum, k) => sum + k.dailyUsage, 0);
    const totalLimit = keys.reduce((sum, k) => sum + k.dailyLimit, 0);
    const utilizationRate = totalLimit > 0 ? (totalUsage / totalLimit) * 100 : 0;

    return {
      totalKeys,
      activeKeys,
      totalUsage,
      totalLimit,
      utilizationRate,
    };
  }

  /**
   * Get all services and their stats
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [service] of this.keyPools) {
      stats[service] = this.getServiceStats(service);
    }

    return stats;
  }

  /**
   * Mark a key as inactive (e.g., if it's rate limited or invalid)
   */
  markKeyInactive(service: string, keyPrefix: string): void {
    const keys = this.keyPools.get(service);
    if (!keys) return;

    const key = keys.find(k => k.key.startsWith(keyPrefix));
    if (key) {
      key.isActive = false;
      console.warn(`Marked key as inactive: ${service}/${keyPrefix}...`);
    }
  }

  /**
   * Reactivate a key
   */
  reactivateKey(service: string, keyPrefix: string): void {
    const keys = this.keyPools.get(service);
    if (!keys) return;

    const key = keys.find(k => k.key.startsWith(keyPrefix));
    if (key) {
      key.isActive = true;
      console.log(`Reactivated key: ${service}/${keyPrefix}...`);
    }
  }
}

// Singleton instance
let apiKeyManagerInstance: ApiKeyManager | null = null;

export function getApiKeyManager(): ApiKeyManager {
  if (!apiKeyManagerInstance) {
    apiKeyManagerInstance = new ApiKeyManager();
  }
  return apiKeyManagerInstance;
}

// Convenience functions
export function getNextApiKey(service: string): string | null {
  return getApiKeyManager().getNextKey(service);
}

export function getRandomApiKey(service: string): string | null {
  return getApiKeyManager().getRandomKey(service);
}

export function getApiKeyStats(service?: string) {
  const manager = getApiKeyManager();
  return service ? manager.getServiceStats(service) : manager.getAllStats();
}

export function resetApiKeys(service?: string) {
  const manager = getApiKeyManager();
  if (service) {
    manager.resetService(service);
  } else {
    manager.resetAllKeys();
  }
}

export default ApiKeyManager;
