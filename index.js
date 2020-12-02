const cpAssets = require('./lib/cp-assets');
const dirClear = require('./lib/dir-clear');
const dirHandle = require('./lib/dir-handle');
// const dirUglify = require('./lib/dir-uglify');
const ftp = require('./lib/ftp');
const tsCompile = require('./lib/ts-compile');
const commonBuild = require('./lib/common-build');

module.exports = {
    cpAssets,
    dirClear,
    dirHandle,
    // dirUglify,
    ftp,
    tsCompile,
    commonBuild,
}