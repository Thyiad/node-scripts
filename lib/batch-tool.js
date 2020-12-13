const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync

let arg = process.argv[2] || 'OPOC_base_git pull';
if(arg.indexOf('_')<0){
    arg = `OPOC_base_${arg}`;
}
arg = arg.replace(/'/g, '"');
const args = arg.split('_');
if(args.length!==3){
    console.log('参数错误')
    return;
}
const [repoName, subRepo, command] = args;
console.log(arg)
if(!['base', 'backend', 'frontend'].includes(subRepo)){
    console.log('subRepo参数错误');
    return;
}

const dirList = []
const rootFileList = fs.readdirSync(__dirname);
rootFileList.forEach(rootFileItem=>{
    const rootFileItemPath = path.join(__dirname, rootFileItem)
    const statRoot = fs.statSync(rootFileItemPath);

    if(statRoot.isDirectory() && rootFileItem.startsWith(repoName)){
        if(subRepo === 'base'){
            dirList.push(rootFileItemPath);
        } else {
            const subFileList = fs.readdirSync(rootFileItemPath);
            subFileList.forEach(subFileItem=>{
                const subFileItemPath = path.join(rootFileItemPath, subFileItem) 
                const statSub = fs.statSync(subFileItemPath);
                if(statSub.isDirectory()&& subFileItem.endsWith(`_${subRepo}`)){
                    dirList.push(subFileItemPath);
                }
            })
        }
    }
});
console.log(`发现 ${dirList.length} 个`)

if(dirList.length>0){
    dirList.forEach((dirItem, fileIndex)=>{
        console.log(`\n\n${'-'.repeat(30)} ${fileIndex+1}/${dirList.length}: ${path.basename(dirItem)} ${'-'.repeat(30)}\n`);
        try {
            execSync(command, { cwd: dirItem, stdio: 'inherit' });
        } catch (error) {
            
        }
    })
}