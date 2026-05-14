# 一次部署，电脑和手机都能点网址打开

`127.0.0.1` 只代表“当前这台设备自己”，所以手机访问电脑上的 `127.0.0.1` 一定打不开。要让电脑、手机、微信、小红书内置浏览器都能直接点网址打开，需要把 `dist` 发布到 Vercel、Netlify 或其他静态网站托管平台。

当前项目已经改成纯静态发布友好版本：

- `HashRouter` 路由，刷新页面不依赖后端
- `base: './'`，资源使用相对路径
- 图片资源打包进 `dist/assets`
- Vercel / Netlify 配置已保留

## 最简单发布方式：Netlify Drop

1. 运行：

```bash
npm run build
```

2. 打开：

```text
https://app.netlify.com/drop
```

3. 把 `dist` 文件夹拖进去。

4. Netlify 会生成一个 `https://xxxx.netlify.app` 网址。这个网址电脑和手机都能直接打开。

## Vercel 发布

1. 把项目上传到 GitHub / GitLab / Gitee。
2. 在 Vercel 导入项目。
3. Framework Preset 选择 `Vite`。
4. Build Command 使用：

```bash
npm run build
```

5. Output Directory 使用：

```text
dist
```

6. 发布后得到 `https://xxx.vercel.app`，电脑和手机都能直接打开。

## 本地只用于开发

本地开发地址：

```text
http://127.0.0.1:5173/
```

只适合当前电脑调试。它不是公网网址，手机不能稳定依赖它。
