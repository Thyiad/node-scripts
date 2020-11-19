const fs = require('fs')
const path = require('path')

function renameFile (dir) {
  fs.access(dir, function (err) {
    if (err) {
      console.log('目录不存在')
    }
    _rename(dir)
  })

  function _rename (dir) {
    fs.readdir(dir, function (err, paths) {
      if (err) {
        console.log(err)
      } else {
        paths.forEach(function (curPath) {
          console.log(`查找到${curPath}`)
          const _src = dir + '/' + curPath
          const _dist = dir + '/' + curPath.replace('.js', '.ts')
          fs.stat(_src, function (err, stat) {
            if (err) {
              console.log(err)
            } else {
              // 判断是文件还是目录
              if (stat.isFile()) {
                if (curPath.endsWith('.js')) {
                  fs.rename(_src, _dist, function (err) {
                    if (err) {
                      console.log(err)
                    } else {
                      console.log(`${_src} ==> ${_dist}`)
                    }
                  })
                }
              } else if (stat.isDirectory()) {
                // 当是目录是，递归复制
                _rename(_src)
              }
            }
          })
        })
      }
    })
  }
}

renameFile(path.join(__dirname, 'src'))
