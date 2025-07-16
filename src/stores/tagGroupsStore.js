import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as tagGroupManager from '../services/tagGroupManager.js';

export const useTagGroupsStore = defineStore('tagGroups', () => {
  const tagGroups = ref({});

  async function initialize() {
    tagGroups.value = await tagGroupManager.getTagGroups();
    console.log('Pinia: Tag groups initialized.', tagGroups.value);

    tagGroupManager.onTagGroupsChange((changedTagGroups) => {
      console.log('Pinia: Detected tag groups changes from background.', changedTagGroups);
      tagGroups.value = changedTagGroups;
    });
  }

  async function updateTagGroups(newTagGroups) {
    tagGroups.value = { ...newTagGroups };
    await tagGroupManager.setTagGroups(tagGroups.value);
    console.log('Pinia: Tag groups persisted to chrome.storage.', tagGroups.value);
  }

  async function addGroup(group) {
    const newGroup = {
      id: group.id || `group_${Date.now()}`,
      name: group.name,
      emoji: group.emoji,
      themeColor: group.themeColor,
      tags: group.tags || []
    };
    
    const updatedTagGroups = {
      ...tagGroups.value,
      groups: [...(tagGroups.value.groups || []), newGroup]
    };
    
    await updateTagGroups(updatedTagGroups);
    return newGroup;
  }

  async function updateGroup(groupId, updatedGroup) {
    const groups = tagGroups.value.groups || [];
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    const updatedGroups = [...groups];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], ...updatedGroup };
    
    const updatedTagGroups = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
    return updatedGroups[groupIndex];
  }

  async function removeGroup(groupId) {
    const groups = tagGroups.value.groups || [];
    const updatedGroups = groups.filter(g => g.id !== groupId);
    
    const updatedTagGroups = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
  }

  async function addTag(groupId, tag) {
    const newTag = {
      id: tag.id || `tag_${Date.now()}`,
      name: tag.name,
      url: tag.url,
      iconType: tag.iconType || 'emoji',
      iconValue: tag.iconValue || '🔗',
      backgroundColor: tag.backgroundColor || '#666'
    };
    
    const groups = tagGroups.value.groups || [];
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    const updatedGroups = [...groups];
    updatedGroups[groupIndex] = {
      ...updatedGroups[groupIndex],
      tags: [...(updatedGroups[groupIndex].tags || []), newTag]
    };
    
    const updatedTagGroups = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
    return newTag;
  }

  async function updateTag(groupId, tagId, updatedTag) {
    const groups = tagGroups.value.groups || [];
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
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
    
    const updatedTagGroups = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
    return updatedTags[tagIndex];
  }

  async function removeTag(groupId, tagId) {
    const groups = tagGroups.value.groups || [];
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    const group = groups[groupIndex];
    const updatedTags = (group.tags || []).filter(t => t.id !== tagId);
    
    const updatedGroups = [...groups];
    updatedGroups[groupIndex] = { ...group, tags: updatedTags };
    
    const updatedTagGroups = {
      ...tagGroups.value,
      groups: updatedGroups
    };
    
    await updateTagGroups(updatedTagGroups);
  }

  return {
    tagGroups,
    initialize,
    updateTagGroups,
    addGroup,
    updateGroup,
    removeGroup,
    addTag,
    updateTag,
    removeTag,
  };
});
