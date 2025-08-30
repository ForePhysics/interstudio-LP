const { defineConfig } = require('@vue/cli-service')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 公共路径配置
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  
  // 生产环境配置
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // Gzip压缩配置
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg|webp|png|jpg|jpeg|gif|woff|woff2|ttf|eot)$/,
          threshold: 1024,  // 只压缩大于1kb的文件
          minRatio: 0.8,    // 压缩比例至少为0.8
          compressionOptions: {
            level: 9,       // 最高压缩级别
            chunkSize: 32 * 1024
          }
        }),
        // Brotli压缩（更好的压缩比）
        new CompressionPlugin({
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg|webp)$/,
          threshold: 1024,
          minRatio: 0.8,
          filename: '[path][base].br',
          compressionOptions: {
            level: 11 // Brotli最高压缩级别
          }
        })
      )
      
      // 代码分割优化
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 250000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true
            },
            elementPlus: {
              test: /[\\/]node_modules[\\/]element-plus[\\/]/,
              name: 'element-plus',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true
            },
            common: {
              name: 'common',
              chunks: 'all',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true
            }
          }
        },
        // 模块合并优化
        concatenateModules: true,
        // 压缩配置
        minimize: true
      }
    }
  },
  
  // CSS压缩优化
  css: {
    extract: process.env.NODE_ENV === 'production' ? {
      ignoreOrder: true
    } : false,
    sourceMap: false
  },
  
  // 生产环境禁用source map
  productionSourceMap: false,
  
  // 链式配置
  chainWebpack: config => {
    // 预加载重要资源（检查插件是否存在）
    if (config.plugins.has('preload')) {
      config.plugin('preload').tap(options => {
        options[0] = {
          rel: 'preload',
          include: 'initial',
          fileBlacklist: [/\.map$/, /hot-update\.js$/]
        }
        return options
      })
    }
    
    // 预获取懒加载模块（检查插件是否存在）
    if (config.plugins.has('prefetch')) {
      config.plugin('prefetch').tap(options => {
        options[0].fileBlacklist = options[0].fileBlacklist || []
        options[0].fileBlacklist.push(/\.map$/, /hot-update\.js$/)
        return options
      })
    }
  },
  
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      '/midi': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      }
    }
  }
})
