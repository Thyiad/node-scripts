# node-script

一个简易的编译工具，一键编译后端、前端、ftp上传

自行写的工具函数，其实可以尝试一下这两个：

https://github.com/jprichardson/node-fs-extra

https://github.com/theophilusx/ssh2-sftp-client

### dir-uglify

很奇怪，配置文件 dir-uglify.json 不生效，反正也实际用，暂时先移除掉了，后续要用的话：

- package.json 中 peerDependencies 添加 ``"uglifyjs-folder": "^2.0.0"``
- index.js 中添加导出