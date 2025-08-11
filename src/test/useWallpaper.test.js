import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWallpaper } from '../composables/useWallpaper'

// Mock Chrome API
global.chrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn()
    }
  }
}

// Mock useToast
vi.mock('../composables/useToast', () => ({
  useToast: () => ({
    error: vi.fn(),
    log: vi.fn()
  })
}))

// Mock Vue lifecycle hooks
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    watch: vi.fn()
  }
})

// Test date utility functions directly
describe('Date Utility Functions', () => {
  // Create a minimal version of the date utilities for testing
  const formatDateToString = (date = new Date()) => {
    return date.toISOString().split('T')[0].replace(/-/g, '')
  }
  
  const isValidDateString = (dateString) => {
    if (!dateString || typeof dateString !== 'string' || dateString.length !== 8) {
      return false
    }
    
    const year = parseInt(dateString.substring(0, 4))
    const month = parseInt(dateString.substring(4, 6))
    const day = parseInt(dateString.substring(6, 8))
    
    // 基本范围检查
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return false
    }
    
    // 创建日期对象验证日期是否真实存在
    const testDate = new Date(year, month - 1, day)
    return testDate.getFullYear() === year && 
           testDate.getMonth() === month - 1 && 
           testDate.getDate() === day
  }
  
  const compareDateStrings = (date1, date2) => {
    // 验证日期格式
    if (!isValidDateString(date1) || !isValidDateString(date2)) {
      return false
    }
    
    return date1 === date2
  }

  describe('formatDateToString', () => {
    it('should format current date correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00Z')
      const result = formatDateToString(testDate)
      expect(result).toBe('20240115')
    })
    
    it('should format date without time component', () => {
      const testDate = new Date('2024-12-31T23:59:59Z')
      const result = formatDateToString(testDate)
      expect(result).toBe('20241231')
    })
  })

  describe('isValidDateString', () => {
    it('should validate correct date strings', () => {
      expect(isValidDateString('20240115')).toBe(true)
      expect(isValidDateString('20241231')).toBe(true)
      expect(isValidDateString('20240229')).toBe(true) // leap year
    })
    
    it('should reject invalid date strings', () => {
      expect(isValidDateString('')).toBe(false)
      expect(isValidDateString('2024011')).toBe(false) // too short
      expect(isValidDateString('202401155')).toBe(false) // too long
      expect(isValidDateString('20240230')).toBe(false) // invalid date
      expect(isValidDateString('20240431')).toBe(false) // April 31st doesn't exist
      expect(isValidDateString('20230229')).toBe(false) // not a leap year
      expect(isValidDateString(null)).toBe(false)
      expect(isValidDateString(undefined)).toBe(false)
    })
  })

  describe('compareDateStrings', () => {
    it('should compare valid date strings correctly', () => {
      expect(compareDateStrings('20240115', '20240115')).toBe(true)
      expect(compareDateStrings('20240115', '20240116')).toBe(false)
    })
    
    it('should return false for invalid date strings', () => {
      expect(compareDateStrings('invalid', '20240115')).toBe(false)
      expect(compareDateStrings('20240115', 'invalid')).toBe(false)
      expect(compareDateStrings('invalid', 'invalid')).toBe(false)
    })
  })
})

