// 1. 定义默认配置和版本号
const SETTING_KEY = 'FRESH_TAB_SETTING';

export const defaultConfig = {
    version: "1", // config version, not the app version
    // bookmarks
    showBookmarks: true,
    displayWidth: 1200,
    columnsPerRow: 6,
    bookmarkSize: 'medium',
    // search
    showSearch: true,
    searchEngine: 'chrome-default',
    //theme
    theme: 'auto',
    isDarkMode: false,
    //date
    showTime: true,
    timeFormat: '24h',
    showDate: true,
    showSeconds: false,
    // wallpaper
    wallpaperMode: 'bing', // 'bing', 'fixed', 'local'
    wallpaperPath: '',
};

const storage = chrome.storage.sync;

/**
 * 配置迁移函数
 * 处理不同版本之间的配置变更
 * @param {object} savedConfig - 从存储中读取的配置
 * @returns {object} 迁移后的配置
 */
function migrateConfig(savedConfig) {
    const currentVersion = defaultConfig.version;
    const savedVersion = savedConfig.version || "0";
    
    // 如果版本相同，无需迁移
    if (savedVersion === currentVersion) {
        return savedConfig;
    }
    
    // 创建迁移后的配置副本
    const migratedConfig = { ...savedConfig };
    
    // 移除不再存在于默认配置中的废弃配置项
    const validKeys = Object.keys(defaultConfig);
    Object.keys(migratedConfig).forEach(key => {
        if (!validKeys.includes(key)) {
            delete migratedConfig[key];
        }
    });
    
    // 添加新增的配置项并使用默认值
    validKeys.forEach(key => {
        if (!(key in migratedConfig)) {
            migratedConfig[key] = defaultConfig[key];
        }
    });
    
    // 更新版本号
    migratedConfig.version = currentVersion;
    
    return migratedConfig;
}

/**
 * 获取完整的配置。
 * 如果存储中没有，则返回默认配置。
 * @returns {Promise<object>} 配置对象
 */
export async function getConfig() {
    try {
        const result = await storage.get(SETTING_KEY);
        const savedConfig = result[SETTING_KEY] || {};
        
        // 版本迁移逻辑
        const migratedConfig = migrateConfig(savedConfig);
        
        // 如果配置被迁移过，保存新的配置
        if (migratedConfig !== savedConfig) {
            await setConfig(migratedConfig);
        }

        return migratedConfig;
    } catch (error) {
        return defaultConfig;
    }
}

/**
 * 更新并保存部分或全部配置。
 * @param {object} newConfig - 需要更新的配置项
 * @returns {Promise<void>}
 */
export async function setConfig(newConfig) {
    try {
        await storage.set({[SETTING_KEY]: newConfig});
    } catch (error) {
        throw error;
    }
}

/**
 * 监听来自其他地方（如其他标签页或后台）的配置变更。
 * @param {function(object)} callback - 当配置变化时调用的回调函数
 */
export function onConfigChange(callback) {
    storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync') {
            if (SETTING_KEY in changes) {
                callback(changes[SETTING_KEY].newValue);
            }
        }
    });
}