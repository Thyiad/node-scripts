const ensureSpliter = (srcPath)=>{
    if(!srcPath){
        return '';
    }
    return srcPath.replace(/(\\\/)|(\\)/g, '/')
}

module.exports = {
    ensureSpliter,
}