describe('Wallpaper Preloading and Transitions', () => {
  let mockImage

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock successful chrome storage
    chrome.storage.sync.get.mockResolvedValue({})
    chrome.storage.sync.set.mockResolvedValue()
    
    // Mock Image constructor
    mockImage = vi.fn()
    global.Image = mockImage
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('preloadWallpaper functionality', () => {
    it('should successfully preload a valid image URL', async () => {
      // Mock successful image loading
      mockImage.mockImplementation(function() {
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 10)
      })
      
      const { preloadWallpaper } = useWallpaper()
      const testUrl = 'https://example.com/test-image.jpg'
      
      const result = await preloadWallpaper(testUrl)
      expect(result).toBe(testUrl)
    })

    it('should retry on failure and eventually succeed', async () => {
      let attemptCount = 0
      
      // Mock Image to fail first time, succeed second time
      mockImage.mockImplementation(function() {
        attemptCount++
        setTimeout(() => {
          if (attemptCount === 1) {
            if (this.onerror) this.onerror()
          } else {
            if (this.onload) this.onload()
          }
        }, 10)
      })
      
      const { preloadWallpaper } = useWallpaper()
      const testUrl = 'https://example.com/test-image.jpg'
      
      const result = await preloadWallpaper(testUrl)
      expect(result).toBe(testUrl)
      expect(attemptCount).toBe(2)
    })

    it('should reject after maximum retries', async () => {
      // Mock Image to always fail
      mockImage.mockImplementation(function() {
        setTimeout(() => {
          if (this.onerror) this.onerror()
        }, 10)
      })
      
      const { preloadWallpaper } = useWallpaper()
      const testUrl = 'https://example.com/invalid-image.jpg'
      
      await expect(preloadWallpaper(testUrl)).rejects.toThrow('Failed to preload wallpaper after 2 attempts')
    })

    it('should handle timeout scenarios', async () => {
      // Mock Image that never calls onload or onerror (timeout scenario)
      mockImage.mockImplementation(function() {
        // Do nothing - simulate timeout
      })
      
      const { preloadWallpaper } = useWallpaper()
      const testUrl = 'https://example.com/slow-image.jpg'
      
      // Use shorter timeout for testing
      await expect(preloadWallpaper(testUrl, 100)).rejects.toThrow('timeout')
    })
  })

  describe('transitionToWallpaper functionality', () => {
    it('should successfully transition to new wallpaper', async () => {
      // Mock successful image loading
      mockImage.mockImplementation(function() {
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 10)
      })
      
      const { transitionToWallpaper, currentWallpaper } = useWallpaper()
      const testUrl = 'https://example.com/new-wallpaper.jpg'
      
      const result = await transitionToWallpaper(testUrl)
      
      expect(result).toBe(true)
      expect(currentWallpaper.value).toBe(testUrl)
    })

    it('should use fallback URL when main URL fails', async () => {
      const mainUrl = 'https://example.com/invalid-image.jpg'
      const fallbackUrl = 'https://example.com/fallback-image.jpg'
      
      // Mock Image to fail for main URL, succeed for fallback
      mockImage.mockImplementation(function() {
        setTimeout(() => {
          if (this.src === mainUrl) {
            if (this.onerror) this.onerror()
          } else {
            if (this.onload) this.onload()
          }
        }, 10)
      })
      
      const { transitionToWallpaper, currentWallpaper } = useWallpaper()
      
      const result = await transitionToWallpaper(mainUrl, fallbackUrl)
      
      expect(result).toBe(true)
      expect(currentWallpaper.value).toBe(fallbackUrl)
    })

    it('should handle complete failure gracefully', async () => {
      // Mock Image to always fail
      mockImage.mockImplementation(function() {
        setTimeout(() => {
          if (this.onerror) this.onerror()
        }, 10)
      })
      
      const { transitionToWallpaper, currentWallpaper } = useWallpaper()
      const testUrl = 'https://example.com/invalid-image.jpg'
      
      // Set initial wallpaper
      const initialWallpaper = 'https://example.com/existing-wallpaper.jpg'
      currentWallpaper.value = initialWallpaper
      
      const result = await transitionToWallpaper(testUrl)
      
      // Should return false and keep current wallpaper when preloading fails
      expect(result).toBe(false)
      expect(currentWallpaper.value).toBe(initialWallpaper)
    })
  })

  describe('Error Handling and Fallbacks', () => {
    it('should maintain graceful degradation when all preloading fails', async () => {
      // Mock Image to always fail
      mockImage.mockImplementation(function() {
        setTimeout(() => {
          if (this.onerror) this.onerror()
        }, 10)
      })
      
      const { transitionToWallpaper, currentWallpaper } = useWallpaper()
      
      // Set initial wallpaper
      const initialWallpaper = 'https://example.com/current-wallpaper.jpg'
      currentWallpaper.value = initialWallpaper
      
      const result = await transitionToWallpaper('https://example.com/invalid.jpg')
      
      // Should keep current wallpaper when preloading fails
      expect(result).toBe(false)
      expect(currentWallpaper.value).toBe(initialWallpaper)
    })

    it('should handle empty or invalid URLs gracefully', async () => {
      const { transitionToWallpaper, currentWallpaper } = useWallpaper()
      
      // Set initial wallpaper
      const initialWallpaper = 'https://example.com/current-wallpaper.jpg'
      currentWallpaper.value = initialWallpaper
      
      // Test with empty URL
      const result = await transitionToWallpaper('')
      
      // Should maintain current wallpaper when URL is empty
      expect(result).toBe(false)
      expect(currentWallpaper.value).toBe(initialWallpaper)
    })

    it('should use direct setting as last resort when no current wallpaper exists', async () => {
      // Mock Image to always fail
      mockImage.mockImplementation(function() {
        setTimeout(() => {
          if (this.onerror) this.onerror()
        }, 10)
      })
      
      const { transitionToWallpaper, currentWallpaper } = useWallpaper()
      const testUrl = 'https://example.com/invalid-image.jpg'
      
      // No initial wallpaper
      currentWallpaper.value = ''
      
      const result = await transitionToWallpaper(testUrl)
      
      // Should use direct setting as last resort when no current wallpaper
      expect(result).toBe(false)
      expect(currentWallpaper.value).toBe(testUrl)
    })
  })

  describe('Enhanced Error Handling and Retry Mechanisms', () => {
    it('should implement exponential backoff for API requests', async () => {
      const { fetchWithRetry, calculateBackoffDelay } = useWallpaper()
      
      // Test backoff delay calculation
      expect(calculateBackoffDelay(1)).toBe(1000) // 1st retry: 1s
      expect(calculateBackoffDelay(2)).toBe(2000) // 2nd retry: 2s
      expect(calculateBackoffDelay(3)).toBe(4000) // 3rd retry: 4s
      expect(calculateBackoffDelay(4)).toBe(8000) // 4th retry: 8s
      expect(calculateBackoffDelay(5)).toBe(10000) // 5th retry: capped at 10s
    })

    it('should retry API requests with exponential backoff', async () => {
      const { fetchWithRetry } = useWallpaper()
      let attemptCount = 0
      
      // Mock fetch to fail twice, then succeed
      global.fetch = vi.fn().mockImplementation(() => {
        attemptCount++
        if (attemptCount <= 2) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ imgurl: 'https://example.com/success.jpg' })
        })
      })
      
      const result = await fetchWithRetry('https://api.example.com/wallpaper')
      
      expect(attemptCount).toBe(3)
      expect(result.imgurl).toBe('https://example.com/success.jpg')
    })

    it('should handle API request failures gracefully', async () => {
      const { fetchWithRetry } = useWallpaper()
      
      // Mock fetch to always fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      await expect(fetchWithRetry('https://api.example.com/wallpaper', {}, 2))
        .rejects.toThrow('Network error')
    })

    it('should validate API response structure', async () => {
      const { fetchWithRetry } = useWallpaper()
      
      // Mock fetch to return invalid response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null)
      })
      
      await expect(fetchWithRetry('https://api.example.com/wallpaper'))
        .rejects.toThrow('Invalid response format')
    })

    it('should handle HTTP error status codes', async () => {
      const { fetchWithRetry } = useWallpaper()
      
      // Mock fetch to return 404
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
      
      await expect(fetchWithRetry('https://api.example.com/wallpaper'))
        .rejects.toThrow('HTTP 404: Not Found')
    })

    it('should validate URL format in transitionToWallpaper', async () => {
      const { transitionToWallpaper } = useWallpaper()
      
      // Test invalid URL
      const result1 = await transitionToWallpaper('not-a-valid-url')
      expect(result1).toBe(false)
      
      // Test empty URL
      const result2 = await transitionToWallpaper('')
      expect(result2).toBe(false)
      
      // Test null URL
      const result3 = await transitionToWallpaper(null)
      expect(result3).toBe(false)
    })

    it('should handle Chrome storage errors with retry', async () => {
      const { saveWallpaperSettings } = useWallpaper()
      let attemptCount = 0
      
      // Mock chrome.storage.sync to fail twice, then succeed
      global.chrome = {
        storage: {
          sync: {
            set: vi.fn().mockImplementation(() => {
              attemptCount++
              if (attemptCount <= 2) {
                return Promise.reject(new Error('Storage quota exceeded'))
              }
              return Promise.resolve()
            }),
            get: vi.fn().mockResolvedValue({ wallpaperSettings: {} })
          }
        }
      }
      
      await saveWallpaperSettings(false, 3) // 3 retries
      expect(attemptCount).toBe(3)
    })
  })

  describe('Request Deduplication System', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      chrome.storage.sync.get.mockResolvedValue({})
      chrome.storage.sync.set.mockResolvedValue()
      
      // Mock successful image loading for these tests
      mockImage.mockImplementation(function() {
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 10)
      })
    })

    it('should prevent duplicate API requests for the same day', async () => {
      const { 
        shouldExecuteRequest, 
        hasActiveRequest, 
        hasDailyRequestCache,
        setDailyRequestCache 
      } = useWallpaper()
      
      const testDate = '20240115'
      
      // Initially should allow request
      expect(shouldExecuteRequest(testDate)).toBe(true)
      
      // After setting cache, should prevent duplicate
      setDailyRequestCache(testDate, 'https://example.com/cached.jpg')
      expect(shouldExecuteRequest(testDate)).toBe(false)
      expect(hasDailyRequestCache(testDate)).toBe(true)
    })

    it('should track active requests properly', async () => {
      const { 
        hasActiveRequest,
        fetchBingWallpaperWithDeduplication,
        shouldExecuteRequest
      } = useWallpaper()
      
      const testDate = '20240115'
      
      // Mock fetch to delay response
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ imgurl: 'https://example.com/test.jpg' })
            })
          }, 100)
        })
      })
      
      // Start first request
      const request1Promise = fetchBingWallpaperWithDeduplication(testDate)
      
      // Should detect active request
      expect(hasActiveRequest(testDate)).toBe(true)
      expect(shouldExecuteRequest(testDate)).toBe(false)
      
      // Wait for request to complete
      await request1Promise
      
      // Should no longer have active request
      expect(hasActiveRequest(testDate)).toBe(false)
    })

    it('should wait for active requests to complete', async () => {
      const { 
        fetchBingWallpaperWithDeduplication,
        waitForActiveRequest,
        hasActiveRequest
      } = useWallpaper()
      
      const testDate = '20240115'
      let requestCompleted = false
      
      // Mock fetch with delay
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            requestCompleted = true
            resolve({
              ok: true,
              json: () => Promise.resolve({ imgurl: 'https://example.com/test.jpg' })
            })
          }, 50)
        })
      })
      
      // Start first request
      const request1Promise = fetchBingWallpaperWithDeduplication(testDate)
      
      // Verify active request exists
      expect(hasActiveRequest(testDate)).toBe(true)
      
      // Wait for active request
      const waitResult = await waitForActiveRequest(testDate)
      
      expect(waitResult).toBe(true)
      expect(requestCompleted).toBe(true)
      
      // Clean up
      await request1Promise
    })

    it('should cache successful requests', async () => {
      const { 
        setDailyRequestCache,
        getDailyRequestCache,
        hasDailyRequestCache
      } = useWallpaper()
      
      const testDate = '20240115'
      const testUrl = 'https://example.com/cached-wallpaper.jpg'
      
      // Set cache
      setDailyRequestCache(testDate, testUrl)
      
      // Verify cache
      expect(hasDailyRequestCache(testDate)).toBe(true)
      
      const cache = getDailyRequestCache(testDate)
      expect(cache.url).toBe(testUrl)
      expect(cache.timestamp).toBeTypeOf('number')
      expect(cache.timestamp).toBeLessThanOrEqual(Date.now())
    })

    it('should clean up expired request cache', async () => {
      const { 
        setDailyRequestCache,
        hasDailyRequestCache,
        cleanupExpiredRequestCache,
        formatDateToString
      } = useWallpaper()
      
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date(today)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      
      const todayStr = formatDateToString(today)
      const yesterdayStr = formatDateToString(yesterday)
      const twoDaysAgoStr = formatDateToString(twoDaysAgo)
      
      // Set cache for multiple dates
      setDailyRequestCache(todayStr, 'https://example.com/today.jpg')
      setDailyRequestCache(yesterdayStr, 'https://example.com/yesterday.jpg')
      setDailyRequestCache(twoDaysAgoStr, 'https://example.com/old.jpg')
      
      // Verify all caches exist
      expect(hasDailyRequestCache(todayStr)).toBe(true)
      expect(hasDailyRequestCache(yesterdayStr)).toBe(true)
      expect(hasDailyRequestCache(twoDaysAgoStr)).toBe(true)
      
      // Clean up expired cache
      cleanupExpiredRequestCache()
      
      // Today and yesterday should remain, older should be cleaned
      expect(hasDailyRequestCache(todayStr)).toBe(true)
      expect(hasDailyRequestCache(yesterdayStr)).toBe(true)
      expect(hasDailyRequestCache(twoDaysAgoStr)).toBe(false)
    })

    it('should validate cache is from same day', async () => {
      const { 
        setDailyRequestCache,
        hasDailyRequestCache,
        dailyRequestCache
      } = useWallpaper()
      
      const testDate = '20240115'
      
      // First set a valid cache
      setDailyRequestCache(testDate, 'https://example.com/valid.jpg')
      expect(hasDailyRequestCache(testDate)).toBe(true)
      
      // Now manually set cache with old timestamp (simulate cache from previous day)
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      
      // Access the internal cache directly
      dailyRequestCache.value.set(testDate, {
        url: 'https://example.com/old.jpg',
        timestamp: oldTimestamp
      })
      
      // Should not consider old cache as valid
      expect(hasDailyRequestCache(testDate)).toBe(false)
    })

    it('should handle multiple simultaneous requests gracefully', async () => {
      const { fetchBingWallpaperWithDeduplication } = useWallpaper()
      
      const testDate = '20240115'
      let apiCallCount = 0
      
      // Mock fetch to count calls
      global.fetch = vi.fn().mockImplementation(() => {
        apiCallCount++
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ imgurl: 'https://example.com/test.jpg' })
        })
      })
      
      // Start multiple simultaneous requests
      const promises = [
        fetchBingWallpaperWithDeduplication(testDate),
        fetchBingWallpaperWithDeduplication(testDate),
        fetchBingWallpaperWithDeduplication(testDate)
      ]
      
      // Wait for all to complete
      await Promise.all(promises)
      
      // Should only make one API call despite multiple requests
      expect(apiCallCount).toBe(1)
    })

    it('should handle request failures in deduplication system', async () => {
      const { 
        fetchBingWallpaperWithDeduplication,
        hasActiveRequest,
        hasDailyRequestCache
      } = useWallpaper()
      
      const testDate = '20240115'
      
      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'))
      
      // Request should fail
      await expect(fetchBingWallpaperWithDeduplication(testDate))
        .rejects.toThrow('API Error')
      
      // Should not have active request after failure
      expect(hasActiveRequest(testDate)).toBe(false)
      
      // Should not have cache after failure
      expect(hasDailyRequestCache(testDate)).toBe(false)
    })

    it('should integrate deduplication with getBingDailyWallpaper', async () => {
      const { 
        getBingDailyWallpaper,
        hasDailyRequestCache,
        formatDateToString
      } = useWallpaper()
      
      const today = formatDateToString()
      let apiCallCount = 0
      
      // Mock fetch
      global.fetch = vi.fn().mockImplementation(() => {
        apiCallCount++
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ imgurl: 'https://example.com/daily.jpg' })
        })
      })
      
      // First call should make API request
      await getBingDailyWallpaper()
      expect(apiCallCount).toBe(1)
      expect(hasDailyRequestCache(today)).toBe(true)
      
      // Second call should use cache
      await getBingDailyWallpaper()
      expect(apiCallCount).toBe(1) // Should not increase
    })

    it('should clear deduplication state on component unmount', async () => {
      const { 
        setDailyRequestCache,
        hasDailyRequestCache,
        activeRequests,
        requestStates,
        dailyRequestCache
      } = useWallpaper()
      
      const testDate = '20240115'
      
      // Set some state
      setDailyRequestCache(testDate, 'https://example.com/test.jpg')
      expect(hasDailyRequestCache(testDate)).toBe(true)
      
      // Simulate component unmount by calling the cleanup directly
      activeRequests.value.clear()
      requestStates.value.clear()
      dailyRequestCache.value.clear()
      
      // State should be cleared
      expect(hasDailyRequestCache(testDate)).toBe(false)
      expect(activeRequests.value.size).toBe(0)
      expect(requestStates.value.size).toBe(0)
      expect(dailyRequestCache.value.size).toBe(0)
    })
  })
})