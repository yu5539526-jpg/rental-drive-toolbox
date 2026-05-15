# DEPLOY

## 项目信息

本项目是小红书租车自驾工具 H5 网页项目，技术栈为 Vite + React。

CloudBase 环境 ID：

```text
pyuy-trip-d8g0ttzhed2f4cbec
```

线上访问地址：

```text
https://pyuy-trip-d8g0ttzhed2f4cbec-1400284972.tcloudbaseapp.com/
```

网站部署在根路径 `/`，不是 `/pyuygo/`。

## 本地预览

```bash
npm run dev
```

然后打开终端提示的本地地址，例如：

```text
http://localhost:5173/
```

## 构建项目

```bash
npm run build
```

构建成功后会生成 `dist` 文件夹，且 `dist` 第一层应直接包含 `index.html` 和 `assets`，不要出现 `dist/dist/index.html`。

## 部署到 CloudBase

首次部署前，如果本机还没有 `tcb` 命令，先安装并登录：

```bash
npm install -g @cloudbase/cli
tcb login
```

之后执行：

```bash
npm run deploy:cloudbase
```

当前部署命令会先构建项目，再将 `dist` 部署到 CloudBase 静态网站托管根目录：

```bash
tcb hosting deploy dist -e pyuy-trip-d8g0ttzhed2f4cbec
```

部署成功后访问：

```text
https://pyuy-trip-d8g0ttzhed2f4cbec-1400284972.tcloudbaseapp.com/
```

## 如果线上没变化

- 电脑浏览器使用 `Ctrl + F5` 强制刷新。
- 手机浏览器使用无痕模式重新打开。
- 微信/小红书内置浏览器退出重进。
- 等待 CDN 缓存刷新后再访问。

## 标准开发流程

```bash
git status
npm run dev
git add .
git commit -m "feat: 本次修改说明"
npm run deploy:cloudbase
git tag v0.x.x
```

如果后续连接 GitHub/Gitee，再执行：

```bash
git push
git push --tags
```

## 开发安全提醒

1. 每次让 Codex 大改之前，先运行 `git status`。
2. 如果显示 `working tree clean`，说明当前代码干净，可以放心修改。
3. Codex 修改后，先运行 `npm run dev` 本地预览。
4. 本地确认无问题后，再 `commit`。
5. `commit` 后再部署 CloudBase。
6. 部署成功并确认线上正常后，再打 `tag`。
7. 如果 Codex 改坏，可以通过 `git log`、`git tag` 找到旧版本并回退。
8. 现阶段只使用 `main` 分支 + `commit` + `tag`，不引入复杂分支管理。

## 注意事项

- Vite 的 `base` 保持为 `/`，适配 CloudBase 根路径部署。
- 不要把 `base` 设置为 `/pyuygo/`。
- 如果使用 React Router，不要设置 `basename="/pyuygo"`。
- 不要把整个项目目录、`src`、`node_modules` 或 `package.json` 当作静态网站上传。
- 不要依赖 `localhost`、本地绝对路径或电脑本地图片路径。
