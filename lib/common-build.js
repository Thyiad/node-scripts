const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const dirClear = require("./dir-clear");
const tsCompile = require("./ts-compile");
const cpAssets = require("./cp-assets");
const ftp = require("./ftp");
const execSync = require("child_process").execSync;

/**
 * 常规编译
 * @param {Object} options
 * @param {string} options.targetBuildType
 * @param {string} options.frontendBuildCommand
 * @param {string} options.backendProjectDir
 * @param {Array.<string>} options.ignoreAssetDirList
 * @param {string} options.distDirPath
 * @param {string} options.frontendProjectDir
 * @param {Object} options.ftpOptions
 * @param {string} options.ftpOptions.serverDir
 * @param {string} options.ftpOptions.host
 * @param {number} options.ftpOptions.port
 * @param {string} options.ftpOptions.user
 * @param {string} options.ftpOptions.password
 * @param {function} ftpConfig.cb
 */
const commonBuild = (options) => {
  const validTypes = {
    backend: "backend",
    frontend: "frontend",
    ftp: "ftp",
  };

  options = options || {};
  options.ftpOptions = options.ftpOptions || {};
  let {
    targetBuildType,
    frontendBuildCommand = "npm run build",
    backendProjectDir,
    distDirPath,
    frontendProjectDir,
    ftpOptions,
  } = options;

  targetBuildType = targetBuildType || "frontend_backend";
  backendProjectDir = backendProjectDir || process.cwd();

  const buildTypes = targetBuildType.split("_");
  if (buildTypes.some((item) => !validTypes[item])) {
    console.log(chalk.red("buildType参数错误：" + buildTypes.join("_")));
    process.exit(1);
  }
  if (!fs.existsSync(backendProjectDir)) {
    console.log(chalk.red("backendProjectDir参数错误"));
    process.exit(1);
  }
  if (!fs.existsSync(frontendProjectDir)) {
    console.log(chalk.red("frontendProjectDir参数错误"));
    process.exit(1);
  }

  distDirPath = distDirPath || path.join(backendProjectDir, "dist");
  if (
    buildTypes.includes(validTypes.frontend) ||
    buildTypes.includes(validTypes.backend)
  ) {
    // 清空dist目录
    if (fs.existsSync(distDirPath)) {
      dirClear(distDirPath);
      fs.mkdirSync(distDirPath);
      fs.mkdirSync(path.join(distDirPath, "assets"));
      console.log(chalk.blue("已清空dist目录，创建dist/assets"));
    } else {
      fs.mkdirSync(distDirPath);
      fs.mkdirSync(path.join(distDirPath, "assets"));
      console.log(chalk.blue("dist目录不存在，已创建dist、dist/assets"));
    }
  }

  if (buildTypes.includes(validTypes.backend)) {
    const now = Date.now();
    // 编译ts
    console.log(chalk.blue("正在编译ts..."));
    // const tsConfigFilePath = path.join(backendProjectDir, 'tsconfig.json');
    // tsCompile(tsConfigFilePath)
    execSync("tsc", { cwd: backendProjectDir, stdio: "inherit" });
    console.log(chalk.blue("ts编译完成"));

    // 修改env
    const distConfigFile = path.join(distDirPath, "config.js");
    if (!fs.existsSync(distConfigFile)) {
      console.log(chalk.red(`${distConfigFile}不存在，无法修改`));
      process.exit(1);
    }
    let content = fs.readFileSync(distConfigFile).toString();
    content = content.replace(`const env = 'devLocal'`, `const env = 'prd'`);
    content = content.replace(`const env = "devLocal"`, `const env = "prd"`);
    fs.writeFileSync(distConfigFile, content);
    console.log(chalk.blue("已将env修改为prd"));

    // 复制后端资源
    fs.copyFileSync(
      path.join(backendProjectDir, "package.json"),
      path.join(distDirPath, "package.json")
    );
    fs.copyFileSync(
      path.join(backendProjectDir, "package-lock.json"),
      path.join(distDirPath, "package-lock.json")
    );
    fs.copyFileSync(
      path.join(backendProjectDir, "ecosystem.config.js"),
      path.join(distDirPath, "ecosystem.config.js")
    );
    cpAssets({
      ignoreDirList: [
        path.join(backendProjectDir, "src/assets/upload"),
        path.join(backendProjectDir, "src/assets/download"),
        ...(options.ignoreAssetDirList || []),
      ],
      src: path.join(backendProjectDir, "src/assets"),
      dist: path.join(distDirPath, "assets"),
      workDesc: "复制assets",
    });
    const end = Date.now();
    console.log(chalk.green(`后端耗时：${(end - now) / 1000}s`));
  }

  if (buildTypes.includes(validTypes.frontend)) {
    const now = Date.now();
    // 编译前端
    if (!fs.existsSync(frontendProjectDir)) {
      console.log(chalk.red("前端工程路径不存在：") + frontendProjectDir);
    }
    console.log(chalk.blue("正在编译前端工程..."));
    execSync(frontendBuildCommand, {
      cwd: frontendProjectDir,
      stdio: "inherit",
    });
    console.log(chalk.blue("前端编译完成"));

    // 复制前端资源
    const frontDistDirPath = path.join(frontendProjectDir, "dist");
    cpAssets({
      ignoreDirList: [],
      src: frontDistDirPath,
      dist: path.join(distDirPath, "assets"),
      workDesc: "复制前端dist",
    });
    const end = Date.now();
    console.log(chalk.green(`前端耗时：${(end - now) / 1000}s`));
  }

  if (buildTypes.includes(validTypes.ftp)) {
    const now = Date.now();
    // ftp上传
    const serverDir = ftpOptions.serverDir;
    if (!serverDir) {
      console.log(chalk.red("serverDir不能为空"));
      return;
    }
    ftp(distDirPath, serverDir, {
      ...ftpOptions,
      cb: () => {
        const end = Date.now();
        console.log(chalk.green(`ftp耗时：${(end - now) / 1000}s`));
      },
    });
  }
};

module.exports = commonBuild;
