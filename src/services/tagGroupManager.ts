import type { TagGroupConfig, TagGroup, Tag } from '../types/tagGroup';

// Tag Groups configuration and storage management
const TAG_GROUPS_KEY = 'FRESH_TAB_TAG_GROUPS';
const TAG_GROUPS_VERSION = '1';

export const defaultTagGroups: TagGroupConfig = {
    version: TAG_GROUPS_VERSION, // config version
    lastModified: new Date().toISOString(),
    groups: [
        {
            id: 'default',
            name: '常用网站',
            emoji: '🌟',
            themeColor: '#667eea',
            tags: [
                { 
                    id: 'google', 
                    name: 'Google', 
                    url: 'https://www.google.com',
                    iconType: 'emoji',
                    iconValue: '🔍',
                    backgroundColor: '#4285f4'
                },
                { 
                    id: 'github', 
                    name: 'GitHub', 
                    url: 'https://github.com',
                    iconType: 'emoji',
                    iconValue: '🐱',
                    backgroundColor: '#333'
                },
                { 
                    id: 'sto', 
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
                    id: 'vacode', 
                    name: 'VS Code', 
                    url: 'https://code.visualstudio.com',
                    iconType: 'emoji',
                    iconValue: '⚡',
                    backgroundColor: '#007acc'
                },
                { 
                    id: 'npm', 
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
 * @param {TagGroupConfig} savedTagGroups - Tag groups data from storage
 * @returns {Promise<TagGroupConfig>} Migrated tag groups data
 */
async function migrateTagGroups(savedTagGroups: Partial<TagGroupConfig>): Promise<TagGroupConfig> {
    const savedVersion = savedTagGroups.version || "0";
    if (savedVersion === TAG_GROUPS_VERSION) {
        return savedTagGroups as TagGroupConfig;
    }

    let migratedTagGroups: TagGroupConfig = { ...defaultTagGroups };

    switch (savedVersion) {
        case "0":
            migratedTagGroups = defaultTagGroups;
            break;
        // Add more cases for future migrations as needed
        default:
            console.warn(`Unknown saved version: ${savedVersion}. No migration logic defined.`);
            break;
    }
    
    migratedTagGroups.version = TAG_GROUPS_VERSION;

    await setTagGroups(migratedTagGroups);

    return migratedTagGroups;
}

/**
 * Get complete tag groups configuration.
 * Returns default configuration if none exists in storage.
 * @returns {Promise<TagGroupConfig>} Tag groups object
 */
export async function getTagGroups(): Promise<TagGroupConfig> {
    try {
        const result = await storage.get(TAG_GROUPS_KEY);
        const data = result[TAG_GROUPS_KEY] || "{}";
        const savedTagGroups = JSON.parse(data) as Partial<TagGroupConfig>;
        const migratedTagGroups = await migrateTagGroups(savedTagGroups);
        return migratedTagGroups;
    } catch (error) {
        console.error('Failed to get tag groups:', error);
        return defaultTagGroups;
    }
}

/**
 * Update and save tag groups configuration.
 * @param {TagGroupConfig} newTagGroups - Tag groups data to save
 * @returns {Promise<void>}
 */
export async function setTagGroups(newTagGroups: TagGroupConfig): Promise<void> {
    try {
        const dataToSave: TagGroupConfig = {
            ...newTagGroups,
            lastModified: new Date().toISOString()
        };

        const data = JSON.stringify(dataToSave); 
        await storage.set({[TAG_GROUPS_KEY]: data});
    } catch (error) {
        console.error('Failed to save tag groups:', error);
        throw error;
    }
}

/**
 * Listen for tag groups changes from other sources (like other tabs or background).
 * @param {function(TagGroupConfig): void} callback - Callback function called when tag groups change
 */
export function onTagGroupsChange(callback: (tagGroups: TagGroupConfig) => void): void {
    chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
        if (areaName === 'sync') {
            if (TAG_GROUPS_KEY in changes) {
                console.log('[chrome.storage.sync] Tag groups changed new value:', 
                    changes[TAG_GROUPS_KEY].newValue);
                callback(changes[TAG_GROUPS_KEY].newValue);
            }
        }
    });
}
