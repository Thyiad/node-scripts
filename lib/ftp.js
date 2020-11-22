/* eslint-disable */
const Client = require('ssh2').Client
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const Spinnies = require('spinnies')
const tool = require('./tool')

const sftpConnect = async (serverConfig) => {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', function () {
            conn.sftp((err, sftp) => {
                resolve({conn, sftp});
            })
        })
            .on('error', function (err) {
                console.log("error happen", err);
            })
            .on('end', function () {
                // console.log("connect end!");
            })
            .on('close', function (had_error) {
                // console.log("connect close");
            })
            .connect(serverConfig);
    })
}

const sftpStat = async (sftp, distPath)=>{
    distPath = tool.ensureSpliter(distPath);
    return new Promise((resolve, reject)=>{
        sftp.stat(distPath, (err,stats)=>{
            if(err){
                console.log(chalk.red(`请检查目标路径：${distPath}`))
                reject(err)
            }else{
                resolve('ok');
            }
        })
    })
}

const sftpMkDir = async(sftp, distDir)=>{
    distDir = tool.ensureSpliter(distDir);
    return new Promise((resolve, reject)=>{
        sftp.mkdir(distDir, function (err, result) {
            resolve(true);
        })
    })
}

const sftpUploadFile = async(sftp, srcFile, distFile)=>{
    distFile = tool.ensureSpliter(distFile);
    return new Promise((resolve, reject)=>{
        sftp.fastPut(srcFile, distFile, function (err, result) {
            if (err) {
                reject('上传文件失败：', srcFile, distFile)
            }else{
                resolve('上传文件成功')
            }
        })
    })
}

const walkThroughDir = async (srcDir, cb) => {
    if (fs.existsSync(srcDir)) {
        const filePaths = fs.readdirSync(srcDir)
        for (let i = 0; i < filePaths.length; i++) {
            const filePath = filePaths[i];
            const _src = path.join(srcDir, filePath)
            const stat = fs.statSync(_src)
            if (stat.isFile()) {
                await cb(_src, false)
            } else {
                await cb(_src, true)
                await walkThroughDir(_src, cb)
            }
        }
    }
}

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

    if (!localDir || !serverDir) {
        console.log(chalk.red(`ftp: localDir或serverDir参数错误`));
        return;
    }

    (async () => {
        const uploadCount = {
            dir: 0,
            file: 0
        }
        // 连接
        const {conn, sftp} = await sftpConnect(serverConfig);
        let spinnies;
        try {
            await sftpStat(sftp, serverDir)
            spinnies = new Spinnies()
            spinnies.add('spinner1', { text: '开始上传...' })
            // 遍历文件夹
            await walkThroughDir(localDir, async (curFile, isDir) => {
                const relativePath = curFile.replace(localDir, '');
                const distPath = path.posix.join(serverDir, relativePath);
                if (isDir) {
                    // 创建文件夹
                    uploadCount.dir++;
                    spinnies.update('spinner1', { text: `正在创建文件夹：${curFile}` })
                    await sftpMkDir(sftp, distPath);
                } else {
                    // 上传文件
                    uploadCount.file++;
                    spinnies.update('spinner1', { text: `正在上传：${curFile}` })
                    await sftpUploadFile(sftp, curFile, distPath);
                }
            })
            spinnies.succeed('spinner1', { text: `上传完毕，共${uploadCount.dir}个文件夹，${uploadCount.file}个文件` })
            conn.end();
        } catch (error) {
            spinnies && spinnies.fail('spinner1', { text: '上传失败...' })
            conn.end();
        }
    })();
}

module.exports = ftp;