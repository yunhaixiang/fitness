# Fitness

独立的饮食、训练和数据记录网站。原来 `yhmath` 博客中健身计划的**可见内容**已经迁入本仓库，今后只在这里维护：

- `diet.md`：饮食页面；每周餐单表在 `_includes/diet-schedule.html`
- `treats.md`：旧放纵餐链接跳转；放纵餐现位于 `diet.md`
- `shopping.md`：独立购物清单
- `cooking.md`：独立做饭流程
- `strength.md`：力量与肌群训练量页面；动作表在 `_includes/strength-home-table.html` 和 `_includes/strength-gym-table.html`
- `cardio.md`：有氧页面；每周安排表在 `_includes/cardio-weekly-table.html`
- `stats.md`：营养和热量估计
- `tracker.html`：实际记录入口

首页“今日”按本地日期读取上述餐单和训练表。网页使用 GitHub Pages 的 Jekyll 构建，不需要单独的数据库或 npm 构建。改动上述文件后提交、推送即可更新网站。

网站默认使用低眩光暗色主题。页眉的“中文 / EN”可切换整站文字，语言选择保存在当前浏览器；切换不会改动饮食数据、购物勾选或训练记录。中文内容仍是计划的维护原稿，英文文本集中在 `assets/i18n.js`。

## 发布到 GitHub Pages

在仓库的 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch**，分支选 `main`、文件夹选 `/(root)`，保存。站点地址将是 `https://yunhaixiang.github.io/fitness/`。如果以后使用自定义域名，需同时更新 `_config.yml` 中的 `url` 和 `baseurl`。

本仓库的页面和仓库内容可能公开。迁移时没有复制原博客 Markdown 中的隐藏 HTML 注释和私密计算备注；今后也不要把不想公开的个人数据直接提交到仓库。

## 数据记录与备份

`tracker.html` 的记录保存在**当前浏览器的本地存储**，不自动上传 GitHub、不跨设备同步。它默认只展示最近八周，但旧数据不会自动删除。建议定期点击“导出备份”，将 JSON 文件保存到安全位置；换浏览器或设备时可用“导入备份”合并记录。各类别也可导出 CSV。训练计划和购物清单中的勾选框按周自动重置，不能替代正式训练日志。

计划数据仍以 HTML `<table>` 保存，页面会将其呈现为卡片、时间线和比例条；购物与训练勾选继续使用原有浏览器存储。禁用 JavaScript 时仍可查看表格。

## 本地预览

如果已安装 Jekyll，在仓库目录运行 `jekyll serve --baseurl /fitness`；打开显示的本地地址并加上 `/fitness/`。如只改内容，也可以先在 GitHub 上预览 Markdown，但完整网页样式需通过 Jekyll 或 GitHub Pages 查看。

## 多套周饮食计划

`_data/meal_plans.json` 登记所有可选计划的中英文名称、简介和五个页面地址。当前页面是 `plan-1`。选择器出现在总览、饮食、营养、购物、做饭页面；选择保存在本机，也通过链接里的 `plan` 参数传递。力量、有氧和身体记录继续共用。原计划的购物勾选和做饭进度保持不变，其他计划按 ID 单独保存。

创建下一套计划：

```sh
python3 scripts/create-meal-plan.py plan-2 --name-zh '周计划 2' --name-en 'Weekly Plan 2'
```

此命令从当前计划创建独立副本：页面在 `plans/plan-2/`，营养与赤字数据在 `_data/meal_plan_content/plan-2/`，餐序在 `_includes/meal-plans/plan-2/`，做饭任务、跟做配置、购物及做饭时间在 `assets/meal-plans/plan-2/`。修改这些副本并核对饮食、购物、营养、做饭的一致性后再发布。新计划自动出现在选择器里，不要仅增加一个指向原页面的选项。ID 用于保存进度，发布后不要随意更改。默认计划的数据仍在原文件，继续按原方式维护。

验证：`node --test tests/meal-plans.test.js`。测试使用临时第二套计划，不会向正式餐单添加虚构菜单。

### 有氧计划

`_data/cardio_plans.json` 保存一个有氧计划：20 分钟和 30 分钟两个 HIIT 视频，以及原计划的游泳、跑步机、自行车，共五个选项。统一沿用计划 1 的净消耗 180 kcal／次、每周 4 次。两个视频的逐动作估算分别保留在 `estimation.originalHiit` 和 `estimation.hiit`，约 182 和 195 kcal；情景范围重叠，不代表个人实测差异。原计划替代运动的计算保留在 `estimation.originalAlternatives`。旧的计划 2 浏览器选择或链接自动回退到计划 1。

`_data/plan_metrics.yml` 的 `reference_cardio_weekly` 标明静态营养预算包含的有氧消耗。切换时只加减有氧差额，营养概览、消耗图、放纵餐赤字和今日安排一起更新。新增饮食计划会复制各自的基准预算；修改饮食热量时同时更新该计划的 `intake_daily`、`weekly_deficit_precise` 和显示值。
