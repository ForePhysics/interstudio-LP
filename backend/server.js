const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const port = 3001;

// Gzip压缩中间件 - 必须在其他中间件之前
app.use(compression({
  level: 9,              // 最高压缩级别
  threshold: 1024,       // 只压缩大于1KB的响应
  filter: (req, res) => {
    // 自定义过滤器，决定哪些响应需要压缩
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// 启用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json());

// 创建 MIDI 文件存储目录
const midiDir = path.join(__dirname, 'midi-files');
if (!fs.existsSync(midiDir)) {
  fs.mkdirSync(midiDir);
}

// 静态文件服务 - 提供 MIDI 文件，带缓存优化
app.use('/midi', (req, res, next) => {
  // 设置缓存头
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年缓存
  res.setHeader('ETag', req.url); // 使用URL作为ETag
  next();
}, express.static(midiDir, {
  maxAge: '1y', // 1年缓存
  etag: true,
  lastModified: true
}));

// API 路由
app.get('/api/midi-files', (req, res) => {
  try {
    const files = fs.readdirSync(midiDir)
      .filter(file => file.endsWith('.mid') || file.endsWith('.midi'))
      .map(file => ({
        name: file,
        url: `/midi/${file}`,
        size: fs.statSync(path.join(midiDir, file)).size
      }));
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: '读取 MIDI 文件失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MIDI 服务器运行正常' });
});

// 贴纸匹配API
app.post('/api/match-stickers', (req, res) => {
  try {
    const { selectedStickers } = req.body;
    
    if (!selectedStickers || !Array.isArray(selectedStickers)) {
      return res.status(400).json({ error: '无效的贴纸选择' });
    }
    
    // 调用 Python 脚本进行匹配
    const pythonScript = path.join(__dirname, 'match.py');
    const midiFolder = path.join(__dirname, 'midi-files');
    
    // 构造 Python 命令参数
    const stickerArgs = selectedStickers.join(',');
    
    const pythonProcess = spawn('python3', [pythonScript, stickerArgs, midiFolder]);
    
    let output = '';
    let errorOutput = '';
    let isResponseSent = false; // 标志位，防止重复发送响应
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (isResponseSent) return; // 如果已经发送过响应，直接返回
      isResponseSent = true;
      
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        return res.status(500).json({ 
          error: '匹配过程出错',
          details: errorOutput 
        });
      }
      
      try {
        // 解析 Python 脚本的输出
        const lines = output.trim().split('\n');
        const matchedFile = lines[lines.length - 1].trim();
        
        if (matchedFile && matchedFile !== 'None') {
          res.json({ 
            matchedFile,
            selectedStickers,
            message: '成功找到匹配的音乐文件'
          });
        } else {
          res.json({ 
            matchedFile: null,
            selectedStickers,
            message: '未找到匹配的音乐文件'
          });
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({ error: '解析匹配结果失败' });
      }
    });
    
    // 设置超时
    const timeout = setTimeout(() => {
      if (isResponseSent) return; // 如果已经发送过响应，直接返回
      isResponseSent = true;
      
      pythonProcess.kill();
      res.status(408).json({ error: '匹配超时' });
    }, 10000);
    
    // 清理超时定时器
    pythonProcess.on('close', () => {
      clearTimeout(timeout);
    });
    
  } catch (error) {
    console.error('Sticker matching error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
});

app.listen(port, () => {
  console.log(`MIDI 服务器运行在 http://localhost:${port}`);
  console.log(`MIDI 文件目录: ${midiDir}`);
  console.log(`API 端点:`);
  console.log(`  GET  /api/midi-files     - 获取所有 MIDI 文件列表`);
  console.log(`  POST /api/match-stickers - 根据贴纸匹配音乐文件`);
  console.log(`  GET  /midi/<filename>    - 下载 MIDI 文件`);
  console.log(`  GET  /api/health         - 健康检查`);
});

module.exports = app;
