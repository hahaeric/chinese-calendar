# 中国历法日历
回复我全部要使用中文

带农历、二十四节气、七十二候、黄帝纪年与天干地支的网页日历。打开 `index.html` 或 `calendar.html` 即可使用，无需安装依赖。

## 在线访问

将本项目发布到 GitHub 并开启 **GitHub Pages** 后，他人可通过如下地址访问（将 `你的用户名` 和 `仓库名` 替换为实际值）：

```
https://你的用户名.github.io/仓库名/
```

## 发布到 GitHub（首次）

### 方式一：网页上传（无需安装 Git）

1. 登录 [GitHub](https://github.com)，点击右上角 **+** → **New repository**
2. 仓库名建议：`chinese-calendar`（可自定）
3. 选择 **Public**，勾选 **Add a README** 可取消（本地已有 README）
4. 创建后进入仓库，点击 **Add file** → **Upload files**
5. 上传本文件夹中的 `index.html`、`calendar.html`、`README.md`
6. 点击 **Commit changes**

### 方式二：使用 Git 命令行

先安装 [Git for Windows](https://git-scm.com/download/win)，然后在项目目录打开终端执行：

```bash
git init
git add index.html calendar.html README.md
git commit -m "Add Chinese calendar web app"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

## 开启 GitHub Pages

1. 打开 GitHub 仓库 → **Settings** → 左侧 **Pages**
2. **Build and deployment** → Source 选 **Deploy from a branch**
3. Branch 选 **main**，文件夹选 **/ (root)**，保存
4. 等待约 1～2 分钟，Pages 地址会显示在 Settings → Pages 页面顶部

## 功能

- 公历月历浏览与日期搜索
- 农历日期
- 二十四节气与七十二候（含文字说明）
- 黄帝纪年、天干地支

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | GitHub Pages 默认首页（与 calendar.html 内容相同） |
| `calendar.html` | 本地开发用的同一页面 |

更新日历时，请同时修改 `index.html` 与 `calendar.html`，或只改 `calendar.html` 后复制覆盖 `index.html`。
