# 🚀 GitHub Pages 部署教程（小白友好版）

> 把报价单生成器发布到互联网，任何人通过链接就能使用。

---

## 第一步：注册 GitHub 账号

1. 打开浏览器，访问 **https://github.com**
2. 点击右上角 **「Sign up」**（注册）
3. 填写用户名、邮箱、密码
4. 去邮箱收验证邮件，点击确认

> ⚠️ 如果你已经有账号，直接登录跳到**第二步**

---

## 第二步：创建新仓库（Repository）

1. 登录后，点击左上角 **「+」图标** → 选择 **「New repository」**
2. 填写信息：
   - **Repository name**: `quotation-tool`（或者你喜欢的名字）
   - **Description**: `报价单生成器`（可选）
   - **选择 Private 或 Public**：⭐ **必须选 Public**（免费版只有 Public 仓库才能用 Pages）
3. **不要勾选** "Add a README file"（我们已有代码）
4. 点击 **「Create repository」** 🎉

---

## 第三步：推送代码到 GitHub（在电脑上操作）

打开终端（Terminal），依次运行以下命令：

```bash
# 1. 进入项目目录
cd /Users/meira/WorkBuddy/20260429013259/quotation-tool

# 2. 添加远程仓库地址（把 YOUR_USERNAME 换成你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/quotation-tool.git

# 3. 推送代码到 GitHub
git branch -M main
git push -u origin main
```

> 🔑 如果提示输入用户名密码：
> - 用户名：你的 GitHub 用户名
> - 密码：**不是登录密码！** 需要用 Personal Access Token：
>   1. GitHub → 右上角头像 → Settings
>   2. 左侧最底部 → Developer settings → Personal access tokens → Tokens (classic)
>   3. Generate new token → 勾选 `repo` 权限 → 生成
>   4. 复制 token 粘贴为密码

---

## 第四步：开启 GitHub Pages

1. 在仓库页面，点击顶部 **「Actions」** 标签
2. 你会看到左侧有 **「Deploy to GitHub Pages」** workflow（这是我们配好的自动化部署）
3. 点击它 → 右侧 **「Run workflow」** → 选 `main` 分支 → 点击绿色 **「Run workflow」**
4. 等待约 **1-2 分钟**（黄色圆圈转绿色✅表示成功）

> 💡 以后每次你推送代码到 main 分支，都会自动重新部署，不需要手动操作！

---

## 第五步：获取访问链接

1. 点击仓库页面顶部的 **「Settings」**（设置）
2. 左侧菜单找到 **「Pages」**
3. 你会看到类似这样的链接：

```
https://YOUR_USERNAME.github.io/quotation-tool/
```

🎉 **这就是你的网站链接！发给任何人都能打开使用！**

---

## 常见问题

### Q: 页面空白 / 样式丢失？
A: 清除浏览器缓存（Cmd+Shift+R）强制刷新试试

### Q: 我想更新怎么办？
A: 只需在本地改完代码后执行：
```bash
git add -A && git commit -m "更新说明" && git push
```
GitHub 会自动重新部署，约1-2分钟后生效

### Q: 能换一个更好记的域名吗？
A: 可以！在 Pages 设置里可以绑定自定义域名（需要你自己有域名）

### Q: 仓库必须是 Public 吗？
A: 免费账户的 Pages 需要 Public 仓库。GitHub Pro 付费账户可以用 Private 仓库 + Pages

---

## 文件结构说明

```
quotation-tool/
├── .github/workflows/deploy.yml   ← 自动部署配置（已配好，不用管）
├── src/                            ← 源代码
├── dist/                           ← 构建产物（自动生成）
├── vite.config.ts                  ← Vite 配置
└── package.json                    ← 项目依赖
```

---

**祝你部署成功！🎊**
