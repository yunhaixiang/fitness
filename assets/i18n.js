(() => {
  'use strict';
  const STORAGE_KEY = 'yunhai-fitness-language';
  let language = 'zh';
  try { language = localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'zh'; } catch (_) { /* storage unavailable */ }

  // Longer entries take precedence. This keeps the plan's numbers and product links intact.
  const translations = {
    '总览': 'Overview', '饮食': 'Diet', '购物': 'Shopping', '做饭': 'Cooking', '力量': 'Strength',
    '有氧': 'Cardio', '统计': 'Stats', '营养统计': 'Nutrition', '营养': 'Nutrition', '训练量': 'Training Volume', '记录': 'Log',
    '跳到内容': 'Skip to content', '我的健身计划': 'My fitness plan', '主导航': 'Main navigation',
    '快速打开计划、备餐和记录。': 'Quick access to my plan, meal prep and records.',
    '按需要打开，不必从长文里寻找。': 'Open what I need without searching through one long document.',
    '吃饭与备餐': 'Food & meal prep',
    '今日': 'Today', '锻炼': 'Training',
    '启用 JavaScript 后显示今日安排；完整计划可在饮食、力量和有氧页面查看。': 'Enable JavaScript to see today’s plan. The full schedules are on the Diet, Strength and Cardio pages.',
    '饮食安排': 'Meal plan', '本周 14 餐、早餐与加餐': '14 Meals This Week, Breakfast and a Snack',
    '购物清单': 'Shopping list', '按周购买、按需补货；可搜索和勾选': 'Weekly groceries, restocks, search and checkboxes',
    '做饭流程': 'Cooking workflow', '半周七餐、厨具线程、分盘表': 'Seven meals per batch, parallel cooking and portioning',
    '训练与恢复': 'Training & recovery', '力量训练': 'Strength training',
    '在家与健身馆动作、组数和视频': 'Home and gym exercises, sets and videos',
    '肌群训练量、动作、组数和视频': 'Muscle group training volume, exercises, sets and videos',
    '在家与健身馆的肌群训练量、动作与组数': 'Training volume, exercises and sets at home and in the gym',
    'HIIT、游泳、跑步机和健身馆自行车选项': 'HIIT, Swimming, Treadmill and Stationary Bike Options',
    '晚间安排、瑜伽和冥想': 'Evening routine, yoga and meditation',
    '数据': 'Data', '计划统计': 'Plan statistics', '热量、营养和每周训练量估计': 'Calories, nutrition and estimated weekly training volume',
    '摄入、消耗构成和营养指标': 'Calories Eaten, Calories Burned and Nutrients',
    '训练量统计': 'Training volume', '在家与健身馆的肌群图和每周组数': 'Muscle maps and weekly sets for home and gym',
    '在家与健身馆的肌群训练量和动作明细': 'Weekly Muscle Training Volume and Exercises at Home and at the Gym',
    '训练量按每组最低次数计算：主要动作的组数 × 最低次数，左右侧动作按每侧计算。辅助刺激单独列出。点击图上的肌群标签可定位到下方卡片。': 'Training volume is the number of primary sets multiplied by the minimum reps per set. For one-sided exercises, reps are counted per side. Secondary work is listed separately. Select a muscle label on the diagram to jump to its card.',
    '每日营养与消耗构成': 'Daily Nutrition and Calories Burned',
    '实际记录': 'Actual records', '身体、饮食、力量和有氧趋势': 'Body, Diet, Strength and Cardio Trends',
    '实际记录只保存在当前浏览器，请定期在记录页导出备份。': 'Records are saved in this browser only. Export backups regularly from the Log page.',
    '每周餐单与加餐': 'Weekly Meals and a Snack',
    '计划表': 'Meal schedule',
    '早餐：高纤维谷物早餐40 g，无糖豆奶约270 g，一水肌酸 5g，水果（周日—周二混合水果盘约144 g；周三—周六奇异果1个）。': 'Breakfast: 40 g high-fibre cereal, about 270 g unsweetened soy milk, 5 g creatine monohydrate, fruit (about 144 g mixed fruit Sunday–Tuesday; one kiwi Wednesday–Saturday).',
    '睡前水果加餐（23:00）：周日—周二混合水果盘约289 g；周三—周六奇异果2个。': 'Bedtime fruit snack (23:00): about 289 g mixed fruit Sunday–Tuesday; two kiwis Wednesday–Saturday.',
    '鸡大腿肉2块，水煮蛋2个': '2 chicken thighs, 2 boiled eggs',
    '鸡肉末炒蛋2个': 'ground chicken, 2 scrambled eggs',
    '鸡大腿肉1块，三文鱼1块': '1 chicken thigh, 1 salmon portion',
    'BBQ排骨1/4盒，三文鱼1块': '¼ box of BBQ ribs, 1 salmon portion',
    '菠菜，蘑菇': 'spinach, mushrooms',
    '豌豆，胡萝卜': 'peas, carrots',
    '放纵餐': 'Cheat Meals', '常见放纵餐': 'Common Cheat Meals',
    '常见放纵餐的热量与赤字影响': 'Cheat Meal Calories and Their Effect on Your Deficit',
    '常见食物的热量与赤字影响': 'Cheat Meal Calories and Their Effect on Your Deficit',
    '占参考赤字4,009 kcal（额外加吃）': 'Share of Weekly Calorie Deficit (if added)',
    '剩余每周赤字（kcal，额外加吃）': 'Weekly Deficit Left (kcal)',
    '剩余日均赤字（kcal）': 'Daily Deficit Left (kcal)',
    '每周购买与按需补货': 'Weekly purchases and occasional restocks',
    '查找食材': 'Find an item', '搜索食材或商品': 'Search ingredients or products',
    '清空本周勾选': 'Clear this week’s checks', '已买': 'Bought',
    '购买频率': 'Purchase frequency', '每周价格（CAD）': 'Weekly price (CAD)',
    '半周七餐；各厨具并行': 'Seven meals per half-week; appliances run in parallel',
    '任务依赖图': 'Task dependency diagram', '分盘表': 'Portioning table', '分盘': 'Portioning',
    '冷冻／解冻线程': 'Freeze / thaw', '电饭煲线程': 'Rice cooker', '烤箱线程': 'Oven',
    '空气炸锅线程': 'Air fryer', '煮锅线程': 'Saucepans', '炒锅线程': 'Woks', '卷饼线程': 'Wrap assembly',
    '冷冻／解冻': 'Freeze / thaw', '电饭煲': 'Rice cooker', '烤箱': 'Oven', '空气炸锅': 'Air fryer',
    '煮锅': 'Saucepans', '炒锅': 'Woks', '卷饼': 'Wraps', '分到第几盘': 'Meal numbers',
    '前半周：冷冻后半周的鸡腿肉、鸡肉末、三文鱼和半盒排骨。': 'First half: freeze the chicken thighs, ground chicken, salmon and half-box of ribs reserved for the second half.',
    '后半周：提前约36小时将冷冻的鸡腿肉、鸡肉末、三文鱼和半盒排骨移入冷藏解冻。': 'Second half: move the frozen chicken thighs, ground chicken, salmon and half-box of ribs into the refrigerator about 36 hours ahead.',
    '白米：量取干米120 mL（约96 g）淘洗沥干，加水约120 mL，用 White Rice（白米）模式煮，约50分钟。': 'White rice: measure 120 mL dry rice (about 96 g), rinse and drain, add about 120 mL water, and use the White Rice setting (about 50 minutes).',
    '调味表：橄榄油短喷约30喷＝1茶匙；粉状调味料约30下＝1茶匙': 'Seasoning table: about 30 short olive-oil sprays = 1 tsp; about 30 shakes of dry seasoning = 1 tsp.',
    '烤箱400°F预热，需15分钟。': 'Preheat oven to 400°F for 15 minutes.',
    '鸡大腿肉：取4块擦干、调味，400°F烤27分钟；第1盘的2块掰碎，第3、6盘各放1块。': 'Chicken thighs: pat four pieces dry and season; roast at 400°F for 27 minutes. Shred two for meal 1; put one each in meals 3 and 6.',
    '烤土豆：取半袋340 g，整颗拌调味，铺在烤盘上，400°F烤约30分钟至叉子能轻松刺入；均分到第4、7盘。': 'Roasted potatoes: season half a bag (340 g) whole, spread on a baking sheet and roast at 400°F for about 30 minutes until fork-tender; split evenly between meals 4 and 7.',
    'BBQ排骨：取已解冻的半盒，淋上包装内酱汁、用锡纸包好，400°F烤15–20分钟，确认中心达74°C；第4、7盘各放1/4盒。': 'BBQ ribs: use half the thawed box, pour on its sauce, wrap in foil and heat at 400°F for 15–20 minutes. Confirm the centre reaches 74°C; put one-quarter box each in meals 4 and 7.',
    '空气炸锅400°F预热，需4分钟。': 'Preheat the air fryer to 400°F for 4 minutes.',
    '三文鱼：取2盒共4块，擦干、调味，400°F烤8分钟至熟透；第3、4、6、7盘各放1块。': 'Salmon: use two boxes (four portions), pat dry, season and air-fry at 400°F for 8 minutes until cooked through; put one each in meals 3, 4, 6 and 7.',
    '水煮蛋：烧水煮鸡蛋2个，水开后煮约8分钟；掰碎后放第1盘。': 'Boiled eggs: bring water to a boil and cook two eggs for about 8 minutes; break up and add to meal 1.',
    '意面：烧水煮干面90 g，煮约8分钟。': 'Pasta: bring water to a boil and cook 90 g dry pasta for about 8 minutes.',
    '蘑菇：取1盒227 g，大火加油、调味，炒约7分钟至熟；均分到第1、4、7盘。': 'Mushrooms: cook one 227 g pack over high heat with oil and seasoning for about 7 minutes; split evenly between meals 1, 4 and 7.',
    '番茄，意面：用番茄意面酱半瓶，小火加油、调味，煮2–3分钟；拌入意面煮约3分钟至热透；均分到第3、6盘。': 'Tomato pasta: heat half a bottle of tomato pasta sauce with oil and seasonings over low heat for 2–3 minutes; add pasta and cook about 3 more minutes. Split between meals 3 and 6.',
    '菠菜：取1袋227 g，大火加油、调味，炒约7分钟至熟；均分到第4、7盘。': 'Spinach: cook one 227 g bag over high heat with oil and seasoning for about 7 minutes; split between meals 4 and 7.',
    '鸡肉末，豌豆，胡萝卜，炒蛋：炒完菠菜后擦干锅；中火加1/2茶匙油，放入鸡肉末1盒，铺开稍定型后炒散至中心74°C；加入沥干的豌豆胡萝卜罐头1罐炒热；将肉菜拨到锅边，转中小火在空处再加1/2茶匙油，倒入4个打散的鸡蛋和调味，炒至凝固后拌匀；均分到第2、5盘。': 'Ground chicken, peas, carrots and scrambled eggs: wipe the wok dry after the spinach. Add ½ tsp oil over medium heat, spread out one pack of ground chicken, let it set briefly, then break it up and cook to 74°C. Add one drained can of peas and carrots and heat through. Push the meat and vegetables aside, lower to medium-low, add another ½ tsp oil, then four beaten eggs and seasoning. Cook until set, combine and divide between meals 2 and 5.',
    '全麦卷饼皮抹 Hellmann’s Mild Chipotle 蛋黄酱1茶匙（约5 mL）。': 'Spread 1 tsp (about 5 mL) Hellmann’s Mild Chipotle mayonnaise on the whole-wheat tortilla.',
    '将掰碎的鸡大腿肉、水煮蛋和蘑菇放入大号卷饼皮，卷好放第1盘。': 'Put the shredded chicken thighs, broken-up boiled eggs and mushrooms into the large tortilla; roll and put in meal 1.',
    '在家与健身馆的动作、组数和肌群': 'Exercises, sets and muscle groups at home and at the gym',
    '力量训练（在家）': 'Strength training (home)', '力量训练（在健身馆）': 'Strength training (gym)',
    '配重为试练起点；史密斯机数字是加片总重量。首次使用按动作稳定程度调整。': 'Weights are starting points for a trial session. Smith machine values are the total weight of added plates. Adjust them so you can perform each movement with control.',
    '腹直肌；侧腹辅助': 'rectus abdominis; obliques (secondary)',
    '有氧与每周安排': 'Cardio & weekly schedule', 'HIIT、游泳、跑步机或健身馆自行车四选一': 'Choose HIIT, Swimming, Treadmill or Stationary Bike',
    '每周安排与有氧': 'Weekly training schedule & cardio',
    '每周安排': 'Weekly plan', '有氧选择': 'Cardio options',
    'Juice & Toya 跟练视频 ↗': 'Juice & Toya workout video ↗',
    '总消耗': 'Total Calories Burned', '净消耗': 'Net Calories Burned',
    '每个来回自由泳去、蛙泳回；20 个来回，按 25 m 泳池计算共 1,000 m。': 'Swim freestyle out and breaststroke back for each lap. Twenty laps in a 25 m pool total 1,000 m.',
    '坡度 0%。': '0% incline.',
    '固定自行车；单次净消耗约 200 kcal。': 'Stationary bike; about 200 kcal burned above resting per session.',
    '热身：5分钟，约50 W，轻松骑。': 'Warm up: cycle easily for 5 minutes at about 50 W.',
    '主训练：25分钟，保持90–100 W。': 'Main set: cycle for 25 minutes at 90–100 W.',
    '放松：5分钟，约50 W，轻松骑。': 'Cool down: cycle easily for 5 minutes at about 50 W.',
    '有氧选项一：HIIT。': 'Cardio option 1: HIIT.',
    '有氧选项二：游泳。每个来回自由泳去、蛙泳回；每次20个来回，按25 m泳池计算共1,000 m，预计约30–35分钟。': 'Cardio option 2: swimming. Swim freestyle out and breaststroke back for each lap. Twenty laps in a 25 m pool total 1,000 m, about 30–35 minutes.',
    '有氧选项三：跑步机。约30分钟，坡度0%': 'Cardio option 3: treadmill. About 30 minutes at 0% incline.',
    '热身：3 个来回，轻松游。': 'Warm up: three easy laps.',
    '主训练：2 组 × 7 个来回，组间休息30–60秒。': 'Main set: two sets of seven laps, resting 30–60 seconds between sets.',
    '放松：3 个来回，轻松游。': 'Cool down: three easy laps.',
    '热身：5分钟，4–5 km/h（约2.5–3.1 mph）走路。': 'Warm up: walk 5 minutes at 4–5 km/h (about 2.5–3.1 mph).',
    '主训练：20分钟，约8 km/h（约5 mph）慢跑。': 'Main set: jog 20 minutes at about 8 km/h (about 5 mph).',
    '放松：5分钟，逐渐降到3–4 km/h（约1.9–2.5 mph）走路。': 'Cool down: gradually slow to 3–4 km/h (about 1.9–2.5 mph) for 5 minutes.',
    '加餐': 'Snack',
    '营养与训练统计': 'Nutrition & training statistics',
    '每日营养、每餐营养及每周训练量': 'Daily nutrition, meal nutrition and weekly training volume',
    '一周营养统计': 'Weekly Nutrition', '一周营养': 'Weekly Nutrition', '每日营养': 'Daily Nutrition',
    '运动按扣除同期基础消耗后的净增加量计入，避免重复计算；日常加成不代表单独测得的食物热效应。': 'Exercise is counted as additional calories burned beyond resting energy use to avoid double counting. The daily activity allowance is not a separately measured thermic effect of food.',
    '页面填写。': 'page.',
    '数据记录': 'Data log', '记录实际执行，而不只看计划上的数字。': 'Track what I actually did, not just the planned numbers.',
    '数据只保存在当前浏览器。': 'Data is saved in this browser only. ',
    'GitHub Pages 不会自动把记录写回仓库，也不会跨设备同步。建议每周导出一次 JSON 备份；更换设备时用“导入备份”合并记录。页面默认显示最近 8 周，旧记录仍保存在浏览器和导出文件里。': 'GitHub Pages does not write records back to the repository or sync across devices. Export a JSON backup weekly and use Import backup to merge records on a new device. This page shows the latest eight weeks; older records remain in the browser and exported backups.',
    '导出备份': 'Export backup', '导入备份': 'Import backup',
    '记录类型': 'Record type',
    '身体组成': 'Body composition', '饮食': 'Diet', '力量': 'Strength', '有氧': 'Cardio',
    '身体组成记录': 'body-composition entry', '饮食记录': 'diet entry', '力量训练记录': 'strength entry',
    '有氧训练记录': 'cardio entry',
    '建议起床如厕后、吃喝前记录；同一设备、同一条件下看趋势。': 'Record after waking and using the bathroom, before food or drink. Compare trends under consistent conditions on the same device.',
    '填当天实际摄入；不必为了凑满所有项目而放弃记录。': 'Enter actual intake for the day; partial records are still useful.',
    '每个动作记一条；负重写实际使用重量，左右两侧次数可写在备注里。': 'Enter one row per exercise. Record the weight used; left/right reps can go in Notes.',
    '记录实际完成量；热量是估计值，不必每次都填。': 'Record what you completed. Calories are estimates and can be left blank.',
    '浏览器未能保存记录。请检查是否禁用了本地存储，或先导出备份。': 'The browser could not save this record. Check local storage or export a backup.',
    '最新体重': 'Latest weight', '最近体脂率': 'Latest body fat',
    '还没有记录': 'No records yet', '保存记录': 'Save entry', '已保存': 'Saved',
    '最近 8 周趋势': 'Last 8 weeks: trend', '最近 8 周记录': 'Last 8 weeks: entries',
    '选择趋势指标': 'Choose trend metric', '导出此类 CSV': 'Export this category as CSV',
    '还没有最近 8 周的记录。': 'No entries in the last eight weeks.',
    '至少记录两个日期才能显示趋势。': 'Enter at least two dates to show a trend.',
    '训练动作按日期列在下方，便于比较组数和负重。': 'Exercises are listed by date below so sets and weights are easy to compare.',
    '操作': 'Action', '删除': 'Delete', '确定删除这条记录？': 'Delete this entry?',
    '导入完成，新增': 'Import complete; added', '条记录。': 'entries.',
    '这不是本站导出的有效 JSON 备份。': 'This is not a valid JSON backup exported from this site.',
    '格式不符': 'Invalid format'
    , '一': 'Mon', '二': 'Tue', '四': 'Thu', '五': 'Fri',
    '盐': 'salt', '钠': 'Sodium', '钙': 'Calcium', '铁': 'Iron', '钾': 'Potassium', '碘': 'Iodine',
    '钠 mg': 'Sodium mg', '钙 mg': 'Calcium mg', '铁 mg': 'Iron mg', '钾 mg': 'Potassium mg',
    '估算局限': 'Estimate limitations', '骨骼肌 kg': 'Skeletal muscle kg',
    '每餐营养统计': 'Nutrition per meal',
    '力量训练（净增加）': 'Strength training (above rest)',
    '酱蒜无骨炸鸡（bb.q Chicken Soy Garlic Chicken）': 'Soy garlic boneless fried chicken (bb.q Chicken)',
    '凯撒鸡肉卷（6IXTY WINGS Chicken Caesar Wrap）': 'Chicken Caesar wrap (6IXTY WINGS)',
    '炸鸡汉堡（Burger Burger Johnny Cash Chicken）': 'Fried chicken sandwich (Burger Burger Johnny Cash Chicken)',
    '炸鸡排套餐（Ozen Sushi Chicken Katsu Combo）': 'Chicken katsu combo (Ozen Sushi)',
    '脆鸡沙威玛卷（Osmow’s Crispy Chicken Shawarma Wrap）': 'Crispy chicken shawarma wrap (Osmow’s)',
    '新奥尔良烤翅（Mr. Panda BBQ Sweet Roasted Chicken Wings）': 'Sweet roasted chicken wings (Mr. Panda BBQ)',
    'Pepperoni 披萨（Pizza Pizza，大号）': 'Pepperoni pizza (Pizza Pizza, large)',
    '奥利奥暴风雪冰淇淋（DQ OREO Cookie Blizzard）': 'OREO Cookie Blizzard (DQ)',
    '炒饭（Panda Express Fried Rice，美版参考）': 'Fried rice (Panda Express, US reference)',
    '肉汁奶酪薯条（Pizza Pizza Classic Poutine）': 'Classic poutine (Pizza Pizza)',
    '巨无霸汉堡（加拿大 McDonald’s）': 'Big Mac (McDonald’s Canada)',
    '炸鸡汉堡（KFC Famous Chicken Sandwich）': 'Famous Chicken Sandwich (KFC)',
    '巧克力奶昔（DQ Chocolate Shake）': 'Chocolate shake (DQ)',
    '陈皮鸡（Panda Express Orange Chicken，美版参考）': 'Orange chicken (Panda Express, US reference)',
    '迷你布朗尼（Pizza Pizza Two-Bite Brownies）': 'Two-Bite Brownies (Pizza Pizza)',
    '炸鸡（KFC Original Recipe）': 'Original Recipe fried chicken (KFC)',
    '原味波浪薯片（Wavy Lay’s）': 'Original wavy potato chips (Wavy Lay’s)',
    '焦糖星冰乐（Starbucks Caramel Frappuccino）': 'Caramel Frappuccino (Starbucks)',
    '牧场酱脆鸡卷（DQ Ranch Crispy Chicken Wrap）': 'Ranch Crispy Chicken Wrap (DQ)',
    '炸鸡柳（DQ Chicken Strips）': 'Chicken strips (DQ)',
    '薯条（DQ Fries）': 'Fries (DQ)', '炸洋葱圈（DQ Onion Rings）': 'Onion rings (DQ)',
    '香草冰淇淋（DQ Vanilla Cone）': 'Vanilla cone (DQ)',
    '普通雪碧': 'Regular Sprite', '普通可口可乐': 'Regular Coca-Cola',
    '1整份，1.2 lb': 'One full serving, 1.2 lb', '1,156，菜单标注': '1,156',
    '1个，默认普通薯条': 'One wrap plus regular fries',
    '1整套，含米饭、饺子、yam配菜、汤及沙拉': 'One full combo with rice, dumplings, yam side, soup and salad',
    '1个Regular，含蒜酱及OzPotle酱': 'One regular wrap with garlic sauce and OzPotle sauce',
    '1整份，1 lb带骨': 'One full serving, 1 lb bone-in',
    '1份，340 g（12 oz）': 'One serving, 340 g (12 oz)',
    '1个，不含薯条和饮料': 'One sandwich, without fries or drink',
    '1份，176 g（6.2 oz），不含米饭': 'One serving, 176 g (6.2 oz), without rice',
    '2块鸡大腿，不含配餐和蘸酱': 'Two thigh pieces, without sides or dipping sauce',
    '1杯Grande，473 mL，标准配方': 'One Grande (473 mL), standard recipe',
    '3条，不含蘸酱': 'Three strips, without dipping sauce',
    '1份Regular，不含蘸酱': 'One regular serving, without dipping sauce',
    '1个Small甜筒，不加脆皮和配料': 'One small cone, without coating or toppings',
    '含糖可乐': 'Sugared cola', '汽水，不想要甜味': 'Soda without a sweet taste',
    '含糖冰茶': 'Sugared iced tea', '果冻、甜点': 'Gelatin or dessert',
    '加水制成125 mL': 'Prepared with water to make 125 mL',
    '巧克力甜点': 'Chocolate dessert', '香草奶味甜点': 'Vanilla-flavoured dessert',
    '冰淇淋、雪糕': 'Ice cream or frozen treats', '巧克力雪糕': 'Chocolate ice-cream bar',
    '奶味冰淇淋': 'Creamy ice cream', '饼干、脆口零食': 'Cookies or crunchy snacks',
    '薯片、咸脆零食': 'Chips or savoury crunchy snacks',
    '1迷你袋31 g': 'One mini bag, 31 g',
    '2片，不加抹酱': 'Two pieces, without spread',
    '1支50 mL': 'One 50 mL bar', '1支60 mL': 'One 60 mL bar',
    '1杯Small': 'One small cup', '1瓶500 mL': 'One 500 mL bottle', '1罐355 mL': 'One 355 mL can', '1份': 'One serving',
    '已购买': 'Bought: ',
    '8块装；每盒约0.51–0.76 kg，营养按635 g估算': 'Eight pieces per pack; about 0.51–0.76 kg, with nutrition estimated at 635 g',
    '约$11.42（按实际重量计价）': 'about $11.42 (final price by weight)',
    '12个 / 盒': '12 eggs per pack', '2桶 / 周': '2 cartons / week',
    '12罐×355 mL / 箱': '12 cans × 355 mL / case', '1箱 / 周': '1 case / week',
    '1.3 kg / 盘': '1.3 kg / tray', '1盘 / 周': '1 tray / week',
    '454 g / 包': '454 g / pack',
    '600 g / 盒，含骨及酱汁；营养暂估397 g可食部分 / 盒': '600 g pack including bones and sauce; nutrition estimated using 397 g edible portion per pack',
    '每盒2块，按320 g / 盒计算': 'Two portions per pack; calculated at 320 g per pack',
    '454 g / 盒（2袋×227 g）': '454 g pack (two 227 g bags)',
    '610 g / 袋，10片（61 g / 片）': '610 g bag, ten tortillas (61 g each)',
    '无味，300 g / 罐，参考$27.98': 'Unflavoured, 300 g tub; reference price $27.98',
    '单颗售卖': 'Sold individually',
    '本次备餐': 'This meal-prep session',
    '本次鸡腿肉、鸡肉末和三文鱼冷藏；半盒BBQ排骨提前解冻；后半周份冷冻': 'Refrigerate this batch’s chicken thighs, ground chicken and salmon; thaw half a box of BBQ ribs; freeze second-half portions',
    '鸡腿肉、鸡肉末、三文鱼及半盒BBQ排骨提前约36小时移入冷藏解冻': 'Move chicken thighs, ground chicken, salmon and half a box of BBQ ribs to the refrigerator about 36 hours ahead',
    '本次食材就绪': 'Ingredients ready', '预热': 'Preheat', '整颗烤土豆': 'Whole roasted potatoes',
    '煮锅一：烧水': 'Saucepan 1: boil water', '煮锅二：烧水': 'Saucepan 2: boil water',
    '小炒锅：蘑菇': 'Small wok: mushrooms', '大炒锅：菠菜': 'Large wok: spinach',
    '抹酱、装馅、卷起': 'Spread sauce, fill and roll',
    '收尾：分盘、入冰箱、清洗': 'Finish: portion, refrigerate and clean',
    '煮锅一': 'Saucepan 1', '煮锅二': 'Saucepan 2', '小炒锅': 'Small wok', '大炒锅': 'Large wok',
    '1放2个': 'Two in meal 1', '3、4、6、7各1块': 'One each in meals 3, 4, 6 and 7',
    '1放2块；3、6各1块': 'Two in meal 1; one each in meals 3 and 6',
    '1、4、7各1/3': 'One-third each in meals 1, 4 and 7',
    '站姿哑铃肩推': 'standing dumbbell shoulder press',
    '单臂支撑哑铃划船': 'supported single-arm dumbbell row',
    '哑铃肩推': 'dumbbell shoulder press', '哑铃划船': 'dumbbell row', '每侧': 'per side',
    '有氧：HIIT、游泳、跑步机或健身馆自行车，4次／周（净增加）': 'Cardio: HIIT, Swimming, Treadmill or Stationary Bike, Four Times a Week (Above Rest)',
    '步行（估计每周12 km，净增加）': 'Walking (12 km a week, above rest)',
    '净增加': 'net increase',
    '每日能量与每周赤字估计': 'Daily energy and estimated weekly deficit',
    '日均摄入占消耗75%，赤字25%': 'Daily calories eaten account for 75% of calories burned; the planned deficit is 25%', '每日能量与每周赤字': 'Daily Calories and Weekly Deficit',
    '能量概览 · 不含放纵餐': 'Energy Overview · Excluding Cheat Meals',
    '日均摄入': 'Daily Calories Eaten', '日均消耗': 'Daily Calories Burned', '日均赤字': 'Daily Calorie Deficit',
    '每周赤字': 'Weekly Deficit', '每周赤字等价脂肪': 'Fat Equivalent of Weekly Deficit',
    'kcal／天': 'kcal/day', 'kg／周': 'kg/week',
  };

  const terms = {
    '预热': 'Preheat',
    '鸡肉末，豌豆，胡萝卜，炒蛋': 'ground chicken, peas, carrots, scrambled eggs',
    '日常活动等（久坐系数加成）': 'Everyday activity and other energy use',
    '有氧：HIIT、游泳、跑步机或健身馆自行车，4次／周（净增加）': 'Cardio: HIIT, Swimming, Treadmill or Stationary Bike, Four Times a Week (Net)',
    '步行（估计每周12 km，净增加）': 'Walking (about 12 km/week, net)',
    '力量训练（净增加）': 'Strength training (net)',
    '饱和脂肪占总热量': 'Saturated fat as share of calories',
    '每周训练量统计': 'Weekly training volume', '每餐营养统计': 'Nutrition per meal',
    '每周合计': 'Weekly total', '平均每天': 'Daily average', '建议每日范围或目标': 'Suggested daily range or goal',
    '训练量水平（估计）': 'Volume (estimate)', '主要：动作与组数': 'Primary: exercises and sets',
    '辅助：动作与组数': 'Secondary: exercises and sets', '肌群／常用英文': 'Muscle group / common English name',
    'Omega-3：EPA，DHA（合计）': 'Omega-3: EPA, DHA (combined)',
    '番茄，意面': 'tomato, pasta',
    '维生素B12': 'Vitamin B12', '维生素D': 'Vitamin D', '膳食胆固醇': 'Dietary cholesterol',
    '碳水化合物': 'Carbohydrates', '膳食纤维': 'Dietary fibre', '饱和脂肪': 'Saturated fat',
    '总脂肪': 'Total fat', '添加糖': 'Added sugar', '总糖': 'Total sugars',
    '无单独上限；重点控制添加糖': 'No separate limit; focus on added sugar',
    '尽量少；优先控制饱和脂肪': 'Keep low; prioritize saturated fat',
    '营养指标': 'Nutrient', '热量估计': 'Calorie estimate', '消耗构成（估算）': 'Where Your Calories Are Burned',
    '每周 kcal': 'Weekly kcal', '日均 kcal': 'Daily kcal',
    '2桶 / 周（1桶均分早餐；另1桶分给最后两餐和每天加餐）': '2 cartons/week (one split across breakfasts; the other split between the final two meals and daily snacks)',
    '1箱 / 周（其余12顿午晚餐各1罐）': '1 case/week (1 can with each of the other 12 lunches and dinners)',
    '周日—周二早餐（水果盘1/3）': 'Sunday–Tuesday breakfast (⅓ of daily fruit tray serving)',
    '周日—周二睡前加餐（水果盘2/3）': 'Sunday–Tuesday bedtime snack (⅔ of daily fruit tray serving)',
    '周三—周六早餐（奇异果1个）': 'Wednesday–Saturday breakfast (1 kiwi)',
    '周三—周六睡前加餐（奇异果2个）': 'Wednesday–Saturday bedtime snack (2 kiwis)',
    '周二午／周三晚／周五晚／周日午': 'Tue lunch / Wed dinner / Fri dinner / Sun lunch',
    '周日晚／周四午': 'Sun dinner / Thu lunch',
    '周一午／周二晚／周四晚／周六午': 'Mon lunch / Tue dinner / Thu dinner / Sat lunch',
    '周一晚／周三午／周五午／周六晚': 'Mon dinner / Wed lunch / Fri lunch / Sat dinner',
    '鸡大腿肉': 'chicken thighs', '三文鱼': 'salmon', '鸡肉末': 'ground chicken',
    'BBQ熟猪背排骨': 'cooked BBQ pork back ribs', 'BBQ排骨': 'BBQ ribs',
    '去骨去皮鸡大腿肉': 'boneless skinless chicken thighs', '特瘦鸡肉末': 'extra-lean ground chicken',
    '水煮蛋': 'boiled eggs', '炒蛋': 'scrambled eggs', '鸡蛋': 'eggs',
    '白米饭': 'white rice', '白米': 'white rice', '意面': 'pasta', '番茄': 'tomato',
    '烤土豆': 'roasted potatoes', '土豆': 'potatoes', '全麦卷饼皮': 'whole-wheat tortillas', '卷饼皮': 'tortilla',
    '蘑菇': 'mushrooms', '嫩菠菜': 'baby spinach', '菠菜': 'spinach',
    '豌豆，胡萝卜': 'peas, carrots', '豌豆': 'peas', '胡萝卜': 'carrots',
    '番茄意面酱': 'tomato pasta sauce', '新鲜混合水果盘': 'fresh mixed-fruit tray',
    '完整奇异果': 'whole kiwis', '奇异果': 'kiwis', '高纤维谷物早餐': 'high-fibre cereal',
    '无糖豆奶': 'unsweetened soy milk', 'Fresca无糖汽水': 'Fresca zero-sugar soda',
    'Chipotle蛋黄酱': 'chipotle mayonnaise',
    '黑胡椒': 'black pepper', '蒜粉': 'garlic powder', '洋葱粉': 'onion powder',
    '红椒粉': 'paprika', '干牛至叶': 'dried oregano', '意式混合香草': 'Italian herb blend',
    '橄榄油': 'olive oil', '减盐酱油': 'reduced-sodium soy sauce', '酱油': 'soy sauce',
    '鸡粉': 'chicken bouillon powder', '一水肌酸': 'creatine monohydrate', '盐': 'salt',
    '食材': 'Ingredient', '商品': 'Product', '编号': 'No.', '星期': 'Day', '餐次': 'Meal',
    '碳水': 'Carbs', '蛋白质': 'Protein', '蔬菜': 'Vegetables', '热量': 'Calories',
    '晚餐': 'Dinner', '午餐': 'Lunch', '早餐': 'Breakfast',
    '周一': 'Monday', '周二': 'Tuesday', '周三': 'Wednesday', '周四': 'Thursday',
    '周五': 'Friday', '周六': 'Saturday', '周日': 'Sunday',
    '前半周': 'First half', '后半周': 'Second half',
    '上1': 'First 1', '上2': 'First 2', '上3': 'First 3', '上4': 'First 4',
    '上5': 'First 5', '上6': 'First 6', '上7': 'First 7',
    '下1': 'Second 1', '下2': 'Second 2', '下3': 'Second 3', '下4': 'Second 4',
    '下5': 'Second 5', '下6': 'Second 6', '下7': 'Second 7',
    '一': 'Mon', '二': 'Tue', '四': 'Thu', '五': 'Fri',
    '约': 'about ', '粗估': 'roughly ', '已计': 'counted ', '估': 'estimated ',
    '按需补': 'Restock as needed', '单颗售卖': 'Sold individually',
    '箱': 'case', '桶': 'carton', '盘': 'tray', '瓶': 'bottle', '罐': 'can', '袋': 'bag', '盒': 'pack',
    '块': 'pieces', '个': 'pieces', '片': 'slices', '条': 'pieces', '杯': 'cup',
    '总时长': 'Total time', '动作': 'Exercise', '组数 × 次数／时长': 'Sets × reps / time',
    '每组完成': 'Sets done', '训练肌群': 'Muscles trained', '组': 'sets', '次': 'reps',
    '分钟': 'min', '／腿': '/leg', '／侧': '/side',
    '胸肌': 'chest', '三头肌': 'triceps', '二头肌': 'biceps', '肩前侧': 'front delts',
    '肩外侧': 'side delts', '肩后侧': 'rear delts', '上背': 'upper back', '背阔肌': 'lats',
    '斜方肌': 'traps', '小臂': 'forearms', '腹直肌': 'rectus abdominis', '腹斜肌': 'obliques',
    '侧腹': 'obliques', '腹肌': 'abs', '腰方肌': 'quadratus lumborum', '下背': 'lower back',
    '臀部': 'glutes', '大腿前侧': 'quads', '大腿后侧': 'hamstrings', '小腿': 'calves',
    '辅助': 'secondary', '主要': 'primary', '稳定': 'stability',
    '充足': 'adequate', '基本充足': 'mostly adequate', '难判断': 'hard to judge', '偏少': 'on the low side',
    '俯卧撑': 'push-ups', '卷腹': 'crunches', '反向卷腹': 'reverse crunches',
    '每侧': 'per side',
    '站姿哑铃肩推': 'standing dumbbell shoulder press', '双哑铃俯身划船': 'dumbbell bent-over row',
    '哑铃侧平举': 'dumbbell lateral raise', '哑铃反向飞鸟': 'dumbbell reverse fly',
    '臀桥脚跟走步': 'hamstring walkout', '哑铃高脚杯深蹲': 'dumbbell goblet squat',
    '哑铃反向弓步': 'dumbbell reverse lunge', '哑铃罗马尼亚硬拉': 'dumbbell Romanian deadlift',
    '哑铃双腿提踵': 'dumbbell calf raise', '哑铃提踵': 'dumbbell calf raise',
    '单手哑铃侧屈': 'dumbbell side bend', '哑铃侧屈': 'dumbbell side bend',
    '单臂支撑哑铃划船': 'supported single-arm dumbbell row', '哑铃弯举': 'dumbbell curl',
    '哑铃分腿蹲': 'dumbbell split squat', '支撑式单腿哑铃罗马尼亚硬拉': 'supported single-leg dumbbell Romanian deadlift',
    '支撑式单腿硬拉': 'supported single-leg deadlift', '罗马尼亚硬拉': 'Romanian deadlift',
    '哑铃单腿臀桥': 'single-leg dumbbell glute bridge', '单腿臀桥': 'single-leg glute bridge',
    '反向弓步': 'reverse lunge', '分腿蹲': 'split squat', '高脚杯深蹲': 'goblet squat',
    '史密斯机平板卧推': 'Smith-machine bench press', '史密斯机卧推': 'Smith-machine bench press',
    '坐姿器械肩推': 'seated machine shoulder press', '器械肩推': 'machine shoulder press',
    '坐姿器械划船': 'seated machine row', '器械划船': 'machine row',
    '单臂绳索侧平举': 'single-arm cable lateral raise', '绳索三头下压': 'cable triceps pushdown',
    '器械反向飞鸟': 'reverse pec deck', '坐姿器械卷腹': 'seated machine crunch',
    '器械卷腹': 'machine crunch', '史密斯机深蹲': 'Smith-machine squat',
    '史密斯机反向弓步': 'Smith-machine reverse lunge',
    '史密斯机罗马尼亚硬拉': 'Smith-machine Romanian deadlift',
    '俯卧器械腿弯举': 'lying leg curl', '器械腿弯举': 'leg curl',
    '史密斯机站姿提踵': 'Smith-machine standing calf raise', '史密斯机提踵': 'Smith-machine calf raise',
    '高位下拉': 'lat pulldown', '绳索弯举': 'cable curl', '站姿绳索转体': 'standing cable rotation',
    '绳索转体': 'cable rotation', '坐姿腿举': 'seated leg press',
    '坐姿器械腿屈伸': 'seated leg extension', '器械腿屈伸': 'leg extension',
    '史密斯机臀推': 'Smith-machine hip thrust',
    '类型': 'Type', '基础代谢': 'Basal Metabolic Rate', '合计': 'Total',
    '钠': 'Sodium', '钙': 'Calcium', '铁': 'Iron', '钾': 'Potassium', '碘': 'Iodine',
    '纤维': 'Fibre', '脂肪': 'Fat', '胆固醇': 'Cholesterol',
    '在家': 'Home', '健身馆': 'Gym', '休息': 'Rest', '训练': 'Training', '上肢推拉与核心': 'Upper-body push/pull & core',
    '下肢、臀部与核心': 'Lower body, glutes & core', '下肢与核心': 'Lower body & core',
    'HIIT／游泳／跑步机（三选一）': 'HIIT / swim / treadmill (choose one)',
    '游泳': 'Swimming', '跑步机': 'Treadmill', '健身馆自行车': 'Stationary Bike (Gym)',
    '低冲击、简化动作': 'Low impact, modified moves', '完整动作、跟上跳跃和节奏': 'Full moves, jumping and pace',
    '跟练版本': 'Workout version', '单次总消耗 kcal': 'Gross kcal per session', '单次净消耗 kcal': 'Net kcal per session',
    '时间': 'Time', '安排': 'Activity',
    '日期': 'Date', '起床日期': 'Wake-up date', '体重': 'Weight', '体脂率': 'Body fat',
    '腰围': 'Waist', '颈围': 'Neck', '肚脐腹围': 'Navel circumference',
    '脂肪量': 'Fat mass', '骨骼肌量': 'Skeletal muscle', '内脏脂肪（App 数值）': 'Visceral fat (app value)',
    '体水分': 'Body water', '备注': 'Notes', '场地': 'Location', '每组次数': 'Reps per set',
    '单只哑铃／器械负重': 'Weight per dumbbell / machine load', '项目': 'Activity',
    '时长': 'Duration', '距离': 'Distance', '估计净消耗': 'Estimated Net Calories Burned',
    '新增': 'Add ', '记录': ' entry', '最近八周': 'over eight weeks',
    '首值': 'first value ', '末值': 'last value ',
    '份量': 'Portion', '食物': 'Food', '约': 'about ', '估': 'estimated '
  };

  const keys = Object.keys(translations).filter((key) => key.length >= 3).sort((a, b) => b.length - a.length);
  const termKeys = Object.keys(terms).filter((key) => key.length >= 2).sort((a, b) => b.length - a.length);
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  const hasChinese = /[\u3400-\u9fff]/;
  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'with']);
  const units = new Set(['g', 'kg', 'kcal', 'mg', 'mcg', 'ml', 'lb', 'bpm', 'ms', 'cm']);
  function titleCase(value) {
    return value.replace(/[A-Za-z]+(?:['’\-][A-Za-z]+)*/g, (word, offset) => {
      const lower = word.toLowerCase();
      if (units.has(lower) || /[a-z][A-Z]/.test(word) || (word.length > 1 && word === word.toUpperCase())) return word;
      const prefix = value.slice(0, offset).trimEnd();
      if (minorWords.has(lower) && /[A-Za-z]/.test(prefix) && !/[:+·/–—]\s*$/.test(prefix)) return lower;
      return (word[0].toUpperCase() + word.slice(1)).replace(/-([a-z])/g, (_, letter) => `-${letter.toUpperCase()}`);
    }).replace(/\bBb\.Q\b/g, 'bb.q').replace(/\bBubly\b/g, 'bubly');
  }

  function translate(source) {
    if (!hasChinese.test(source)) return source.replace(/(?<=\d)、(?=\d)/g, ', ');
    const checked = source.trim().match(/^(健身馆)?周([一二四五])(.+)第(\d+)组(（左右）)?$/);
    if (checked) {
      const days = { 一: 'Monday', 二: 'Tuesday', 四: 'Thursday', 五: 'Friday' };
      return `${checked[1] ? 'Gym ' : ''}${days[checked[2]]} ${translate(checked[3])}, set ${checked[4]}${checked[5] ? ' (both sides)' : ''}`;
    }
    const direct = translations[source.trim()];
    if (direct) return source.replace(source.trim(), direct);
    let result = source;
    for (const key of keys) if (result.includes(key)) result = result.replaceAll(key, translations[key]);
    for (const key of termKeys) if (result.includes(key)) result = result.replaceAll(key, terms[key]);
    result = result.replace(/最少\s*(\d+)/g, 'at least $1')
      .replace(/(?<!\d)1\s*组/g, '1 set')
      .replace(/(\d+)\s*组/g, '$1 sets').replace(/(\d+)\s*次/g, '$1 reps')
      .replace(/(\d+)\s*分钟/g, '$1 min').replace(/(\d+)\s*茶匙/g, '$1 tsp')
      .replace(/(\d+)\s*盒/g, '$1 packs').replace(/(\d+)\s*袋/g, '$1 bags')
      .replace(/(\d+)\s*罐/g, '$1 cans').replace(/(\d+)\s*瓶/g, '$1 bottles')
      .replace(/(\d+)\s*块/g, '$1 pieces').replace(/(\d+)\s*个/g, '$1 pieces')
      .replace(/(\d+)\s*片/g, '$1 slices').replace(/(\d+)\s*杯/g, '$1 cups')
      .replace(/\s*\/\s*周/g, ' / week').replace(/约(?=[\d$])/g, 'about ')
      .replace(/^估(?=\d)/, 'estimated ')
      .replace(/(\d+(?:\.\d+)?)\s*(g|kg|mL|L)\s*\/\s*盒/g, '$1 $2 / pack')
      .replace(/(\d+(?:\.\d+)?)\s*(g|kg|mL|L)\s*\/\s*袋/g, '$1 $2 / bag')
      .replace(/(\d+(?:\.\d+)?)\s*(g|kg|mL|L)\s*\/\s*瓶/g, '$1 $2 / bottle')
      .replace(/(\d+(?:\.\d+)?)\s*(g|kg|mL|L)\s*\/\s*罐/g, '$1 $2 / can')
      .replace(/(\d+(?:\.\d+)?)\s*(g|kg|mL|L)\s*\/\s*桶/g, '$1 $2 / carton')
      .replaceAll('（', ' (').replaceAll('）', ')').replaceAll('、', ', ').replaceAll('，', ', ')
      .replaceAll('＋', ', ').replaceAll('；', '; ').replaceAll('／', '/')
      .replace(/([A-Za-z])(?=\d)/g, '$1 ').replace(/(\d)min\b/g, '$1 min')
      .replace(/\b1 (packs|bags|cans|bottles|pieces|slices|cups|cartons|trays|cases)\b/g, (_, unit) => `1 ${unit.slice(0, -1)}`);
    return result;
  }

  function translateMermaid(source) {
    return source.split('\n').map((line) => line
      .replace(/\[([^\]\n]+)\]|\{([^}\n]+)\}/g, (match, box, decision) => {
        const label = box ?? decision;
        const translated = translate(label).replaceAll('"', '&quot;');
        return box === undefined ? `{\"${translated}\"}` : `[\"${translated}\"]`;
      })
      .replace(/\|([^|\n]+)\|/g, (match, label) => `|${translate(label)}|`)).join('\n');
  }

  function apply(root = document.body) {
    if (language !== 'en') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.parentElement?.closest('script,style,svg')) continue;
      if (!originalText.has(node)) originalText.set(node, node.textContent);
      const source = originalText.get(node);
      const itemEnglish = node.parentElement?.getAttribute('data-en');
      const translated = itemEnglish ?? (hasChinese.test(source)
        ? (node.parentElement?.matches('code.language-mermaid') ? translateMermaid(source) : translate(source))
        : translate(source));
      const isLabel = node.parentElement?.matches('th,label,button,.brand,.main-nav a,.training-table td > a')
        || node.parentElement?.closest('h1,h2,h3,h4,h5,h6');
      if (translated !== source || isLabel) node.textContent = isLabel ? titleCase(translated) : translated;
    }
    for (const element of root.querySelectorAll('[aria-label],[placeholder],[title],img[alt]')) {
      if (!originalAttributes.has(element)) originalAttributes.set(element, {});
      const originals = originalAttributes.get(element);
      for (const attr of ['aria-label', 'placeholder', 'title', 'alt']) {
        if (!element.hasAttribute(attr)) continue;
        if (!(attr in originals)) originals[attr] = element.getAttribute(attr);
        if (hasChinese.test(originals[attr])) {
          const translated = translate(originals[attr]);
          element.setAttribute(attr, attr === 'aria-label' || attr === 'placeholder' ? titleCase(translated) : translated);
        }
      }
    }

  }

  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  if (language === 'en') {
    document.title = titleCase(translate(document.title.replace(' · Yunhai Fitness', ''))) + ' · Yunhai Fitness';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = translate(meta.content);
    apply();
  }
  for (const button of document.querySelectorAll('[data-language]')) {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
    button.addEventListener('click', () => {
      if (button.dataset.language === language) return;
      try { localStorage.setItem(STORAGE_KEY, button.dataset.language); } catch (_) { /* storage unavailable */ }
      location.reload();
    });
  }
  window.fitnessI18n = { language, apply, translate, titleCase, original(node) { return originalText.get(node) ?? node.textContent; }, originalAttribute(element, attr) { return originalAttributes.get(element)?.[attr] ?? element.getAttribute(attr); } };
})();
