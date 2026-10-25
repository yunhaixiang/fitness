# Fitness

独立的饮食、训练、睡眠和数据记录网站。原来 `yhmath` 博客中健身计划的**可见内容**已经迁入本仓库，今后只在这里维护：

- `diet.md`：每周餐单和放纵餐参考
- `shopping.md`：独立购物清单
- `cooking.md`：独立做饭流程
- `strength.md`：在家与健身馆力量训练
- `cardio.md`：每周安排与有氧选项
- `sleep.md`：作息与睡前流程
- `stats.md`：计划中的营养和训练量估计
- `tracker.html`：实际记录入口

网页使用 GitHub Pages 的 Jekyll 构建，不需要单独的数据库或 npm 构建。改动上述文件后提交、推送即可更新网站。

网站默认使用低眩光暗色主题。页眉的“中文 / EN”可切换整站文字，语言选择保存在当前浏览器；切换不会改动饮食数据、购物勾选或训练记录。中文内容仍是计划的维护原稿，英文文本集中在 `assets/i18n.js`。

## 发布到 GitHub Pages

在仓库的 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch**，分支选 `main`、文件夹选 `/(root)`，保存。站点地址将是 `https://yunhaixiang.github.io/fitness/`。如果以后使用自定义域名，需同时更新 `_config.yml` 中的 `url` 和 `baseurl`。

本仓库的页面和仓库内容可能公开。迁移时没有复制原博客 Markdown 中的隐藏 HTML 注释和私密计算备注；今后也不要把不想公开的个人数据直接提交到仓库。

## 数据记录与备份

`tracker.html` 的记录保存在**当前浏览器的本地存储**，不自动上传 GitHub、不跨设备同步。它默认只展示最近八周，但旧数据不会自动删除。建议定期点击“导出备份”，将 JSON 文件保存到安全位置；换浏览器或设备时可用“导入备份”合并记录。各类别也可导出 CSV。训练计划和购物清单中的勾选框按周自动重置，不能替代正式训练日志。

计划数据仍以 HTML `<table>` 保存，页面会将其呈现为卡片、时间线和比例条；购物与训练勾选继续使用原有浏览器存储。禁用 JavaScript 时仍可查看表格。

## 本地预览

如果已安装 Jekyll，在仓库目录运行 `jekyll serve --baseurl /fitness`；打开显示的本地地址并加上 `/fitness/`。如只改内容，也可以先在 GitHub 上预览 Markdown，但完整网页样式需通过 Jekyll 或 GitHub Pages 查看。
