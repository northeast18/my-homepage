# 个人主页 - 部署教程

一个简洁的个人导航主页，支持管理员后台编辑，部署在 Cloudflare Pages 上。

## 项目结构

```
my-homepage/
├── index.html          ← 公开主页
├── admin.html          ← 管理后台（/admin.html 访问）
├── style.css           ← 主页样式
├── admin.css           ← 后台样式
├── app.js              ← 主页逻辑
├── admin.js            ← 后台逻辑
├── config.js           ← 默认配置（API 不可用时兜底）
└── functions/
    └── api/
        ├── config.js   ← 读写站点配置
        └── login.js    ← 管理员登录验证
```

## 部署步骤

### 1. 推送代码到 GitHub

```bash
cd E:\work\my-homepage
git remote add origin https://github.com/你的用户名/my-homepage.git
git push -u origin master
```

### 2. 创建 Cloudflare KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单 → **Workers & Pages** → **KV**
3. 点击 **Create a namespace**
4. 名称填写：`homepage-config`（可以自定义）
5. 点击 **Add** 创建

### 3. 创建 Cloudflare Pages 项目

1. 左侧菜单 → **Workers & Pages** → **Create**
2. 选择 **Pages** → **Connect to Git**
3. 选择你的 GitHub 仓库 `my-homepage`
4. **构建设置全部留空**（这是纯静态项目，不需要构建）：
   - Framework preset: `None`
   - Build command: （留空）
   - Build output directory: （留空，或填 `/`）
5. 点击 **Save and Deploy**

### 4. 绑定 KV 存储

部署完成后：

1. 进入你的 Pages 项目 → **Settings** → **Functions**
2. 找到 **KV namespace bindings** 区域
3. 点击 **Add binding**，填写：

| 变量名 | KV 命名空间 |
|--------|------------|
| `SITE_KV` | 选择刚才创建的 `homepage-config` |

4. **Production 和 Preview 环境都需要绑定**

### 5. 设置管理员密码

1. 进入你的 Pages 项目 → **Settings** → **Environment variables**
2. 点击 **Add variable**，填写：

| 变量名 | 值 |
|--------|-----|
| `ADMIN_PASSWORD` | 你自己设定的管理员密码 |

3. **Production 和 Preview 环境都需要添加**

### 6. 重新部署

设置完 KV 绑定和环境变量后，需要重新部署才能生效：

1. 进入 Pages 项目 → **Deployments**
2. 找到最新的部署，点击右侧 **...** → **Retry deployment**

## 使用方法

| 功能 | 地址 |
|------|------|
| 🏠 主页 | `https://你的项目名.pages.dev/` |
| ⚙️ 管理后台 | `https://你的项目名.pages.dev/admin.html` |

### 管理后台功能

1. 输入你设置的 `ADMIN_PASSWORD` 登录
2. 可编辑：头像、昵称、个性签名、建站年份
3. 可编辑：导航链接（名称、图标、URL），支持增删
4. 可编辑：ICP 备案号、公安备案号
5. 点击「保存所有更改」，主页立刻更新

## 变量速查表

| 类型 | 名称 | 用途 |
|------|------|------|
| KV 命名空间 | `homepage-config` | 存储站点配置数据 |
| KV 绑定变量名 | `SITE_KV` | Pages Functions 中访问 KV 的变量名 |
| 环境变量 | `ADMIN_PASSWORD` | 管理后台登录密码 |

## 自定义域名（可选）

1. Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 填入你的域名，按提示添加 DNS 记录
3. 等待 SSL 证书自动签发（通常几分钟）
