/**
 * FaviconDownloader
 * Find favicon URL and download it easy
 * JavaScript port of PHP version from https://github.com/ao/favicons
 * Requirements: Modern browser with fetch API support
 * @version 1.0.0
 */
class FaviconDownloader {
    constructor(url = null, auto = true) {
        this.url = null           // (string) Page URL
        this.pageUrl = null       // (string) Page URL, after prospective redirects
        this.siteUrl = null       // (string) Site root URL (homepage), based on pageUrl
        this.icoUrl = null        // (string) full URI to favicon
        this.icoType = null       // (string) favicon type (file extension, ex: ico|gif|png)
        this.findMethod = null    // (string) favicon url determination method
        this.error = null         // (string) details, in case of failure
        this.icoExists = null     // (bool) tell if the favicon exists
        this.icoMd5 = null        // (string) md5 of icoData (not implemented in browser)
        this.icoData = null       // (string) favicon data URL
        this.debugInfo = {}       // (object) additional debug info

        if (!url) return
        this.url = url
        if (!auto) return

        // Auto-execute in constructor
        this.init()
    }

    async init() {
        try {
            await this.getFaviconUrl()
            await this.downloadFavicon()
        } catch (error) {
            this.error = error.message
        }
    }

    /**
     * Download page and search html to find favicon URL. Returns favicon URL.
     */
    async getFaviconUrl() {
        // If already executed, don't need to search again
        if (this.icoUrl) {
            return this.icoUrl
        }

        // Check URL to search
        if (!this.url) {
            throw new Error('URL is empty')
        }

        // Removing fragment (hash) from URL
        let url = this.url
        try {
            const urlObj = new URL(this.url)
            urlObj.hash = ''
            url = urlObj.toString()
        } catch (e) {
            // If URL parsing fails, try to fix it
            if (!this.url.startsWith('http')) {
                url = 'http://' + this.url
            }
        }

        try {
            // Downloading the page
            const response = await this.downloadAs(url)
            const html = await response.text()
            
            // Saving final URL (after prospective redirects) and get root URL
            this.pageUrl = response.url
            const pageUrlObj = new URL(this.pageUrl)
            this.siteUrl = `${pageUrlObj.protocol}//${pageUrlObj.host}/`

            // Default favicon URL
            this.icoUrl = this.siteUrl + 'favicon.ico'
            this.findMethod = 'default'

            // HTML <head> tag extraction
            const headMatch = html.match(/^(.*)<\s*body/is)
            const htmlHead = headMatch ? headMatch[1] : html

            // HTML <base> tag href extraction
            let baseHref = null
            const baseMatch = htmlHead.match(/<base[^>]+href=(['"])([^>]+)\1/i)
            if (baseMatch) {
                baseHref = baseMatch[2].replace(/\/$/, '') + '/'
                this.debugInfo.baseHref = baseHref
            }

            // HTML <link> icon tag analysis
            const linkMatch = htmlHead.match(/<\s*link[^>]*(rel=(['"])[^>\2]*icon[^>\2]*\2)[^>]*>/i)
            if (linkMatch) {
                const linkTag = linkMatch[0]
                this.debugInfo.linkTag = linkTag

                // HTML <link> icon tag href analysis
                const hrefMatch = linkTag.match(/href\s*=\s*(['"])(.*?)\1/i)
                if (hrefMatch) {
                    const icoHref = hrefMatch[2].trim()
                    this.debugInfo.icoHref = icoHref
                    this.findMethod = 'head'

                    // Building full absolute URL
                    const urlType = this.getUrlType(icoHref)
                    this.findMethod += ' ' + urlType

                    switch (urlType) {
                        case 'absolute_full':
                            this.icoUrl = icoHref
                            break
                        case 'absolute_scheme':
                            this.icoUrl = pageUrlObj.protocol + ':' + icoHref
                            break
                        case 'absolute_path':
                            if (baseHref) {
                                this.icoUrl = baseHref + icoHref
                                this.findMethod += ' with base href'
                            } else {
                                this.icoUrl = this.siteUrl.replace(/\/$/, '') + '/' + icoHref.replace(/^\//, '')
                                this.findMethod += ' without base href'
                            }
                            break
                        case 'relative':
                            const path = pageUrlObj.pathname.replace(/\/[^\/]+?$/, '/')
                            if (baseHref) {
                                this.icoUrl = baseHref + icoHref
                                this.findMethod += ' with base href'
                            } else {
                                this.icoUrl = `${pageUrlObj.protocol}//${pageUrlObj.host}${path}${icoHref}`
                                this.findMethod += ' without base href'
                            }
                            break
                    }
                }
            }

            this.icoType = this.getExtension(this.icoUrl)
            return this.icoUrl

        } catch (error) {
            this.error = error.message
            return false
        }
    }

    /**
     * Download the favicon (and check its existence)
     */
    async downloadFavicon() {
        // Check params
        if (!this.icoUrl) {
            return false
        }

        // Prevent useless re-download
        if (this.icoData) {
            return false
        }

        try {
            // Download favicon
            const response = await this.downloadAs(this.icoUrl)
            
            // Failover: if getting a 404 with favicon URL found in HTML source, trying with the default favicon URL
            if (!response.ok && response.status === 404 && this.findMethod !== 'default' && !this.debugInfo.failover) {
                this.icoUrl = this.siteUrl + 'favicon.ico'
                this.findMethod = 'default'
                this.icoType = this.getExtension(this.icoUrl)
                this.debugInfo.failover = true
                return await this.downloadFavicon()
            }

            // Download error
            if (!response.ok) {
                this.error = `HTTP ${response.status}`
                return false
            }

            // Check favicon content
            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('text/html') || contentType.includes('text/plain')) {
                this.error = "Seems to be HTML page"
                return false
            }

            // Convert to data URL for browser compatibility
            const blob = await response.blob()
            if (blob.size === 0) {
                this.error = "Empty content"
                return false
            }

            // Create data URL
            const reader = new FileReader()
            return new Promise((resolve, reject) => {
                reader.onload = () => {
                    this.icoData = reader.result
                    this.icoExists = true
                    resolve(true)
                }
                reader.onerror = () => {
                    this.error = "Failed to read favicon data"
                    reject(false)
                }
                reader.readAsDataURL(blob)
            })

        } catch (error) {
            this.error = error.message
            return false
        }
    }

    /**
     * Download URL with fetch API
     */
    async downloadAs(url) {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            redirect: 'follow'
        })
        return response
    }

    /**
     * Return file extension from an URL or a file path
     */
    getExtension(filename) {
        if (/^(https?|ftp)/i.test(filename)) {
            try {
                const url = new URL(filename)
                filename = url.pathname
            } catch (e) {
                return ''
            }
        }

        const match = filename.match(/\.([^.]+)$/)
        return match ? match[1] : ''
    }

    /**
     * Return URL type, either:
     * - absolute_full   ex: http://www.domain.com/images/fav.ico
     * - absolute_scheme ex: //www.domain.com/images/fav.ico
     * - absolute_path   ex: /images/fav.ico
     * - relative        ex: ../images/fav.ico
     */
    getUrlType(url) {
        if (!url) return false
        
        try {
            new URL(url)
            return 'absolute_full'
        } catch (e) {
            // Not a full URL
        }

        if (/^\/\//.test(url)) return 'absolute_scheme'
        if (/^\/[^\/]/.test(url)) return 'absolute_path'
        return 'relative'
    }

    /**
     * Show object printable properties for debugging
     */
    debug() {
        const dump = { ...this }
        delete dump.icoData // Don't log binary data
        console.log('FaviconDownloader Debug:', dump)
        return dump
    }
}

/**
 * Utility functions for favicon operations
 */
export const FaviconUtils = {
    /**
     * Get favicon for a URL with multiple fallback strategies
     */
    async getFavicon(url, useCache = true) {
        const domain = this.getDomainFromUrl(url)
        
        // Check cache first
        if (useCache) {
            const cached = this.getCachedFavicon(domain)
            if (cached) return cached
        }

        // Strategy 1: Try to extract favicon from HTML head
        try {
            const downloader = new FaviconDownloader(url)
            await new Promise(resolve => {
                const checkComplete = () => {
                    if (downloader.icoExists !== null || downloader.error) {
                        resolve()
                    } else {
                        setTimeout(checkComplete, 100)
                    }
                }
                checkComplete()
            })

            if (downloader.icoExists && downloader.icoData) {
                if (useCache) {
                    this.setCachedFavicon(domain, downloader.icoData)
                }
                return downloader.icoData
            }
        } catch (error) {
            console.warn('Strategy 1 failed for', url, error)
        }

        // Strategy 2: Try common favicon paths
        const commonPaths = [
            '/favicon.ico',
            '/favicon.png',
            '/apple-touch-icon.png',
            '/apple-touch-icon-precomposed.png'
        ]

        for (const path of commonPaths) {
            try {
                const faviconUrl = `${this.getBaseUrl(url)}${path}`
                const faviconData = await this.downloadFaviconDirect(faviconUrl)
                if (faviconData) {
                    if (useCache) {
                        this.setCachedFavicon(domain, faviconData)
                    }
                    return faviconData
                }
            } catch (error) {
                continue
            }
        }

        // Strategy 3: Try favicon services as fallback
        const faviconServices = [
            `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
            `https://icon.horse/icon/${domain}`,
            `https://favicon.yandex.net/favicon/v2/${domain}?size=32`
        ]

        for (const serviceUrl of faviconServices) {
            try {
                const faviconData = await this.downloadFaviconDirect(serviceUrl)
                if (faviconData) {
                    if (useCache) {
                        this.setCachedFavicon(domain, faviconData)
                    }
                    return faviconData
                }
            } catch (error) {
                continue
            }
        }

        // All strategies failed, return default
        return this.getDefaultFavicon()
    },

    /**
     * Download favicon directly from URL and convert to base64
     */
    async downloadFaviconDirect(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                redirect: 'follow'
            })

            if (!response.ok) return null

            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('text/html') || contentType.includes('text/plain')) {
                return null
            }

            const blob = await response.blob()
            if (blob.size === 0) return null

            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.onerror = () => reject(null)
                reader.readAsDataURL(blob)
            })
        } catch (error) {
            return null
        }
    },

    /**
     * Get base URL from full URL
     */
    getBaseUrl(url) {
        try {
            if (!url.startsWith('http')) {
                url = 'https://' + url
            }
            const urlObj = new URL(url)
            return `${urlObj.protocol}//${urlObj.host}`
        } catch (e) {
            return url
        }
    },

    /**
     * Extract domain from URL
     */
    getDomainFromUrl(url) {
        try {
            if (!url.startsWith('http')) {
                url = 'http://' + url
            }
            const urlObj = new URL(url)
            return urlObj.hostname
        } catch (e) {
            return url
        }
    },

    /**
     * Get cached favicon from localStorage
     */
    getCachedFavicon(domain) {
        try {
            const cached = localStorage.getItem(`favicon_${domain}`)
            if (cached) {
                const data = JSON.parse(cached)
                // Check if cache is still valid (24 hours)
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    return data.favicon
                } else {
                    localStorage.removeItem(`favicon_${domain}`)
                }
            }
        } catch (e) {
            // Ignore cache errors
        }
        return null
    },

    /**
     * Set cached favicon in localStorage
     */
    setCachedFavicon(domain, faviconData) {
        try {
            const data = {
                favicon: faviconData,
                timestamp: Date.now()
            }
            localStorage.setItem(`favicon_${domain}`, JSON.stringify(data))
        } catch (e) {
            // Ignore cache errors (quota exceeded, etc.)
        }
    },

    /**
     * Get default favicon when none is found
     */
    getDefaultFavicon() {
        // Return a simple data URL for a default icon
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjRkZGIi8+CjxwYXRoIGQ9Ik04IDJMNCA2SDEyTDggMloiIGZpbGw9IiM5OTkiLz4KPHBhdGggZD0iTTQgNkg4VjE0SDRWNloiIGZpbGw9IiM5OTkiLz4KPHN2Zz4K'
    },

    /**
     * Clear all cached favicons
     */
    clearCache() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('favicon_')) {
                    localStorage.removeItem(key)
                }
            })
        } catch (e) {
            // Ignore errors
        }
    }
}

// Export the main class as default
export default FaviconDownloader