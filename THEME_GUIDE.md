# FreshTab 主题切换指南

## 功能概述

FreshTab 现在支持根据系统主题自动切换深色/浅色模式，为用户提供更好的视觉体验。

## 主要特性

### 🌓 自动主题检测
- **跟随系统**: 自动检测用户系统的主题偏好
- **实时响应**: 当系统主题改变时，应用会自动更新
- **智能切换**: 无需手动操作，自动适配用户习惯

### 🎨 三种主题模式
1. **跟随系统** (默认) - 自动根据系统设置切换
2. **浅色模式** - 强制使用浅色主题
3. **深色模式** - 强制使用深色主题

### 🎯 完整的 UI 适配
所有组件都经过优化，支持两种主题模式：

- ✅ 时间显示和问候语
- ✅ 搜索框和引擎选择
- ✅ 书签网格和卡片
- ✅ 设置模态框
- ✅ 书签编辑模态框
- ✅ 设置按钮

## 使用方法

### 通过设置面板
1. 点击右上角的设置按钮 ⚙️
2. 找到"主题设置"部分
3. 在"主题模式"下拉菜单中选择：
   - **跟随系统**: 根据系统主题自动切换
   - **浅色模式**: 始终使用浅色主题
   - **深色模式**: 始终使用深色主题

### 系统主题检测
当选择"跟随系统"时，应用会：
- 检测当前系统主题偏好
- 监听系统主题变化事件
- 自动应用相应的主题样式

## 主题效果

### 浅色主题
- 明亮的渐变背景
- 高对比度的文字
- 透明的白色卡片
- 适合白天使用

### 深色主题
- 深色的渐变背景
- 柔和的文字颜色
- 暗色的卡片样式
- 适合夜间使用

## 技术实现

### CSS 变量系统
使用 CSS 自定义属性实现主题切换：

```css
:root {
  /* 浅色主题变量 */
  --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --text-color: #333;
  --card-bg: rgba(255, 255, 255, 0.95);
}

[data-theme="dark"] {
  /* 深色主题变量 */
  --bg-gradient: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  --text-color: #e0e0e0;
  --card-bg: rgba(30, 30, 30, 0.95);
}
```

### 系统主题检测
```javascript
// 检测系统主题偏好
const detectSystemTheme = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 监听系统主题变化
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', handleThemeChange)
```

### 设置持久化
- 用户的主题选择会保存到 Chrome 存储或 localStorage
- 应用启动时自动加载并应用用户的主题偏好

## 开发说明

### 添加新组件的主题支持
1. 使用 CSS 变量而不是硬编码颜色
2. 为深色模式添加适当的对比度调整
3. 测试两种主题模式下的视觉效果

### 扩展主题变量
在 `src/style.css` 中添加新的 CSS 变量：

```css
:root {
  --new-variable: value-for-light-theme;
}

[data-theme="dark"] {
  --new-variable: value-for-dark-theme;
}
```

## 浏览器兼容性

- ✅ Chrome/Edge (支持 `prefers-color-scheme`)
- ✅ Firefox (支持 `prefers-color-scheme`)
- ✅ Safari (支持 `prefers-color-scheme`)
- ⚠️ 旧版浏览器会回退到浅色主题

## 未来计划

- [ ] 更多主题选项 (紫色、绿色等)
- [ ] 自定义主题颜色
- [ ] 定时主题切换
- [ ] 主题预览功能
