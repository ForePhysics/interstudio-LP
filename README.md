# 🎵 SoundWave - 智能贴纸音乐播放器

一个基于 Vue.js 和 Node.js 的创新音乐播放系统，通过贴纸选择智能匹配音乐，提供沉浸式黑胶唱片播放体验。

## ✨ 特色功能

- 🎨 **贴纸智能匹配**：通过选择不同贴纸组合，AI 算法智能推荐匹配的音乐
- 🎶 **真实黑胶体验**：逼真的黑胶唱片动画，包含旋转效果和唱针臂动作
- 📱 **响应式设计**：完美适配桌面端和移动端设备
- 🎵 **MP3 音乐播放**：支持高质量 MP3 文件播放和实时音频渲染
- 🔄 **双视图模式**：贴纸选择模式和传统音乐库浏览模式自由切换

## 🏗️ 项目架构

```
soundwave/
├── web/                    # 前端 Vue.js 应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── Mp3Player.vue       # 主播放器组件
│   │   │   ├── VinylPlayer.vue     # 黑胶唱片播放器
│   │   │   ├── StickerSelector.vue # 贴纸选择器
│   │   │   ├── MusicLibrary.vue    # 音乐库组件
│   │   │   ├── AudioPlayer.vue     # 音频播放引擎
│   │   │   └── Main.vue           # 入口组件
│   │   ├── assets/
│   │   │   ├── LP.webp             # 黑胶唱片图片
│   │   │   └── stickers/          # 贴纸资源
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
├── backend/               # 后端 Node.js 服务
│   ├── server.js         # Express 服务器
│   ├── match.py          # Python 贴纸匹配算法
│   ├── package.json
│   ├── assets/           # 贴纸资源目录
│   └── mp3-files/        # MP3 文件存储
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0
- Python 3.x
- 现代浏览器（支持 Web Audio API）

### 安装与运行

#### 1. 后端服务
```bash
cd backend
npm install
node server.js
```
后端服务将运行在 http://localhost:3001

#### 2. 前端应用
```bash
cd web
npm install
npm run serve
```
前端应用将运行在 http://localhost:8080

### 首次使用
1. 确保后端和前端服务都已启动
2. 在浏览器中访问 http://localhost:8080
3. 选择贴纸组合体验智能音乐匹配
4. 或切换到音乐库直接浏览和播放音乐

## 🔌 API 接口

### RESTful 端点
- `GET /api/mp3-files` - 获取所有 MP3 文件列表
- `GET /mp3/<filename>` - 下载指定 MP3 文件
- `POST /api/match-stickers` - 根据贴纸选择匹配音乐
- `GET /api/health` - 服务健康检查

### 贴纸匹配 API
```javascript
POST /api/match-stickers
Content-Type: application/json

{
  "selectedStickers": ["logo1", "kb2", "b6"]
}

// 响应
{
  "success": true,
  "matchedFile": "recommended-song.mid",
  "confidence": 0.85
}
```

## 🎮 使用指南

### 贴纸模式
1. 🎯 **选择贴纸**：从20个精心设计的贴纸中选择1-3个
2. 🤖 **AI 匹配**：智能算法根据贴纸的颜色、主题、情感分析匹配音乐
3. 🎵 **自动播放**：系统推荐并自动播放最匹配的音乐

### 音乐库模式
1. 📁 **浏览文件**：查看所有可用的 MP3 音乐文件
2. ▶️ **直接播放**：点击任意音乐文件立即播放
3. 🔄 **随时切换**：与贴纸模式无缝切换

### 黑胶播放器
- 🎶 **点击播放/暂停**：点击黑胶唱片或播放按钮控制音乐
- 🌀 **真实动画**：唱片旋转和唱针摆动模拟真实播放效果
- 📱 **响应式体验**：在任何设备上都有最佳的视觉效果

## 🛠️ 技术栈

### 前端技术
- **Vue.js 3** - 现代响应式前端框架
- **Element Plus** - 优雅的 UI 组件库
- **Web Audio API** - 高质量音频播放和处理
- **CSS3 Animations** - 流畅的黑胶唱片动画效果
- **Responsive Design** - 移动端友好的响应式设计

### 后端技术
- **Node.js + Express** - 高性能 Web 服务器
- **Python** - AI 音乐匹配算法
- **文件系统管理** - MIDI 文件和资源管理
- **RESTful API** - 标准化的接口设计

### 智能匹配算法
- **多维度分析**：天气、季节、位置、颜色、动物等5大类别
- **权重计算**：基于贴纸组合的智能评分系统
- **置信度评估**：匹配结果的可信度量化

## 💡 核心亮点

### 🎨 创新的交互方式
传统音乐播放器需要用户明确知道想听什么歌，而 SoundWave 通过贴纸选择让音乐发现变得更加直观和有趣。

### 🎭 沉浸式体验
逼真的黑胶唱片界面不仅仅是视觉装饰，而是完整的交互体验，让数字音乐播放重新获得了仪式感。

### 🤖 智能推荐
基于视觉元素的音乐匹配算法，将抽象的音乐情感与具象的视觉符号建立联系。

## 📝 开发说明

### 添加新的贴纸
1. 将贴纸图片添加到 `web/src/assets/stickers/` 目录
2. 在 `backend/match.py` 中定义贴纸的属性标签
3. 更新 `StickerSelector.vue` 中的贴纸列表

### 扩展匹配算法
- 修改 `backend/match.py` 中的分类系统
- 调整权重计算逻辑
- 添加新的评分维度

### 自定义UI主题
- 修改 `VinylPlayer.vue` 中的 CSS 变量
- 调整黑胶唱片和界面的视觉效果
- 适配不同的设计风格

## 🐛 故障排除

### 常见问题

**Q: 音频播放时有延迟或卡顿？**
A: 检查浏览器是否支持 Web Audio API，建议使用 Chrome、Firefox 或 Safari 最新版本。

**Q: 贴纸匹配没有响应？**
A: 确保后端服务正常运行，Python 环境配置正确，检查控制台是否有错误信息。

**Q: 移动端显示异常？**
A: 项目已适配移动端，如有问题请清除浏览器缓存后重试。

**Q: MP3 文件无法播放？**
A: 确保 MP3 文件格式正确，文件没有损坏，浏览器支持该音频格式。

### 性能优化建议
- 定期清理浏览器缓存
- 确保网络连接稳定
- 关闭不必要的浏览器标签页

## 📄 许可证

本项目采用 MIT 许可证。详情请查看 LICENSE 文件。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范
- 遵循 Vue.js 官方风格指南
- 使用 ESLint 进行代码检查
- 保持代码注释的完整性

## 📞 联系方式

- 项目维护者：SoundWave Team
- 技术支持：通过 GitHub Issues 提交问题
- 功能建议：欢迎通过 Issues 提交新功能想法

---

🎵 **让音乐发现变得更加有趣！** 🎵
