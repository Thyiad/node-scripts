const Client = require('ssh2').Client
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const Spinnies = require('spinnies')

/**
 * ftp递归上传文件夹
 * @param {string} localDir 
 * @param {string} serverDir 
 * @param {Object} ftpConfig 
 * @param {string} ftpConfig.host
 * @param {number} ftpConfig.port
 * @param {string} ftpConfig.user
 * @param {string} ftpConfig.password
 * @param {function} ftpConfig.cb
 */
const ftp = (localDir, serverDir, ftpConfig = {}) => {

    const serverConfig = {
        host: '',
        port: 22,
        user: '',
        password: '',
        ...ftpConfig,
    }

    const localDistPath = localDir
    const ftpUploadPath = serverDir

    if(!localDistPath || !ftpUploadPath){
        console.log(chalk.red(`ftp: localDistPath或tpUploadPath参数错误`));
        return;
    }

    const uploadCount = {
        dir: 0,
        file: 0
    }
    const spinnies = new Spinnies()

    console.log(chalk.blue('开始上传，目标ftp路径：'), ftpUploadPath)
    const conn = new Client()
    spinnies.add('spinner1', { text: '正在上传...' })
    uploadFile(serverConfig)

    let fileCount = 0
    function uploadFile(server) {
        connect(server, function () {
            conn.sftp(function (err, sftp) {
                if (err) {
                    console.log(chalk.red('sftp连接失败: ', err))
                    spinnies.fail('spinner1', { text: '上传失败...' })
                } else {
                    const localPath = localDistPath
                    sftp.stat(ftpUploadPath, (err,stats)=>{
                        if(err){
                            console.log(chalk.red('请检查要上传的目录是否正确...'))
                            console.log(err);
                            conn.end();
                            spinnies.fail('spinner1', { text: '上传失败...' })
                        }else{
                            walk(
                                localPath,
                                function (filePath) {
                                    // console.log("filePath:", filePath)
                                    uploadCount.file++
                                    const curFileRelativeName = filePath.replace(localPath, '')
                                    const remoteFilePath = path.posix.join(ftpUploadPath, curFileRelativeName)
                                    spinnies.update('spinner1', { text: `正在上传：${curFileRelativeName}` })
                                    // console.log(`远程：${remoteFilePath}，本地：${filePath}`)
                                    sftp.fastPut(filePath, remoteFilePath, function (err, result) {
                                        if (err) {
                                            console.log(chalk.red('上传文件失败', err))
                                            // console.log(`远程：${remoteFilePath}，本地：${filePath}`)
                                        }
                                        fileCount -= 1
                                        if (fileCount === 0) {
                                            conn.end()
                                            spinnies.succeed('spinner1', {
                                                text: `上传完毕，共${uploadCount.dir}个文件夹，${uploadCount.file}个文件`,
                                                successColor: 'greenBright'
                                            })
                                            ftpConfig.cb && ftpConfig.cb();
                                            // then(err, result);
                                        }
                                    })
                                },
                                function (dirPath, next) {
                                    // console.log("dirPath:", dirPath);
                                    uploadCount.dir++
                                    const relativePath = dirPath.replace(localPath, '')
                                    // console.log('开始创建文件夹: '+ ftpUploadPath + relativePath)
                                    sftp.mkdir(ftpUploadPath + relativePath, function (err, result) {
                                        // if(err){
                                        //     // 如果文件夹已存在，也会报错的，所以忽略掉，就不先判断文件夹是否存在了，少一次请求
                                        //     console.log(chalk.red("创建文件夹失败：",err));
                                        //     console.log(`远程：${ftpUploadPath + relativePath}，本地：${dirPath}`);
                                        // }
                                        next()
                                    })
                                }
                            )
                        }
                    })
                }
            })
        })
    }

    function connect(server, then) {
        conn
            .on('ready', function () {
                then()
            })
            .on('error', function (err) {
                // console.log("connect error!");
            })
            .on('end', function () {
                // console.log("connect end!");
            })
            .on('close', function (had_error) {
                // console.log("connect close");
            })
            .connect(server)
    }

    function walk(dirPath, handleFile, handleDir) {
        fs.readdir(dirPath, function (err, files) {
            if (err) {
                console.log('read dir error')
            } else {
                files.forEach(function (item) {
                    const tmpPath = path.posix.join(dirPath, item)
                    fs.stat(tmpPath, function (err1, stats) {
                        if (err1) {
                            console.log('stat error')
                        } else {
                            if (stats.isDirectory()) {
                                handleDir(tmpPath, function(){
                                    walk(tmpPath, handleFile, handleDir)
                                })
                            } else {
                                fileCount++;
                                handleFile(tmpPath)
                            }
                        }
                    })
                })
            }
        })
    }
}

module.exports = ftp;