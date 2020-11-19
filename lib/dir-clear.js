const fs = require('fs')
const path = require('path')

/**
 * 递归删除指定目录
 * @param {string} dirPath 
 */
const deleteFolderRecursive = function (dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((fileName, index) => {
      const curPath = path.join(dirPath, fileName);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};

module.exports = deleteFolderRecursive;