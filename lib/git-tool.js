const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync

let arg = process.argv[2] || 'OPOC_pull';
if(arg.indexOf('_')<0){
    arg = `OPOC_${arg}`;
}
const args = arg.split('_');
if(args.length!==2){
    console.log('参数错误')
    return;
}
const command = `git ${args[1]}`;
const repoName = args[0] || 'OPOC';

const fileList = fs.readdirSync(__dirname);

const dirList = []
for (let i = 0; i < fileList.length; i++) {
    const fileItem = fileList[i];
    const stat = fs.statSync(fileItem);
    
    if(stat.isDirectory() && fileItem.startsWith(repoName)){
        dirList.push(fileItem);
    }
}
console.log(`发现 ${dirList.length} 个`)

if(dirList.length>0){
    dirList.forEach((fileItem, fileIndex)=>{
        console.log(`\n\n${'-'.repeat(30)} ${fileIndex+1}/${dirList.length}: ${path.basename(dirItem)} ${'-'.repeat(30)}\n`);
        execSync(command, { cwd: path.join(__dirname, fileItem), stdio: 'inherit' });
    })
}