// Cache utility for performance optimization
// Implements a simple in-memory cache with TTL support

class Cache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  
  // Set a value in the cache with an optional TTL (in milliseconds)
  set(key: string, value: any, ttl?: number): void {
    const expiry = ttl ? Date.now() + ttl : Infinity;
    this.cache.set(key, { value, expiry });
  }
  
  // Get a value from the cache if it exists and hasn't expired
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  // Check if a key exists in the cache and hasn't expired
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  // Delete a key from the cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  // Clear all expired items from the cache
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
  
  // Clear the entire cache
  clear(): void {
    this.cache.clear();
  }
  
  // Get the number of items in the cache (including expired ones)
  size(): number {
    return this.cache.size;
  }
}

// Create a singleton instance of the cache
const cache = new Cache();

export default cache;

// Export cache constants
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
};