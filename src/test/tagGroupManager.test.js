import { describe, expect, it } from 'vitest'
import { createDefaultTagGroups } from '../services/tagGroupManager'

describe('tag group seed localization', () => {
  it('creates Chinese defaults for zh locales', () => {
    const groups = createDefaultTagGroups('zh-CN')

    expect(groups.groups[0].name).toBe('常用网站')
    expect(groups.groups[1].name).toBe('开发工具')
  })

  it('creates English defaults for en locales', () => {
    const groups = createDefaultTagGroups('en-US')

    expect(groups.groups[0].name).toBe('Favorites')
    expect(groups.groups[1].name).toBe('Development')
  })
})
