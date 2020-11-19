const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

/**
 * 批量处理文件夹中的文件
 * @param {string} dir 
 * @param {function} cb
 */
const handleDirRecursive = (dir, cb) => {

  if(!cb){
    cb = (curDir, curFileName) => {
      console.log(`回调函数未定义，当前文件：${curDir+'/'+curFileName}`)
      // if (curFileName.endsWith('.js')) {
      //   const _src = curDir + '/' + curFileName
      //   const _dist = curDir + '/' + curFileName.replace('.js', '.ts')
      //   fs.rename(_src, _dist, function (err) {
      //     if (err) {
      //       console.log(chalk.red(err))
      //     } else {
      //       console.log(`${_src} ==> ${_dist}`)
      //     }
      //   })
      // }
    }
  }
  
  fs.access(dir, function (err) {
    if (err) {
      console.log(chalk.red('目录不存在'))
    }
    _handleDir(dir)
  })

  function _handleDir (dir) {
    fs.readdir(dir, function (err, fileNames) {
      if (err) {
        console.log(chalk.red(err))
      } else {
        fileNames.forEach(function (fileName) {
          const _src = dir + '/' + fileName
          fs.stat(_src, function (err, stat) {
            if (err) {
              console.log(chalk.red(err))
            } else {
              // 判断是文件还是目录
              if (stat.isFile()) {
                cb(dir, fileName);
              } else if (stat.isDirectory()) {
                // 当是目录是，递归复制
                _handleDir(_src)
              }
            }
          })
        })
      }
    })
  }
}

module.exports = handleDirRecursive;
