export const CURRENCT_VERSION = '1';

export type IconType = 'emoji' | 'image' | 'svg' | 'text' | 'favicon';

export interface Tag {
    id: string;
    name: string;
    url: string;
    iconType: IconType;
    iconValue: string;
    backgroundColor: string;
    iconData?: string; // Base64 encoded icon data stored in local storage
    faviconData?: string; // Legacy field kept for backward compatibility
}

export interface TagGroup {
    id: string;
    name: string;
    emoji: string;
    themeColor: string;
    tags: Tag[];
}

export interface TagGroupConfig {
    version: string;
    lastModified: string;
    groups: TagGroup[];
}
