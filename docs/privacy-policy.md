# FreshTab 隐私政策

## 概述
FreshTab 是一个注重用户隐私的新标签页扩展。本文档详细说明了扩展所需的权限以及数据处理方式。

## 扩展权限说明

### 1. 存储权限 (storage)
**用途**: 保存用户的个人设置和数据
- 保存主题设置（浅色/深色/跟随系统）
- 保存时间显示格式偏好
- 保存用户自定义的书签和标签组
- 保存界面布局设置（列数、显示宽度等）

**数据范围**: 仅限用户在扩展内设置的配置信息
**存储位置**: Chrome 浏览器本地存储和同步存储
**数据传输**: 数据仅在用户设备和 Chrome 同步服务之间传输

### 2. 最常访问网站权限 (topSites)
**用途**: 获取用户最常访问的网站列表
- 为用户提供个性化的网站建议
- 智能填充常用书签
- 提升新标签页的使用体验

**数据范围**: 仅访问 Chrome 浏览器记录的最常访问网站标题和 URL
**使用限制**: 数据仅在本地使用，不会上传到任何服务器
**用户控制**: 用户可以选择不使用此功能

## 数据处理原则

### 本地优先
- 所有数据优先存储在用户本地设备
- 不依赖外部服务器或第三方服务
- 用户完全控制自己的数据

### 最小权限原则
- 仅请求功能必需的最少权限
- 不收集用户个人身份信息
- 不追踪用户浏览行为

### 数据安全
- 使用 Chrome 官方存储 API 确保数据安全
- 遵循浏览器安全标准
- 数据传输使用 HTTPS 加密

## 数据同步

### Chrome 同步存储
- 用户设置可通过 Chrome 账户在多设备间同步
- 同步由 Google Chrome 浏览器管理
- 用户可以在 Chrome 设置中控制同步行为

### 备用本地存储
- 当 Chrome 同步不可用时，自动使用本地存储
- 确保在任何情况下都能保存用户设置
- 数据不会丢失或泄露

## 用户权利

### 数据控制
- 用户可以随时重置所有设置到默认状态
- 可以通过卸载扩展完全删除所有数据
- 可以手动清理浏览器存储中的扩展数据

### 权限撤销
- 用户可以在 Chrome 扩展管理页面撤销权限
- 撤销权限后，相关功能将不可用
- 不会影响已保存的用户数据

## 第三方服务

### 无外部依赖
- FreshTab 不依赖任何第三方分析服务
- 不使用广告追踪或数据收集服务
- 不向任何外部服务器发送用户数据

### 外部链接
- 搜索功能会根据用户选择跳转到搜索引擎网站
- 书签点击会打开相应的网站
- 这些跳转不受扩展控制，遵循目标网站的隐私政策

## 更新说明

### 版本更新
- 扩展更新时会保留用户所有设置
- 新功能可能需要额外权限，会提前通知用户
- 用户可以选择是否同意新权限

### 政策变更
- 如有隐私政策变更，会在扩展更新日志中说明
- 重大变更会在扩展内显示通知
- 用户有权了解所有数据处理变更

## 联系我们

如果您对隐私政策有任何疑问或建议，请通过以下方式联系：
- GitHub Issues: [项目地址](https://github.com/vamosdalian/FreshTab/issues)
- 邮箱: [联系邮箱](mailto:elve960520@gmail.com)

## 生效日期
本隐私政策自 2025年 起生效。

---
*最后更新: 2025年*
