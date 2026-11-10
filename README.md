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

首页“今日”按本地日期读取上述餐单和训练表。网页使用 Jekyll 构建，页面与资源部署到 Cloudflare Worker；健康同步记录保存在私人 D1 数据库。发布流程见下文。

网站默认使用低眩光暗色主题。页眉的“中文 / EN”可切换整站文字，语言选择保存在当前浏览器；切换不会改动饮食数据或训练记录。中文内容仍是计划的维护原稿，英文文本集中在 `assets/i18n.js`。

## 发布到 Cloudflare

私人入口：`https://fitness-private.yunhaixiang-fitness.workers.dev/fitness/`。所有页面和静态资源先经过 Access 及邮箱白名单验证。页面存放于无公开网址的 `fitness-assets`，由 `fitness-private` 通过内部服务绑定读取，不依赖 GitHub Pages；手机上传入口与凭据保持不变。

首次安装依赖：`bundle install`、`npm ci`。发布：`npm test`、`npm run build`、`npm run deploy`（本机需先 `npx wrangler login`）。`_site/fitness` 是自动生成的页面，不提交到 Git。

自动发布使用 Cloudflare Workers Builds，三个 Worker 分别连接同一个 GitHub 仓库 `yunhaixiang/fitness` 的 `main` 分支，根目录均为 `/`：

| Worker | Build command | Deploy command |
| --- | --- | --- |
| `fitness-assets` | `npm run build:ci` | `npm run deploy:assets` |
| `fitness-private` | `npm test` | `npm run deploy:viewer` |
| `fitness-ingest` | `npm test` | `npm run deploy:ingest` |

在各 Worker 的 Settings → Builds → Connect 设置；关闭其他分支的自动构建与预览部署。必须使用对应的单服务发布命令，不能在某个 Worker 的 Builds 中使用本地全量 `npm run deploy`。每次 push 后检查三个构建均成功；失败时保留上次成功部署，可在 Builds 中重试。Node 和 Ruby 版本由仓库文件固定，Ruby 依赖由 `Gemfile.lock` 固定。构建额度沿用 Free，不启用付费升级。

部署只更新代码和静态页面，不执行 D1 数据库迁移、清空、导入，也不改 Access 白名单或同步凭据。Hume 记录独立保留在 D1。初次连接完成并验证成功前，仅 push 仍不会自动更新 Cloudflare。

确认私人入口工作后，在 GitHub 仓库 Settings → Pages，将发布分支设为 None 并保存。此操作只取消公开网站，不会删除仓库及历史内容。

本仓库的页面和仓库内容可能公开。迁移时没有复制原博客 Markdown 中的隐藏 HTML 注释和私密计算备注；今后也不要把不想公开的个人数据直接提交到仓库。

## 只读网站与记录维护

网站只展示计划和记录。饮食计划可切换浏览，默认计划1；选择不修改仓库或身体记录。有氧计划由仓库配置决定。已移除记录新增、删除、导入入口。力量训练每组勾选、购物勾选，以及做饭勾选和下一步推荐保留，进度保存在当前浏览器，刷新后恢复；它们不修改仓库计划或健康记录。力量勾选每日清空，购物勾选按周保存，也可以手动清空本周勾选。保留语言、主题、日期、在家／健身馆的查看切换、食材搜索、趋势指标选择和 JSON 备份导出。记录页仅保留身体组成与放纵餐两个标签，不显示常规饮食、力量、有氧日志和 CSV 导出。

以后通过对话修改本仓库并发布。`_data/tracking_records.json` 中 `body`、`steps` 必须为空数组，`currentBody` 必须为空对象；公开版本的身体指标显示横线。放纵餐可按用户授权记录在 `cheatMeals` 中。私人网站通过邮箱验证后读取 D1，在返回页面时填入体重、体脂、步数与基于步数的消耗。同步健康数据不触发 Git 提交或网站部署。浏览器旧身体记录不会作为公开页面的回退数据。
只读并不等于私密：网站及提交到公开仓库的记录仍可被其他人看到。

## 本地预览与验证

已安装 Jekyll 时运行 `jekyll serve --baseurl /fitness`。测试：`node --test tests/*.test.js`。Cloudflare 使用 Jekyll 构建输出。

## 计划维护

`_data/meal_plans.json` 的 `default` 决定当前饮食计划。`scripts/create-meal-plan.py` 可以创建独立计划副本，网页可切换查看完整计划，购物和做饭勾选按计划独立保存。计划2来自 `40e269d^`（多样化后3餐之前）的历史版本，内容位于 `plans/plan-2/`、`_data/meal_plan_content/plan-2/` 与对应 includes。计划2保留历史营养估算，来源记录在 `provenance.json`。`_data/cardio_plans.json` 的 `default` 决定有氧计划；当前为约 300 kcal 的计划 2。修改计划时同步核对 `_data/plan_metrics.yml` 的参考消耗。切换饮食计划时，营养、赤字、餐单、购物和做饭随之切换；训练及身体记录共用。

`_data/nutrition_basis.json` 保存食材系数、标签参考和假设，`_data/meal_nutrition.json` 保存每餐数值。用 `scripts/recalculate-nutrition.py` 重算，核对餐单、购物、流程和营养一致后发布。购买费用按周期折算，生重、干重与含骨包装重量不混用。

做饭任务依赖页加载 `cooking-progress.js`，使用统一的本次做饭进度，保留完成勾选、刷新恢复与推荐高亮；不再记录正在做状态；旧的前／后半周记录自动迁移当前选中的一批。独立计时跟做模块仍按之前要求隐藏。

六项微量营养由 `_data/micronutrient_basis.json` 提供逐项数值、来源和假设，随 `scripts/recalculate-nutrition.py` 重算每餐和日均值；没有来源的商品项目使用明确记录的成分代理估算，不能当作实测值。

## 私人 Hume 同步

Cloudflare D1 与受 Access 保护的网站入口的部署及手机配置见 [Hume 同步设置](docs/hume-sync.md)。新的自动同步记录不提交到本仓库。页面直接部署到 Cloudflare；私人入口读取数据库中的身体记录和步数。
