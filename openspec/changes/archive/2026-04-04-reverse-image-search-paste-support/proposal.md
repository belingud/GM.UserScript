## Why

用户当前需要手动保存图片到本地或获取图片 URL 才能使用以图搜图功能。如果剪贴板中有图片，直接粘贴将大幅提升体验和工作效率。

## What Changes

- 新增"粘贴图片"选项：监听剪贴板事件，检测并提取图片数据
- 支持 PNG、JPEG、GIF、WebP 等常见图片格式
- 粘贴后自动将图片上传到临时图床，获取可访问的 URL
- 保持与现有文件选择、URL 粘贴、点击图片三种方式一致的交互流程

## Capabilities

### New Capabilities
- `clipboard-image-paste`: 支持从剪贴板粘贴图片数据进行搜索

### Modified Capabilities
- 无

## Impact

- 仅影响 `enhanced-reverse-image-search.js` 脚本
- 新增剪贴板监听，可能轻微增加页面内存占用
- 无需新增外部依赖，使用浏览器内置 Clipboard API
