import cache, { CACHE_TTL } from './cache';

describe('Cache Utility', () => {
  beforeEach(() => {
    cache.clear();
  });

  test('sets and gets values correctly', () => {
    cache.set('test-key', 'test-value');
    expect(cache.get('test-key')).toBe('test-value');
  });

  test('returns null for non-existent keys', () => {
    expect(cache.get('non-existent-key')).toBeNull();
  });

  test('respects TTL and expires values', () => {
    cache.set('expiring-key', 'expiring-value', 10); // 10ms TTL
    
    expect(cache.get('expiring-key')).toBe('expiring-value');
    
    // Wait for expiration
    setTimeout(() => {
      expect(cache.get('expiring-key')).toBeNull();
    }, 15);
  });

  test('has method returns correct boolean values', () => {
    cache.set('existing-key', 'existing-value');
    
    expect(cache.has('existing-key')).toBe(true);
    expect(cache.has('non-existent-key')).toBe(false);
  });

  test('delete method removes values', () => {
    cache.set('delete-key', 'delete-value');
    
    expect(cache.has('delete-key')).toBe(true);
    
    cache.delete('delete-key');
    
    expect(cache.has('delete-key')).toBe(false);
  });

  test('clear method removes all values', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.size()).toBe(2);
    
    cache.clear();
    
    expect(cache.size()).toBe(0);
  });

  test('clearExpired method removes only expired values', () => {
    cache.set('permanent-key', 'permanent-value');
    cache.set('expiring-key', 'expiring-value', 10);
    
    expect(cache.size()).toBe(2);
    
    // Wait for expiration
    setTimeout(() => {
      cache.clearExpired();
      
      expect(cache.size()).toBe(1);
      expect(cache.get('permanent-key')).toBe('permanent-value');
      expect(cache.get('expiring-key')).toBeNull();
    }, 15);
  });

  test('CACHE_TTL constants are defined', () => {
    expect(CACHE_TTL.SHORT).toBe(5 * 60 * 1000);
    expect(CACHE_TTL.MEDIUM).toBe(15 * 60 * 1000);
    expect(CACHE_TTL.LONG).toBe(60 * 60 * 1000);
    expect(CACHE_TTL.VERY_LONG).toBe(24 * 60 * 60 * 1000);
  });
});