const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const Spinnies = require('spinnies')

const defaultOptions = {
  ignoreDirList: [],
  src: '',
  dist: '',
  workDesc: '复制assets',
}

/**
 * 递归复制文件夹
 * @param {Object} options 
 * @param {string[]} options.ignoreDirList
 * @param {string} options.src
 * @param {string} options.dist
 * @param {string} options.workDesc
 */
const cpAssets = (options)=>{
  options = options || {};
  options = {
    ...defaultOptions,
    ...options,
  }

  if(!Array.isArray(options.ignoreDirList)){
    console.log(chalk.red('cp-assets: ignoreDirList参数错误'));
    return;
  }
  if(!options.src){
    console.log(chalk.red('cp-assets: src参数错误'));
    return;
  }
  if(!options.dist){
    console.log(chalk.red('cp-assets: 参数错误'));
    return;
  }

  if(!fs.existsSync(options.src)){
    console.log(chalk.red(`cp-assets: ${options.src}不存在`))
    return;
  }

  if(!fs.existsSync(options.dist)){
    console.log(chalk.red(`cp-assets: ${options.dist}不存在`))
    return;
  }

  const { ignoreDirList, src, dist, workDesc } = options;
  
  const spinnies = new Spinnies()
  const copyCount = {
    dir: 0,
    file: 0,
    ignoreDir: 0,
    ignoreFile: 0
  }
  
  spinnies.add('spinner1', { text: '开始拷贝...' })
  copyDir(src, dist)
  spinnies.succeed('spinner1', {
    text: `${workDesc}完毕，共${copyCount.dir}个文件夹，${copyCount.file}个文件，忽略掉${copyCount.ignoreDir}个文件夹，${copyCount.ignoreFile}个文件`,
    successColor: 'greenBright'
  })
  
  /*
   * 复制目录、子目录，及其中的文件
   * @param src {String} 要复制的目录
   * @param dist {String} 复制到目标目录
   */
  function copyDir (src, dist) {
    if(ignoreDirList.includes(src)){
      spinnies.update('spinner1', { text: `文件夹已被忽略：${src.replace(options.src, '')}` })
      copyCount.ignoreDir++
      return
    }
    spinnies.update('spinner1', { text: `正在复制${src.replace(options.src, '')}` })
    copyCount.dir++
    try {
      fs.accessSync(dist)
    } catch (error) {
      fs.mkdirSync(dist)
    }
    _copy(src, dist)
  
    function _copy (src, dist) {
      try {
        const filePaths = fs.readdirSync(src)
        filePaths.forEach(function (filePath) {
          const _src = path.join(src, filePath)
          const _dist = path.join(dist, filePath)
          try {
            const stat = fs.statSync(_src)
            // 判断是文件还是目录
            if (stat.isFile()) {
              const fileDirName = path.dirname(_src);
              if(ignoreDirList.includes(fileDirName)){
                spinnies.update('spinner1', { text: `文件已被忽略：${_src.replace(options.src, '')}` })
                copyCount.ignoreFile++
                return
              }
              spinnies.update('spinner1', { text: `正在复制${_src.replace(options.src, '')}` })
              copyCount.file++
              fs.writeFileSync(_dist, fs.readFileSync(_src))
            } else if (stat.isDirectory()) {
              // 当是目录是，递归复制
              copyDir(_src, _dist)
            }
          } catch (error) {
            console.log(chalk.red(error))
          }
        })
      } catch (error) {
        console.log(chalk.red(error))
      }
    }
  }
}

module.exports = cpAssets;
