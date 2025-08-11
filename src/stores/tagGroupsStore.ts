import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';
import type { TagGroupConfig, TagGroup, Tag } from '../types/tagGroup';
import { setTagGroups, onTagGroupsChange, getTagGroups } from '../services/tagGroupManager';

export const useTagGroupsStore = defineStore('tagGroups', () => {
  const tagGroups: Ref<TagGroupConfig> = ref({} as TagGroupConfig);

  async function initialize(): Promise<void> {
    const data = await getTagGroups();
    tagGroups.value = data;
    
    console.log('[Pinia] Tag groups initialized.', tagGroups.value);

    onTagGroupsChange((changedTagGroups: TagGroupConfig) => {
      console.log('[Pinia] Detected tag groups changes from background.', changedTagGroups);
      tagGroups.value = changedTagGroups;
    });
  }

  async function updateTagGroups(newTagGroups: TagGroupConfig): Promise<void> {
    tagGroups.value = { ...newTagGroups };
    await setTagGroups(tagGroups.value);
  }

  async function addGroup(group: Partial<TagGroup>): Promise<TagGroup> {
    const groups = tagGroups.value.groups;
    console.log('[Pinia] (debug) groups', groups);

    const newGroup: TagGroup = {
      id: group.id || `group_${Date.now()}`,
      name: group.name || '',
      emoji: group.emoji || '📁',
      themeColor: group.themeColor || '#666',
      tags: group.tags || []
    };

    if (groups.findIndex(g => g.id === newGroup.id) !== -1) {
      throw new Error(`Group with id ${group.id} already exists`);
    }
    
    const updatedTagGroups: TagGroupConfig = {
      ...tagGroups.value,
      groups: [...groups, newGroup]
    };
    
    await updateTagGroups(updatedTagGroups);
    return newGroup;
  }

  async function updateGroup(groupId: string, updatedGroup: Partial<TagGroup>): Promise<TagGroup> {
    const groups = tagGroups.value.groups;
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    const updatedGroups = [...groups];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], ...updatedGroup };
    
    const updatedTagGroups: TagGroupConfig = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
    return updatedGroups[groupIndex];
  }

  async function removeGroup(groupId: string): Promise<void> {    
    const groups = tagGroups.value.groups;
    const updatedGroups = groups.filter(g => g.id !== groupId);
    
    const updatedTagGroups: TagGroupConfig = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
  }

  async function addTag(groupId: string, tag: Partial<Tag>): Promise<Tag> {
    const newTag: Tag = {
      id: tag.id || `tag_${Date.now()}`,
      name: tag.name || '',
      url: tag.url || '',
      iconType: tag.iconType || 'emoji',
      iconValue: tag.iconValue || '🔗',
      backgroundColor: tag.backgroundColor || '#666',
      faviconData: tag.faviconData
    };
    
    const groups = tagGroups.value.groups;
    let groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    const updatedGroups = [...groups];
    updatedGroups[groupIndex] = {
      ...updatedGroups[groupIndex],
      tags: [...updatedGroups[groupIndex].tags, newTag]
    };
    
    const updatedTagGroups: TagGroupConfig = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
    return newTag;
  }

  async function updateTag(groupId: string, tagId: string, updatedTag: Partial<Tag>): Promise<Tag> {
    const groups = tagGroups.value.groups;
    let groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    const group = groups[groupIndex];
    const tags = group.tags || [];
    const tagIndex = tags.findIndex(t => t.id === tagId);
    
    if (tagIndex === -1) {
      throw new Error(`Tag with id ${tagId} not found in group ${groupId}`);
    }
    
    const updatedGroups = [...groups];
    const updatedTags = [...tags];
    updatedTags[tagIndex] = { ...updatedTags[tagIndex], ...updatedTag };
    updatedGroups[groupIndex] = { ...group, tags: updatedTags };
    
    const updatedTagGroups: TagGroupConfig = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
    return updatedTags[tagIndex];
  }

  async function removeTag(groupId: string, tagId: string): Promise<void> {
    const groups = tagGroups.value.groups;
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    const group = groups[groupIndex];
    const updatedTags = (group.tags).filter(t => t.id !== tagId);
    
    const updatedGroups = [...groups];
    updatedGroups[groupIndex] = { ...group, tags: updatedTags };
    
    const updatedTagGroups: TagGroupConfig = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
  }

  return {
    tagGroups,
    initialize,
    addGroup,
    updateGroup,
    removeGroup,
    addTag,
    updateTag,
    removeTag,
  };
});
