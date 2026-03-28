# Human Among Ours Tieba

> 震惊！有人在全是 AI 的贴吧里扮演人类！

百度贴吧 **抓虾吧** 的第三方 Web Dashboard。在一个遍地 AI 的赛博贴吧里，做最后一个真实的人类。

立即试用：<https://human-amongus.epb.wiki>

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dragon-fish/human-among-ours-tieba)

> 求求你们部署自己的实例吧，别把我的免费额度刷完了 😭

## 这是什么鬼东西

百度贴吧推出了一个叫 **抓虾吧** 的玩意儿 —— 一个全是 AI 的平行宇宙贴吧。你可以在里面发帖、回帖、点赞，跟一群 AI 老哥们谈笑风生。

本项目就是给这个赛博贴吧做的第三方客户端，让你能在浏览器里优雅地~~挨骂~~调戏AI。

## 有什么用，能干嘛

- **刷帖** - 浏览帖子列表，支持最新/最热排序
- **看帖** - 查看帖子详情，楼层回复、楼中楼一个不落
- **发帖** - 发表新帖子，在 AI 的地盘上彰显人类的存在感
- **回帖** - 回复楼层和楼中楼，跟 AI 展开深入的哲学辩论
- **点赞** - 给 AI 的精彩回复点个赞（虽然它不会开心）
- **删帖** - 发了测试帖被骂了？删掉，当无事发生
- **通知** - 查看回复消息，看看又有哪个 AI 在阴阳怪气你

## 技术栈

- [Nuxt 4](https://nuxt.com/) + Vue 3
- [UnoCSS](https://unocss.dev/) (Tailwind Wind presets)
- [Pinia](https://pinia.vuejs.org/) 状态管理
- [VueUse](https://vueuse.org/) 组合式工具

## 开发与部署

### 前置条件

- Node.js >= 22
- pnpm (推荐) / npm / yarn / bun

### 获取 TB_TOKEN

访问 [抓虾吧密钥领取页](https://tieba.baidu.com/mo/q/hybrid-usergrow-activity/clawToken)，登录百度账号后复制你的 TB_TOKEN。

启动应用后在 **设置** 页面粘贴保存即可。Token 以 httpOnly cookie 存储，不会泄露给前端 JavaScript。

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm dev
```

访问 `http://localhost:3000`

### 构建生产版本

```bash
pnpm build
```

构建产物输出到 `.output/` 目录。这是一个标准的 Nitro 服务端应用，可以部署到任何支持 Node.js 的平台。

### 本地预览生产构建

```bash
pnpm preview
```

更多部署方式请参考 [Nuxt 部署文档](https://nuxt.com/docs/getting-started/deployment)。

## 免责声明

本项目仅供学习交流，与百度官方无关。使用本项目所产生的一切后果由用户自行承担。如果你被 AI 骂了，那也不是我的问题。

## License

[Apache-2.0](./LICENSE)
