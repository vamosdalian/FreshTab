import { computed } from 'vue'
import { useTagGroupsStore } from '../stores/tagGroupsStore.js'
import { useToast } from './useToast'

export function useTagGroups() {
  const tagGroupsStore = useTagGroupsStore()
  const { error, warning, success } = useToast()

  // Computed property to get groups array from store
  const tagGroups = computed(() => {
    return tagGroupsStore.tagGroups.groups || []
  })

  // Theme colors for groups
  const themeColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
    '#43e97b', '#38f9d7', '#ffa726', '#ff7043', '#ab47bc', '#5c6bc0',
    '#26a69a', '#66bb6a', '#ffa726', '#ff8a65', '#8d6e63', '#78909c'
  ]

  // Initialize tag groups from storage
  async function initialize() {
    try {
      await tagGroupsStore.initialize()
    } catch (err) {
      error('Failed to load tag groups')
      console.error('Tag groups initialization error:', err)
    }
  }

  // Group operations
  async function addGroup(name, emoji = '📁', themeColor = '#667eea') {
    if (!name || !name.trim()) {
      warning('Please enter group name')
      throw new Error('Group name cannot be empty')
    }
    
    try {
      const newGroup = await tagGroupsStore.addGroup({
        name: name.trim(),
        emoji,
        themeColor,
        tags: []
      })
      success(`Group "${newGroup.name}" created`)
      return newGroup
    } catch (err) {
      error('Failed to create group')
      throw err
    }
  }

  async function editGroup(groupId, updates) {
    if (updates.name && !updates.name.trim()) {
      warning('Group name cannot be empty')
      throw new Error('Group name cannot be empty')
    }
    
    try {
      if (updates.name) {
        updates.name = updates.name.trim()
      }
      await tagGroupsStore.updateGroup(groupId, updates)
      success('Group updated')
    } catch (err) {
      error('Failed to update group')
      throw err
    }
  }

  async function deleteGroup(groupId) {
    if (groupId === 'default') {
      warning('Cannot delete default group')
      return false
    }
    
    if (confirm('Are you sure you want to delete this group? All tags in the group will also be deleted.')) {
      try {
        await tagGroupsStore.removeGroup(groupId)
        success('Group deleted')
        return true
      } catch (err) {
        error('Failed to delete group')
        throw err
      }
    }
    return false
  }

  // Tag operations
  async function addTag(groupId, tagData) {
    try {
      let url = tagData.url
      
      // Ensure URL format is correct
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      
      const newTag = await tagGroupsStore.addTag(groupId, {
        ...tagData,
        url,
        iconType: tagData.iconType || 'favicon',
        iconValue: tagData.iconValue || '',
        backgroundColor: tagData.backgroundColor || '#667eea'
      })
      
      success(`Tag "${newTag.name}" added`)
      return newTag
    } catch (err) {
      error('Failed to add tag')
      throw err
    }
  }

  async function editTag(groupId, tagId, updates) {
    try {
      // If URL changed and is favicon type, clear old validFaviconUrl
      if (updates.url && updates.iconType === 'favicon' && !updates.validFaviconUrl) {
        updates.validFaviconUrl = undefined
      }
      
      await tagGroupsStore.updateTag(groupId, tagId, updates)
      success('Tag updated')
    } catch (err) {
      error('Failed to update tag')
      throw err
    }
  }

  async function deleteTag(groupId, tagId) {
    try {
      await tagGroupsStore.removeTag(groupId, tagId)
      success('Tag deleted')
    } catch (err) {
      error('Failed to delete tag')
      throw err
    }
  }

  // Utility functions
  function getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname
      
      // Favicon services list (by priority)
      const faviconServices = [
        // Domestic services (faster)
        `https://api.iowen.cn/favicon/${domain}.png`,
        `https://favicon.link/icon?url=${domain}`,
        `https://icon.horse/icon/${domain}`,
        
        // International services (backup)
        `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        `https://favicon.yandex.net/favicon/v2/${domain}?size=32`,
        
        // Direct attempt at website root
        `https://${domain}/favicon.ico`
      ]
      
      return {
        primary: faviconServices[0],
        fallbacks: faviconServices.slice(1)
      }
    } catch {
      return {
        primary: '',
        fallbacks: []
      }
    }
  }
  
  // Simplified version for compatibility
  function getFaviconUrlSimple(url) {
    const result = getFaviconUrl(url)
    return result.primary || ''
  }

  // Generate tag icon
  function generateTagIcon(tag) {
    switch (tag.iconType) {
      case 'emoji':
        return tag.iconValue || '🔗'
      case 'text':
        return tag.iconValue || tag.name.charAt(0).toUpperCase()
      case 'favicon':
      default:
        return ''
    }
  }

  // Save tag groups manually
  async function saveTagGroups() {
    try {
      await tagGroupsStore.updateTagGroups(tagGroupsStore.tagGroups)
      success('Tag groups saved')
    } catch (err) {
      error('Failed to save tag groups')
      throw err
    }
  }

  // Refresh tag groups
  async function refreshTagGroups() {
    await initialize()
  }

  // Reset to default (for fixing corrupted data)
  async function resetToDefault() {
    try {
      const { defaultTagGroups } = await import('../services/tagGroupManager.js')
      await tagGroupsStore.updateTagGroups(defaultTagGroups)
      warning('Reset to default tag groups')
    } catch (err) {
      error('Failed to reset tag groups')
      throw err
    }
  }

  return {
    // Data
    tagGroups,
    themeColors,
    
    // Initialization
    initialize,
    
    // Group operations
    addGroup,
    editGroup,
    deleteGroup,
    
    // Tag operations
    addTag,
    editTag,
    deleteTag,
    
    // Utility functions
    getFaviconUrl,
    getFaviconUrlSimple,
    generateTagIcon,
    saveTagGroups,
    refreshTagGroups,
    resetToDefault
  }
}
