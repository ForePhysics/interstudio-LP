# InterStudio 黑胶唱片 Test

一个基于 Vue.js 和 Node.js 的智能 MIDI 音乐推荐播放器。

## 项目结构

```
soundwave/
├── web/                    # 前端 Vue.js 应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── Main.vue
│   │   │   └── MidiPlayer.vue
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
├── backend/               # 后端 Node.js 服务
│   ├── server.js
│   ├── package.json
│   └── midi-files/       # MIDI 文件存储目录
└── README.md
```

## 快速开始

### 前端开发

```bash
cd web
npm install
npm run serve
```

前端应用将运行在 http://localhost:8080

### 后端服务

```bash
cd backend
npm install
node server.js
```

后端服务将运行在 http://localhost:3001

## API 端点

- `GET /api/midi-files` - 获取所有 MIDI 文件列表
- `GET /midi/<filename>` - 下载 MIDI 文件
- `GET /api/health` - 健康检查

## 使用方法

1. 启动后端服务器
2. 启动前端开发服务器
3. 在浏览器中打开 http://localhost:8080
4. 上传 MIDI 文件或从后端 URL 加载文件
5. 使用播放控制按钮控制音乐播放

## 技术栈

### 前端
- Vue.js 3
- Element Plus UI 框架
- Web Audio API
- Axios HTTP 客户端

### 后端
- Node.js
- Express.js
- CORS 支持

## 注意事项

- 支持 .mid 和 .midi 文件格式
- 使用 Web Audio API 进行音频播放
- 当前实现包含简化的 MIDI 解析器，适用于演示目的
- 生产环境中建议使用更完整的 MIDI 解析库
