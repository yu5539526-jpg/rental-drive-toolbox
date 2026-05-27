# 租车自驾工具箱 H5

这是一个可以部署到公网的纯前端静态 H5 项目，适合把正式链接放到小红书笔记、私信、主页或群聊里分享。

项目当前包含：

- 取车验车清单
- 实时验车反馈
- 自驾预算计算器
- 实时预算结果
- 出行计划提交表单
- localStorage 本地保存

当前版本不依赖本地电脑运行、不依赖 localhost、不依赖本地后端服务、不依赖数据库，也不要求用户和你的电脑连接同一个 WiFi。用户打开 Vercel、Netlify 或 GitHub Pages 生成的公网链接后，就可以直接使用。

## 本地开发预览

本地开发只用于你自己修改和检查项目，不能作为正式分享链接。

```bash
npm install
npm run dev
```

打开终端里显示的本地地址，例如：

```text
http://127.0.0.1:5173/
```

这个地址只适合当前电脑开发预览，不要发到小红书，也不要发给用户。

## 本地打包

正式部署前先打包：

```bash
npm run build
```

打包完成后会生成 `dist` 文件夹。`dist` 是最终要上传到公网静态托管平台的网页文件夹，里面包含 `index.html`、CSS、JS 和图片资源。

## 预览打包结果

打包后可以先在本地预览一次：

```bash
npm run preview
```

打开终端里显示的本地预览地址，例如：

```text
http://127.0.0.1:4173/
```

这个地址也只是本地预览，不能作为正式分享链接。

建议检查：

- 首页可以打开
- `#/checklist` 验车清单可以打开
- `#/budget` 预算计算器可以打开
- 图片能显示
- Tailwind 样式生效
- 填写内容刷新后仍保存在 localStorage
- 刷新页面不会白屏或 404
- 手机尺寸下页面可正常使用

## 当前部署：腾讯云 CloudBase

**正式链接：** [https://pyuy-trip-d8g0ttzhed2f4cbec-1400284972.tcloudbaseapp.com/](https://pyuy-trip-d8g0ttzhed2f4cbec-1400284972.tcloudbaseapp.com/)

部署方式：`npx tcb hosting deploy dist -e pyuy-trip-d8g0ttzhed2f4cbec`

CloudBase 控制台：[https://tcb.cloud.tencent.com/dev?envId=pyuy-trip-d8g0ttzhed2f4cbec](https://tcb.cloud.tencent.com/dev?envId=pyuy-trip-d8g0ttzhed2f4cbec)

## 推荐部署方式一：Vercel

适合长期正式使用，推荐优先选择。

1. 把项目上传到 GitHub 仓库。
2. 打开 Vercel，选择导入 GitHub 仓库。
3. Framework Preset 选择 `Vite`。
4. Build Command 填：

```bash
npm run build
```

5. Output Directory 填：

```text
dist
```

6. 点击 Deploy。
7. 部署完成后，Vercel 会生成一个类似下面这样的公网链接：

```text
https://your-project.vercel.app/
```

这个 `https://...vercel.app/` 链接才是可以放到小红书的正式分享链接。

项目已包含 `vercel.json`，刷新页面时会回退到 `index.html`，适合 React 单页应用部署。

## 推荐部署方式二：Netlify Drop

这是最简单的手动上线方式，不需要复杂配置。

1. 本地运行：

```bash
npm run build
```

2. 打开：

```text
https://app.netlify.com/drop
```

3. 把项目里的 `dist` 文件夹拖进去。
4. Netlify 会生成一个类似下面这样的公网链接：

```text
https://your-project.netlify.app/
```

这个 `https://...netlify.app/` 链接可以放到小红书给任何用户打开。

项目已包含 `netlify.toml` 和 `public/_redirects`，用于保证单页应用刷新不 404。

## 推荐部署方式三：GitHub Pages

项目已配置 `gh-pages` 发布脚本。

第一次使用前，先确认依赖已经安装：

```bash
npm install
```

发布到 GitHub Pages：

```bash
npm run deploy
```

这个命令会先执行 `npm run build`，再把 `dist` 发布到 GitHub 仓库的 `gh-pages` 分支。

然后在 GitHub 仓库里检查：

1. 进入仓库 Settings。
2. 找到 Pages。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `gh-pages`。
5. 目录选择 `/root`。
6. 保存后等待 GitHub Pages 生成公网链接。

GitHub Pages 链接通常类似：

```text
https://your-name.github.io/your-repo/
```

本项目使用 `HashRouter`，页面链接会长这样：

```text
https://your-name.github.io/your-repo/#/checklist
https://your-name.github.io/your-repo/#/budget
```

这样的链接适合静态托管，刷新后不容易 404。

## 当前静态部署配置

- `vite.config.js` 使用 `base: './'`，让打包后的资源使用相对路径，适配 Vercel、Netlify、GitHub Pages。
- `src/main.jsx` 使用 `HashRouter`，降低静态托管刷新 404 的风险。
- `vercel.json` 配置了 SPA rewrites。
- `netlify.toml` 配置了 `publish = "dist"` 和 SPA redirects。
- `public/_redirects` 包含 `/* /index.html 200`。
- `src/services/submitUserData.js` 只做 `console.log` 和 localStorage 保存，不依赖数据库。

## 小红书最终应该分享哪个链接

请分享部署平台生成的公网链接，例如：

```text
https://your-project.vercel.app/
https://your-project.netlify.app/
https://your-name.github.io/your-repo/
```

也可以直接分享某个功能页：

```text
https://your-project.vercel.app/#/checklist
https://your-project.vercel.app/#/budget
```

不要分享下面这些本地开发地址：

```text
http://127.0.0.1:5173/
http://127.0.0.1:4173/
http://localhost:5173/
http://localhost:4173/
```

这些地址只能在你自己的电脑上开发或预览，不能让小红书用户公网访问。

## 如何确认部署成功

部署完成后，用手机流量或另一台设备打开公网链接，检查：

- 首页正常打开
- 验车清单可以进入并勾选
- 预算计算器可以进入并实时计算
- 提交出行计划表单后页面不报错
- 刷新页面不白屏、不 404
- 图片显示正常
- 页面样式正常
- 关闭再打开后，本机 localStorage 保存的数据仍在

确认以上都正常后，就可以把公网链接放到小红书。
