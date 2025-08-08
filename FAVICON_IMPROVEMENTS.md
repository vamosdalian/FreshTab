# Favicon 获取功能改进

## 问题描述
在添加标签时无法访问 favicon 的问题，原因是简单地使用 `/favicon.ico` 路径无法覆盖所有网站的情况。

## 解决方案

### 1. 多策略 Favicon 获取
改进了 `FaviconUtils.getFavicon()` 方法，采用多重回退策略：

**策略 1: HTML 头部解析**
- 使用 `FaviconDownloader` 类解析网站 HTML 头部
- 查找 `<link rel="icon">` 标签
- 支持相对路径和绝对路径解析

**策略 2: 常见路径尝试**
- `/favicon.ico`
- `/favicon.png` 
- `/apple-touch-icon.png`
- `/apple-touch-icon-precomposed.png`

**策略 3: 第三方服务回退**
- Google Favicon API
- Icon.horse 服务
- Yandex Favicon API

### 2. Base64 数据存储
- 在 `Tag` 接口中添加了 `faviconData?: string` 字段
- 成功获取的 favicon 以 base64 格式存储在标签数据中
- 下次加载时直接使用存储的 base64 数据，无需重新获取

### 3. 缓存机制
- 使用 localStorage 缓存 favicon 数据
- 缓存有效期为 24 小时
- 按域名进行缓存，避免重复请求

### 4. 错误处理改进
- 添加了完善的错误处理机制
- 当所有策略都失败时，使用默认 SVG 图标
- 在 TagsSection 组件中优先显示存储的 base64 数据

## 代码变更

### 文件修改列表
1. `src/services/favicons.js` - 改进 favicon 获取逻辑
2. `src/types/tagGroup.d.ts` - 添加 faviconData 字段
3. `src/components/TagModal.vue` - 更新表单处理和预览
4. `src/components/TagsSection.vue` - 优先使用存储的 favicon 数据
5. `src/composables/useTagGroups.js` - 支持 faviconData 传递
6. `src/stores/tagGroupsStore.ts` - 存储 faviconData 字段

### 主要改进点
- **多重回退策略**: 确保在各种情况下都能获取到合适的图标
- **本地存储**: 将获取到的 favicon 以 base64 格式存储，避免网络依赖
- **性能优化**: 使用缓存机制减少重复请求
- **用户体验**: 改进加载状态和错误处理

## 使用方式
1. 用户在添加标签时输入 URL
2. 系统自动尝试获取网站的 favicon
3. 成功获取后以 base64 格式存储在标签数据中
4. 下次显示时直接使用存储的数据，无需网络请求

## 测试
创建了测试文件 `test-favicon.html` 和 `favicon-test-simple.js` 用于验证功能。

## 兼容性
- 保持向后兼容，现有的 `validFaviconUrl` 字段仍然支持
- 优先使用新的 `faviconData` 字段
- 在没有存储数据时回退到原有逻辑