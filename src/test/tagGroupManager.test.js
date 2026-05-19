import { describe, expect, it } from 'vitest'
import { createDefaultTagGroups } from '../services/tagGroupManager'

describe('tag group seed localization', () => {
  it('creates Chinese defaults for zh locales', () => {
    const groups = createDefaultTagGroups('zh-CN')

    expect(groups.groups[0].name).toBe('常用网站')
    expect(groups.groups[1].name).toBe('开发工具')
    expect(groups.groups[0].tags[0].name).toBe('Google')
    expect(groups.groups[0].tags[1].name).toBe('GitHub')
    expect(groups.groups[0].tags[2].name).toBe('Stack Overflow')
    expect(groups.groups[1].tags[0].name).toBe('VS Code')
    expect(groups.groups[1].tags[1].name).toBe('npm')
  })

  it('creates English defaults for en locales', () => {
    const groups = createDefaultTagGroups('en-US')

    expect(groups.groups[0].name).toBe('Favorites')
    expect(groups.groups[1].name).toBe('Development')
    expect(groups.groups[0].tags[0].name).toBe('Google')
    expect(groups.groups[0].tags[1].name).toBe('GitHub')
    expect(groups.groups[0].tags[2].name).toBe('Stack Overflow')
    expect(groups.groups[1].tags[0].name).toBe('VS Code')
    expect(groups.groups[1].tags[1].name).toBe('npm')
  })
})
