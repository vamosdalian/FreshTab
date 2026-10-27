import type { TagGroupConfig, TagGroup, Tag } from '../types/tagGroup';
import { addStorageChangeListener, getFromStorage, removeFromStorage, setToStorage } from './browserStorage.js'
import { DEFAULT_LOCALE, messages, resolveSupportedLocale } from '../i18n'

// Tag Groups configuration and storage management
// Legacy single-key storage; exceeds chrome.storage.sync QUOTA_BYTES_PER_ITEM (8KB) once there are many tags
const TAG_GROUPS_KEY = 'FRESH_TAB_TAG_GROUPS';
// Current storage: the serialized config split across chunk keys, with the chunk count stored separately
const TAG_GROUPS_CHUNK_COUNT_KEY = 'FRESH_TAB_TAG_GROUPS_CHUNKS';
const TAG_GROUPS_CHUNK_KEY_PREFIX = 'FRESH_TAB_TAG_GROUPS_CHUNK_';
// Below the 8192-byte per-item quota, leaving room for the key name and JSON quoting
const TAG_GROUPS_CHUNK_MAX_BYTES = 7800;
const TAG_GROUP_ICONS_KEY = 'FRESH_TAB_TAG_GROUP_ICONS';
const TAG_GROUPS_VERSION = '1';

const textEncoder = new TextEncoder();

function getChunkKey(index: number): string {
    return `${TAG_GROUPS_CHUNK_KEY_PREFIX}${index}`;
}

function isTagGroupsStorageKey(key: string): boolean {
    return key === TAG_GROUPS_KEY || key === TAG_GROUPS_CHUNK_COUNT_KEY || key.startsWith(TAG_GROUPS_CHUNK_KEY_PREFIX);
}

/**
 * Split a string into chunks whose stored size (UTF-8 bytes after JSON encoding) fits the sync per-item quota.
 */
export function splitIntoChunks(data: string, maxBytes: number = TAG_GROUPS_CHUNK_MAX_BYTES): string[] {
    const chunks: string[] = [];
    let current = '';
    let currentBytes = 0;

    for (const char of data) {
        const charBytes = textEncoder.encode(JSON.stringify(char).slice(1, -1)).length;
        if (currentBytes + charBytes > maxBytes && current) {
            chunks.push(current);
            current = '';
            currentBytes = 0;
        }
        current += char;
        currentBytes += charBytes;
    }

    if (current || chunks.length === 0) {
        chunks.push(current);
    }

    return chunks;
}

async function readStoredTagGroups(): Promise<string | undefined> {
    const result = await getFromStorage([TAG_GROUPS_CHUNK_COUNT_KEY, TAG_GROUPS_KEY]);
    const chunkCount = result[TAG_GROUPS_CHUNK_COUNT_KEY];

    if (typeof chunkCount !== 'number') {
        return result[TAG_GROUPS_KEY];
    }

    const chunkKeys = Array.from({ length: chunkCount }, (_, index) => getChunkKey(index));
    const chunkResult = await getFromStorage(chunkKeys);
    return chunkKeys.map((key) => chunkResult[key] || '').join('');
}

async function writeStoredTagGroups(data: string): Promise<void> {
    const previous = await getFromStorage(TAG_GROUPS_CHUNK_COUNT_KEY);
    const previousChunkCount = previous[TAG_GROUPS_CHUNK_COUNT_KEY];

    const chunks = splitIntoChunks(data);
    const items: Record<string, string | number> = { [TAG_GROUPS_CHUNK_COUNT_KEY]: chunks.length };
    chunks.forEach((chunk, index) => {
        items[getChunkKey(index)] = chunk;
    });

    await setToStorage(items, 'sync');

    const staleKeys = [TAG_GROUPS_KEY];
    if (typeof previousChunkCount === 'number') {
        for (let index = chunks.length; index < previousChunkCount; index++) {
            staleKeys.push(getChunkKey(index));
        }
    }
    await removeFromStorage(staleKeys, 'sync');
}

export function createDefaultTagGroups(locale: string = DEFAULT_LOCALE): TagGroupConfig {
    const resolvedLocale = resolveSupportedLocale(locale);
    const localeMessages = messages[resolvedLocale] || messages[DEFAULT_LOCALE];
    const seedGroups = localeMessages.seeds.groups;
    const seedTags = localeMessages.seeds.tags;

    return {
        version: TAG_GROUPS_VERSION,
        lastModified: new Date().toISOString(),
        groups: [
            {
                id: 'default',
                name: seedGroups.default,
                emoji: '🌟',
                themeColor: '#667eea',
                tags: [
                    {
                        id: 'google',
                        name: seedTags.google,
                        url: 'https://www.google.com',
                        iconType: 'emoji',
                        iconValue: '🔍',
                        backgroundColor: '#4285f4'
                    },
                    {
                        id: 'github',
                        name: seedTags.github,
                        url: 'https://github.com',
                        iconType: 'emoji',
                        iconValue: '🐱',
                        backgroundColor: '#333'
                    },
                    {
                        id: 'sto',
                        name: seedTags.stackOverflow,
                        url: 'https://stackoverflow.com',
                        iconType: 'emoji',
                        iconValue: '📚',
                        backgroundColor: '#f48024'
                    }
                ]
            },
            {
                id: 'dev_tools',
                name: seedGroups.development,
                emoji: '💻',
                themeColor: '#38b2ac',
                tags: [
                    {
                        id: 'vacode',
                        name: seedTags.vscode,
                        url: 'https://code.visualstudio.com',
                        iconType: 'emoji',
                        iconValue: '⚡',
                        backgroundColor: '#007acc'
                    },
                    {
                        id: 'npm',
                        name: seedTags.npm,
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
                const { iconData, faviconData, ...rest } = tag;
                return rest;
            })
        }))
    };
}

function extractTagIcons(tagGroups: TagGroupConfig): Record<string, string> {
    return tagGroups.groups.reduce((iconMap, group) => {
        (group.tags || []).forEach((tag) => {
            const iconData = tag.iconData || tag.faviconData;
            if (iconData) {
                iconMap[tag.id] = iconData;
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
            tags: (group.tags || []).map((tag) => {
                const { faviconData, ...rest } = tag;
                const iconData = iconMap[tag.id] || tag.iconData || faviconData;
                return iconData ? { ...rest, iconData } : rest;
            })
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
        const data = await readStoredTagGroups();

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

        await writeStoredTagGroups(data);
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
    addStorageChangeListener((changes: { [key: string]: unknown }, areaName: string) => {
        if (areaName !== 'sync' || !Object.keys(changes).some(isTagGroupsStorageKey)) {
            return;
        }

        // Chunks may change across several events, so re-read the whole config instead of using newValue
        void readStoredTagGroups().then(async (data) => {
            if (!data) {
                return;
            }
            const value = JSON.parse(data) as TagGroupConfig;
            const iconMap = await getTagGroupIcons();
            callback(mergeTagIcons(value, iconMap));
        }).catch((error) => {
            console.error('Failed to reload tag groups after storage change:', error);
        });
    }, 'sync');

    addStorageChangeListener((_changes, areaName: string) => {
        if (areaName === 'local') {
            void getTagGroups().then(callback);
        }
    }, 'local');
}
