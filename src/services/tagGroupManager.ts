import type { TagGroupConfig, TagGroup, Tag } from '../types/tagGroup';
import { addStorageChangeListener, getFromStorage, setToStorage } from './browserStorage.js'
import { DEFAULT_LOCALE, resolveSupportedLocale } from '../i18n'

// Tag Groups configuration and storage management
const TAG_GROUPS_KEY = 'FRESH_TAB_TAG_GROUPS';
const TAG_GROUP_ICONS_KEY = 'FRESH_TAB_TAG_GROUP_ICONS';
const TAG_GROUPS_VERSION = '1';

export function createDefaultTagGroups(locale: string = DEFAULT_LOCALE): TagGroupConfig {
    const resolvedLocale = resolveSupportedLocale(locale);
    const isEnglish = resolvedLocale === 'en-US';

    return {
        version: TAG_GROUPS_VERSION,
        lastModified: new Date().toISOString(),
        groups: [
            {
                id: 'default',
                name: isEnglish ? 'Favorites' : '常用网站',
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
                name: isEnglish ? 'Development' : '开发工具',
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
}

export const defaultTagGroups: TagGroupConfig = createDefaultTagGroups();

function stripLargeIconData(tagGroups: TagGroupConfig): TagGroupConfig {
    return {
        ...tagGroups,
        groups: tagGroups.groups.map((group) => ({
            ...group,
            tags: (group.tags || []).map((tag) => {
                const { faviconData, ...rest } = tag;
                return rest;
            })
        }))
    };
}

function extractTagIcons(tagGroups: TagGroupConfig): Record<string, string> {
    return tagGroups.groups.reduce((iconMap, group) => {
        (group.tags || []).forEach((tag) => {
            if (tag.faviconData) {
                iconMap[tag.id] = tag.faviconData;
            }
        });
        return iconMap;
    }, {} as Record<string, string>);
}

function mergeTagIcons(tagGroups: TagGroupConfig, iconMap: Record<string, string>): TagGroupConfig {
    return {
        ...tagGroups,
        groups: tagGroups.groups.map((group) => ({
            ...group,
            tags: (group.tags || []).map((tag) => ({
                ...tag,
                faviconData: iconMap[tag.id] || tag.faviconData
            }))
        }))
    };
}

async function getTagGroupIcons(): Promise<Record<string, string>> {
    try {
        const result = await getFromStorage(TAG_GROUP_ICONS_KEY, 'local');
        return result[TAG_GROUP_ICONS_KEY] || {};
    } catch (error) {
        console.error('Failed to get tag group icons:', error);
        return {};
    }
}

/**
 * Tag groups migration function
 * Handle configuration changes between different versions
 * @param {TagGroupConfig} savedTagGroups - Tag groups data from storage
 * @returns {Promise<TagGroupConfig>} Migrated tag groups data
 */
async function migrateTagGroups(savedTagGroups: Partial<TagGroupConfig>, locale: string = DEFAULT_LOCALE): Promise<TagGroupConfig> {
    const savedVersion = savedTagGroups.version || "0";
    if (savedVersion === TAG_GROUPS_VERSION) {
        return savedTagGroups as TagGroupConfig;
    }

    let migratedTagGroups: TagGroupConfig = { ...createDefaultTagGroups(locale) };

    switch (savedVersion) {
        case "0":
            migratedTagGroups = createDefaultTagGroups(locale);
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
export async function getTagGroups(locale: string = DEFAULT_LOCALE): Promise<TagGroupConfig> {
    try {
        const result = await getFromStorage(TAG_GROUPS_KEY);
        const data = result[TAG_GROUPS_KEY];

        if (!data) {
            const seededTagGroups = createDefaultTagGroups(locale);
            await setTagGroups(seededTagGroups);
            return seededTagGroups;
        }

        const savedTagGroups = JSON.parse(data) as Partial<TagGroupConfig>;
        const migratedTagGroups = await migrateTagGroups(savedTagGroups, locale);
        const iconMap = await getTagGroupIcons();
        return mergeTagIcons(migratedTagGroups, iconMap);
    } catch (error) {
        console.error('Failed to get tag groups:', error);
        return createDefaultTagGroups(locale);
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

        const data = JSON.stringify(stripLargeIconData(dataToSave));
        const iconMap = extractTagIcons(dataToSave);

        await setToStorage({[TAG_GROUPS_KEY]: data}, 'sync');
        await setToStorage({[TAG_GROUP_ICONS_KEY]: iconMap}, 'local');
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
    addStorageChangeListener((changes: { [key: string]: { newValue: string } }, areaName: string) => {
        if (areaName === 'sync' && TAG_GROUPS_KEY in changes) {
            const value = JSON.parse(changes[TAG_GROUPS_KEY].newValue) as TagGroupConfig;
            void getTagGroupIcons().then((iconMap) => {
                callback(mergeTagIcons(value, iconMap));
            });
        }
    }, 'sync');

    addStorageChangeListener((_changes, areaName: string) => {
        if (areaName === 'local') {
            void getTagGroups().then(callback);
        }
    }, 'local');
}
