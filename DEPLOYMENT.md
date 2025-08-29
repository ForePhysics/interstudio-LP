# InterStudio 黑胶唱片 Test - 部署指南

## 🚀 快速部署

### 方式一：本地开发（推荐用于开发测试）

1. **启动后端服务器**
```bash
cd backend
npm install
node server.js
```
后端将运行在 `http://localhost:3001`

2. **启动前端开发服务器**
```bash
cd web
npm install
npm run serve
```
前端将运行在 `http://localhost:8080`，并自动代理 API 请求到后端

### 方式二：生产部署

1. **构建前端静态文件**
```bash
cd web
npm run build
```

2. **部署到服务器**
   - 将 `web/dist` 目录上传到 Web 服务器
   - 配置 Web 服务器代理 `/api` 和 `/midi` 路径到后端服务器

## 🔧 代理配置说明

### 前端代理配置（开发环境）
在 `web/vue.config.js` 中已配置：
```javascript
devServer: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    },
    '/midi': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

### 生产环境 Nginx 代理配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 静态文件
    location / {
        root /path/to/web/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # MIDI 文件代理
    location /midi/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📱 移动端访问

应用已针对移动端优化，支持：
- 响应式布局
- 触摸友好的界面
- 底部固定播放器
- 黑胶唱片旋转动画

## 🌐 外网访问配置

### 开发环境
如果需要让局域网内其他设备访问：

1. **启动时绑定到所有接口**
```bash
# 前端
npm run serve -- --host 0.0.0.0

# 后端（修改 server.js 中的 listen）
app.listen(port, '0.0.0.0', () => {
  console.log(`MIDI 服务器运行在 http://0.0.0.0:${port}`);
});
```

2. **防火墙设置**
确保 8080 和 3001 端口允许外部访问

3. **访问地址**
其他设备可通过 `http://你的IP:8080` 访问

### 生产环境
- 使用反向代理服务器（如 Nginx、Apache）
- 配置 HTTPS 证书
- 设置防火墙规则
- 使用 PM2 等进程管理器管理后端服务

## 🔧 常见问题

### Q: 前端无法获取 MIDI 文件列表
A: 检查后端服务器是否正常运行在 3001 端口，代理配置是否正确

### Q: MIDI 文件无法播放
A: 确保浏览器支持 Web Audio API，在 HTTPS 环境下使用

### Q: 移动端界面显示异常
A: 检查 viewport meta 标签是否正确配置

## 📝 API 接口

- `GET /api/midi-files` - 获取 MIDI 文件列表
- `GET /midi/{filename}` - 下载指定 MIDI 文件
- `GET /api/health` - 健康检查

所有 API 调用现在都使用相对路径，支持代理转发。
