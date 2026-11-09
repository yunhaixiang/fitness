# Fitness

独立的饮食、训练和数据记录网站。原来 `yhmath` 博客中健身计划的**可见内容**已经迁入本仓库，今后只在这里维护：

- `diet.md`：饮食页面；每周餐单表在 `_includes/diet-schedule.html`
- `treats.md`：旧放纵餐链接跳转；放纵餐现位于 `diet.md`
- `shopping.md`：独立购物清单
- `cooking.md`：独立做饭流程
- `strength.md`：力量与肌群训练量页面；动作表在 `_includes/strength-home-table.html` 和 `_includes/strength-gym-table.html`
- `cardio.md`：有氧页面；每周安排表在 `_includes/cardio-weekly-table.html`
- `stats.md`：营养和热量估计
- `tracker.html`：只读记录页面；已发布记录在 `_data/tracking_records.json`

首页“今日”按本地日期读取上述餐单和训练表。网页使用 GitHub Pages 的 Jekyll 构建，不需要单独的数据库或 npm 构建。改动上述文件后提交、推送即可更新网站。

网站默认使用低眩光暗色主题。页眉的“中文 / EN”可切换整站文字，语言选择保存在当前浏览器；切换不会改动饮食数据或训练记录。中文内容仍是计划的维护原稿，英文文本集中在 `assets/i18n.js`。

## 发布到 GitHub Pages

在仓库的 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch**，分支选 `main`、文件夹选 `/(root)`，保存。站点地址将是 `https://yunhaixiang.github.io/fitness/`。如果以后使用自定义域名，需同时更新 `_config.yml` 中的 `url` 和 `baseurl`。

本仓库的页面和仓库内容可能公开。迁移时没有复制原博客 Markdown 中的隐藏 HTML 注释和私密计算备注；今后也不要把不想公开的个人数据直接提交到仓库。

## 只读网站与记录维护

网站只展示计划和记录。饮食、有氧计划由仓库配置决定，不读取访客旧的计划选择或 URL 选择参数。已移除记录新增、删除、导入、购物及训练勾选、做饭进度与计时入口。保留语言、主题、日期、在家／健身馆的查看切换、食材搜索、趋势指标选择和数据导出。

以后通过对话修改本仓库并发布。`_data/tracking_records.json` 保存确认日期后的记录，按 `body`、`food`、`strength`、`cardio` 分类，每条用稳定 `id` 和 `YYYY-MM-DD` 格式 `date`。没有确认日期的数据不编造日期补入。页面展示最近八周，导出包含全部记录。旧浏览器记录仍只在原浏览器读取和导出，不会被删除或上传；同 ID 的仓库记录优先。

只读并不等于私密：网站及提交到公开仓库的记录仍可被其他人看到。

## 本地预览与验证

已安装 Jekyll 时运行 `jekyll serve --baseurl /fitness`。测试：`node --test tests/*.test.js`。GitHub Pages 使用 Jekyll 构建。

## 计划维护

`_data/meal_plans.json` 的 `default` 决定当前饮食计划。`scripts/create-meal-plan.py` 可以创建独立计划副本，但网页没有选择器。`_data/cardio_plans.json` 的 `default` 决定有氧计划；当前为约 300 kcal 的计划 2。修改计划时同步核对 `_data/plan_metrics.yml` 的参考消耗。浏览器旧选择不改变营养和赤字显示。

`_data/nutrition_basis.json` 保存食材系数、标签参考和假设，`_data/meal_nutrition.json` 保存每餐数值。用 `scripts/recalculate-nutrition.py` 重算，核对餐单、购物、流程和营养一致后发布。购买费用按周期折算，生重、干重与含骨包装重量不混用。

原做饭调度模块保留供维护与算法测试，但不加载到网站。
