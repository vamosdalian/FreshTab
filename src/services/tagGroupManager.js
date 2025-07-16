// Tag Groups configuration and storage management
const TAG_GROUPS_KEY = 'FRESH_TAB_TAG_GROUPS';

export const defaultTagGroups = {
    version: "1", // config version
    lastModified: new Date().toISOString(),
    groups: [
        {
            id: 'default',
            name: 'Common Sites',
            emoji: '🌟',
            themeColor: '#667eea',
            tags: [
                { 
                    id: 'tag_1', 
                    name: 'Google', 
                    url: 'https://www.google.com',
                    iconType: 'emoji',
                    iconValue: '🔍',
                    backgroundColor: '#4285f4'
                },
                { 
                    id: 'tag_2', 
                    name: 'GitHub', 
                    url: 'https://github.com',
                    iconType: 'emoji',
                    iconValue: '🐱',
                    backgroundColor: '#333'
                },
                { 
                    id: 'tag_3', 
                    name: 'Stack Overflow', 
                    url: 'https://stackoverflow.com',
                    iconType: 'emoji',
                    iconValue: '📚',
                    backgroundColor: '#f48024'
                }
            ]
        },
        {
            id: 'dev_tools',
            name: 'Development',
            emoji: '💻',
            themeColor: '#38b2ac',
            tags: [
                { 
                    id: 'tag_4', 
                    name: 'VS Code', 
                    url: 'https://code.visualstudio.com',
                    iconType: 'emoji',
                    iconValue: '⚡',
                    backgroundColor: '#007acc'
                },
                { 
                    id: 'tag_5', 
                    name: 'npm', 
                    url: 'https://www.npmjs.com',
                    iconType: 'emoji',
                    iconValue: '📦',
                    backgroundColor: '#cb3837'
                }
            ]
        }
    ]
};

const storage = chrome.storage.sync;

/**
 * Tag groups migration function
 * Handle configuration changes between different versions
 * @param {object} savedTagGroups - Tag groups data from storage
 * @returns {object} Migrated tag groups data
 */
function migrateTagGroups(savedTagGroups) {
    const currentVersion = defaultTagGroups.version;
    const savedVersion = savedTagGroups.version || "0";
    
    // If versions are the same, no migration needed
    if (savedVersion === currentVersion) {
        return savedTagGroups;
    }
    
    // Create migrated tag groups copy
    const migratedTagGroups = { ...savedTagGroups };
    
    // Ensure required fields exist
    if (!migratedTagGroups.groups) {
        migratedTagGroups.groups = [];
    }
    
    if (!migratedTagGroups.lastModified) {
        migratedTagGroups.lastModified = new Date().toISOString();
    }
    
    // Validate and fix group structure
    migratedTagGroups.groups = migratedTagGroups.groups.map(group => {
        const validGroup = {
            id: group.id || `group_${Date.now()}`,
            name: group.name || 'Unnamed Group',
            emoji: group.emoji || '📁',
            themeColor: group.themeColor || '#667eea',
            tags: Array.isArray(group.tags) ? group.tags : []
        };
        
        // Validate and fix tag structure
        validGroup.tags = validGroup.tags.map(tag => ({
            id: tag.id || `tag_${Date.now()}`,
            name: tag.name || 'Unnamed Tag',
            url: tag.url || '',
            iconType: tag.iconType || 'emoji',
            iconValue: tag.iconValue || '🔗',
            backgroundColor: tag.backgroundColor || '#666'
        }));
        
        return validGroup;
    });
    
    // Update version
    migratedTagGroups.version = currentVersion;
    migratedTagGroups.lastModified = new Date().toISOString();
    
    return migratedTagGroups;
}

/**
 * Get complete tag groups configuration.
 * Returns default configuration if none exists in storage.
 * @returns {Promise<object>} Tag groups object
 */
export async function getTagGroups() {
    try {
        const result = await storage.get(TAG_GROUPS_KEY);
        const savedTagGroups = result[TAG_GROUPS_KEY] || {};
        
        // If no saved data, return default
        if (!savedTagGroups.groups) {
            return defaultTagGroups;
        }
        
        // Version migration logic
        const migratedTagGroups = migrateTagGroups(savedTagGroups);
        
        // If configuration was migrated, save the new configuration
        if (migratedTagGroups !== savedTagGroups) {
            await setTagGroups(migratedTagGroups);
        }

        return migratedTagGroups;
    } catch (error) {
        console.error('Failed to get tag groups:', error);
        return defaultTagGroups;
    }
}

/**
 * Update and save tag groups configuration.
 * @param {object} newTagGroups - Tag groups data to save
 * @returns {Promise<void>}
 */
export async function setTagGroups(newTagGroups) {
    try {
        const dataToSave = {
            ...newTagGroups,
            lastModified: new Date().toISOString()
        };
        await storage.set({[TAG_GROUPS_KEY]: dataToSave});
    } catch (error) {
        console.error('Failed to save tag groups:', error);
        throw error;
    }
}

/**
 * Listen for tag groups changes from other sources (like other tabs or background).
 * @param {function(object)} callback - Callback function called when tag groups change
 */
export function onTagGroupsChange(callback) {
    storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync') {
            if (TAG_GROUPS_KEY in changes) {
                callback(changes[TAG_GROUPS_KEY].newValue);
            }
        }
    });
}
