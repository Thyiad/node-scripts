const uglifyjsFolder = require('uglifyjs-folder')
const path = require('path')
const chalk = require('chalk')

/**
 * 使用uglify压缩指定文件夹，uglify必须已经全局安装
 * @param {Object} options 
 * @param {string} options.dist
 * @param {string} options.output
 * @param {string} options.configFile
 */
const uglifyFolder = (options)=>{
    options = options || {}
    options = {
        configFile: path.join(__dirname, 'dir-uglify.json'),
        ...options,
    }
    if(!options.dist){
        console.log(chalk.red('dist-uglify: dist参数错误'))
        return;
    }
    if(!options.output){
        console.log(chalk.red('dist-uglify: output参数错误'))
        return;
    }

    uglifyjsFolder(options.dist, {
        // todo: 奇怪，configFile不起作用，暂时也没实际使用，后面再说吧
        configFile: options.configFile,
        each: true,
        output: options.output,
    })
}

module.exports = uglifyFolder;

