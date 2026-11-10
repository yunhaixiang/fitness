# Hume → Apple Health → 私人数据库

网站代码继续在 fitness 仓库维护；新的体重、体脂率不写进 Git。Cloudflare D1 保存记录，fitness-private 要求 Cloudflare Access 登录和邮箱白名单，fitness-ingest 接收体重、体脂率及可选的每日步数，只接受带手机专用凭据的上传，不提供读取接口。

网站页面与资源部署在无公开网址的 fitness-assets，fitness-private 先验证 Access 登录和邮箱白名单，再通过内部服务绑定读取资源。入口不配置 assets，避免静态资源路由层丢失 ctx.access；页面渲染时读取私人 D1 记录，不再从 GitHub Pages 读取页面。关闭 GitHub Pages 不影响手机同步；公开仓库与旧 Git 历史不会因此隐藏。

## Cloudflare 设置

1. 在 Workers & Pages 找到 `fitness-private` → Access → Protect this Worker behind Access。
2. 如提示启用 Cloudflare One / Zero Trust，选择 Free。创建团队名称。
3. 保护范围选 All traffic（生产和预览）。
4. 登录方式选 One-time PIN；Allow 规则必须填写具体获准邮箱，不能只允许“任何能用验证码登录的人”。
5. Worker 同时检查 `VIEWER_EMAILS`；新增医生等只读访客时，要同时更新 Access 策略和此白名单。
6. `OWNER_EMAIL` 是唯一可以生成或重置手机上传凭据的邮箱。
7. `fitness-ingest` 不使用浏览器邮箱登录；它有独立的、仅可上传的令牌验证。不要把它加入浏览器 Access 登录保护。

私人网页没有通过 Access 认证，或白名单未设置时，一律返回 403；数据库出错时不回退到公开身体数据。

## iPhone 手动测试

先在 Apple Health 确认同一次称重的“体重”和“体脂率”都已出现，来源为 Hume。

1. 登录私人入口的 `/sync/` 页面，点击“生成手机同步凭据”。只复制到自己的快捷指令，不发到聊天或仓库。重新生成会使旧凭据失效。
2. 在快捷指令中新建“同步 Hume”。添加两个“查找健康样本”动作：分别选择体重和体脂率，来源筛选为 Hume（以健康 App 中实际显示的名称为准），按开始日期从新到旧排序，每项取 1 个。
3. 分别取样本的值和开始日期。体重转换为 kg；体脂率发送百分数数值，例如 31.2，不是 0.312。若快捷指令返回的是比例，先乘以 100；首次用“显示结果”确认实际输出，不能盲目乘以 100。
4. 日期使用 ISO 8601，保留时区，例如 `2026-11-09T08:30:00-05:00`。必须用样本日期，不能用当前日期代替。
5. 两项都存在、且时间相差不超过 10 分钟才上传；没有样本时显示提示并停止。
6. 添加“获取 URL 内容”，URL 使用设置页给出的上传地址，方法 POST。
7. 请求头添加 `Content-Type: application/json`，以及设置页提供的完整 `Authorization` 值。
8. 请求正文选 JSON，添加下列四个字段，将值设置为前面动作的变量。

| 字段 | 值 |
|---|---|
| weight_kg | 体重数值，kg |
| body_fat_percent | 体脂率数值，百分数 |
| measured_at | 体重样本开始日期，ISO 8601 |
| body_fat_measured_at | 体脂样本开始日期，ISO 8601 |

9. 显示返回结果。`ok: true` 才表示请求已处理；错误必须显示出来，不能无条件提示同步成功。
10. 打开私人网站的统计页核对日期、体重、体脂率。重复运行不会增加同一天的重复行；同一天保留较新的测量。

## 在同一个 Sync Hume 中加入每日步数

身体数据仍使用最新称重时间；步数使用昨天的日历日期，与称重日期独立。用户目前仅用 iPhone 计步。

在上传动作之前添加：

1. Date（Current Date）→ Adjust Date（Subtract 1 day）→ Format Date（Custom: `yyyy-MM-dd`）→ Set Variable `StepsDate`。这是昨天的日期，不是最近24小时。
2. 新增独立的 Find Health Samples，Type=Steps，Start Date=is on=昨天的日期变量，Source=实际的 iPhone 数据来源，Group by=None，Limit=Off。确认顶部是 Find，不是 Filter 上一个动作的结果。
3. 对样本取 Value，再 Calculate Statistics → Sum，Set Variable `StepsCount`。只对选定的 iPhone 来源求和；若以后使用手表或其他来源，需要重新确认去重策略。没有样本或没有权限时，先停止并检查，不自动当作0步。
4. Date（Current Date）→ Format Date（ISO 8601）→ Set Variable `StepsCollectedAt`。
5. 在同一个 POST JSON 里增加三项：`steps_count`（Number，StepsCount）、`steps_date`（Text，StepsDate）、`steps_collected_at`（Text，StepsCollectedAt）。原来的4项保留。
6. 首次把总数与健康 App 中昨天的步数核对。`ok: true` 且 `steps_saved: true` 表示本次步数已保存。重复或更旧的快照会返回 `steps_saved: false`，不会累加。

接口保持兼容：不传这3项时仍只上传身体数据；传步数时3项必须完整。身体和步数验证均通过后在一个数据库事务中保存。新步数只通过受保护的私人入口读取，GitHub Pages 不包含私人步数。统计页提供“步数”页签和最近8周曲线；步数会替换原先固定每周12 km的步行项并更新赤字。最近7个完整日取已同步完整日的日均步数，缺失日期不当作0；不足7天显示已同步天数并外推周值。每步暂按0.70 m，净步行消耗按0.5 kcal/kg/km及最新体重计算；无有效数据则等待同步，不回退旧12 km。日常活动系数与有氧计划仍属估算，日步数无法排除训练时的重叠步数。

## 自动化

手动测试通过后，在快捷指令 → 自动化 → App，选择 Hume → 关闭时 → 立即运行 → 运行“同步 Hume”。要先等 Hume 完成写入 Apple Health。关闭 App 并不保证它此时已经同步完成；若缺一项或两项时间差过大，保留手动重试入口。

读取健康数据一般需要手机解锁；不承诺锁屏时始终自动上传。新记录通过数据库读取，无需等待网页重新发布。

## 开发与验证

- `node --test tests/private-health.test.mjs tests/body-metrics.test.js`
- D1 迁移在 `cloudflare/migrations/`。
- 两个部署配置分别为 `cloudflare/wrangler.viewer.jsonc`、`cloudflare/wrangler.ingest.jsonc`。
- `VIEWER_EMAILS`、`OWNER_EMAIL`、`INGEST_URL` 使用 Cloudflare secrets，不提交实际邮箱白名单。
- 数据库只保存手机令牌的 SHA-256 摘要；请求和健康值不写入应用日志。
- 测试数据只写入内存数据库，不伪造生产健康记录。

## 官方参考

- [Cloudflare Access 与 Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
- [邮箱验证码登录](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [D1 免费额度](https://developers.cloudflare.com/d1/platform/pricing/)
- [Apple 快捷指令 App 触发器](https://support.apple.com/en-euro/guide/shortcuts/apde31e9638b/9.0/ios/26)
