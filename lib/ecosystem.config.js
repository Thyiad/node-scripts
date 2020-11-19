module.exports = {
  apps: [{
    script: './app.js',
    name: 'pt-koa-mongo', // todo: 名字修改
    // instances: 1, // 启动进程数量
    exec_mode: 'fork', // cluster只能用于node，是用node.js cluster模块来实现的
    env: {
      PORT: 5000 // todo: 端口修改
    },
    watch: true,
    watch_delay: 1000,
    ignore_watch: [
      'node_modules',
      'package.json',
      'package-lock.json',
      'ecosystem.config.js',
      'assets'
    ]
  }]
}
