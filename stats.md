---
layout: default
title: 营养
description: 每日营养与消耗构成
permalink: /stats/
visual: true
---


## 每日营养

<figure class="nutrition-overview" aria-label="每日能量与每周赤字">
  <div class="nutrition-overview-main">
    <div class="nutrition-ring" style="--intake-share:74.9%" aria-label="日均摄入占消耗75%，赤字25%">
      <div class="nutrition-ring-center">
        <span>日均赤字</span>
        <strong data-energy="dailyDeficit">579 <small>kcal／天</small></strong>
      </div>
    </div>
    <div class="nutrition-overview-key">
      <p class="nutrition-overview-eyebrow">能量概览 · 不含放纵餐</p>
      <div class="nutrition-key-row nutrition-key-intake"><span>日均摄入</span><strong>1,729 <small>kcal／天</small></strong></div>
      <div class="nutrition-key-row nutrition-key-burn"><span>日均消耗</span><strong data-energy="dailyBurn">2,308 <small>kcal／天</small></strong></div>
      <div class="nutrition-key-row nutrition-key-deficit"><span>日均赤字</span><strong data-energy="dailyDeficit">579 <small>kcal／天</small></strong></div>
      <div class="nutrition-key-row"><span>每周赤字</span><strong data-energy="weeklyDeficit">{{ site.data.plan_metrics.weekly_deficit_display }} <small>kcal</small></strong></div>
      <div class="nutrition-key-row"><span>每周赤字等价脂肪</span><strong data-energy="fatEquivalent">0.53 <small>kg／周</small></strong></div>
    </div>
  </div>
</figure>



## 消耗构成（估算）

<div class="table-wrap">
<table class="plan-table">
<thead>
<tr>
<th>类型</th>
<th style="text-align: right;">每周 kcal</th>
<th style="text-align: right;">日均 kcal</th>
</tr>
</thead>
<tbody>
<tr>
<td>基础代谢</td>
<td style="text-align: right;">12,092.50</td>
<td style="text-align: right;">1,727.50</td>
</tr>
<tr>
<td>日常活动等（久坐系数加成）</td>
<td style="text-align: right;">2,418.50</td>
<td style="text-align: right;">345.50</td>
</tr>
<tr>
<td>力量训练（净增加）</td>
<td style="text-align: right;">450.96</td>
<td style="text-align: right;">64.42</td>
</tr>
<tr data-energy-row="cardio">
<td>有氧：HIIT、游泳、跑步机或健身馆自行车，4次／周（净增加）</td>
<td style="text-align: right;">720.00</td>
<td style="text-align: right;">102.86</td>
</tr>
<tr>
<td>步行（估计每周12 km，净增加）</td>
<td style="text-align: right;">474.00</td>
<td style="text-align: right;">67.71</td>
</tr>
<tr data-energy-row="total">
<td>合计</td>
<td style="text-align: right;">16,155.96</td>
<td style="text-align: right;">2,307.99</td>
</tr>
</tbody>
</table>
</div>

运动按扣除同期基础消耗后的净增加量计入，避免重复计算；日常加成不代表单独测得的食物热效应。

## 营养明细

<div class="table-wrap">
<table class="plan-table">
<thead>
<tr>
<th>营养指标</th>
<th style="text-align: right;">平均每天</th>
<th>建议每日范围或目标</th>
</tr>
</thead>
<tbody>
<tr>
<td>热量</td>
<td style="text-align: right;">1,729 kcal</td>
<td>1,800–2,000 kcal</td>
</tr>
<tr>
<td>蛋白质</td>
<td style="text-align: right;">133.8 g</td>
<td>130–165 g</td>
</tr>
<tr>
<td>总脂肪</td>
<td style="text-align: right;">61.6 g</td>
<td>45–65 g</td>
</tr>
<tr>
<td>饱和脂肪</td>
<td style="text-align: right;">14.4 g</td>
<td>≤11.5 g</td>
</tr>
<tr>
<td>饱和脂肪占总热量</td>
<td style="text-align: right;">7.5%</td>
<td>≤6%</td>
</tr>
<tr>
<td>碳水化合物</td>
<td style="text-align: right;">177.1 g</td>
<td>180–240 g</td>
</tr>
<tr>
<td>膳食纤维</td>
<td style="text-align: right;">36.7 g</td>
<td>30–38 g</td>
</tr>
<tr>
<td>总糖</td>
<td style="text-align: right;">36.9 g</td>
<td>无单独上限；重点控制添加糖</td>
</tr>
<tr>
<td>添加糖</td>
<td style="text-align: right;">4–9 g</td>
<td>≤25 g</td>
</tr>
<tr>
<td>膳食胆固醇</td>
<td style="text-align: right;">674 mg</td>
<td>尽量少；优先控制饱和脂肪</td>
</tr>
<tr>
<td>钠</td>
<td style="text-align: right;">1,934 mg</td>
<td>≤2,300 mg</td>
</tr>
<tr>
<td>钙</td>
<td style="text-align: right;">1,120 mg</td>
<td>1,000 mg</td>
</tr>
<tr>
<td>铁</td>
<td style="text-align: right;">17.5 mg</td>
<td>8 mg</td>
</tr>
<tr>
<td>钾</td>
<td style="text-align: right;">4,532 mg</td>
<td>≥3,400 mg</td>
</tr>
<tr>
<td>维生素D</td>
<td style="text-align: right;">15 µg</td>
<td>15 µg</td>
</tr>
<tr>
<td>维生素B12</td>
<td style="text-align: right;">5.5 µg</td>
<td>2.4 µg</td>
</tr>
<tr>
<td>碘</td>
<td style="text-align: right;">218–233 µg</td>
<td>150 µg</td>
</tr>
<tr>
<td>Omega-3：ALA</td>
<td style="text-align: right;">1.4–1.6 g</td>
<td>1.6 g</td>
</tr>
<tr>
<td>Omega-3：EPA，DHA（合计）</td>
<td style="text-align: right;">1.2 g</td>
<td>250 mg</td>
</tr>
</tbody>
</table>
</div>

<!-- Chicken thigh weight correction: 635 → 930 g/week, 8 pieces.
Existing nutrient basis retained by scaling the isolated thigh-only pasta delta
from commit 36acfeb (830 → 635 g/week); rounded historical values are estimates.
Weekly added energy: 350.97 kcal. Other food quantities and expenditure unchanged. -->

<!-- Spinach: 454 → 568 g/week; four portions of 142 g. Raw-spinach reference per 100 g: 23 kcal, protein 2.86 g, fat 0.39 g, saturated fat 0.063 g, carbs 3.63 g, fibre 2.2 g, sugar 0.42 g, sodium 79 mg, calcium 99 mg, iron 2.71 mg, potassium 558 mg. Weekly energy increase 26.22 kcal. -->

<!-- Fruit quantities: tray 1,300 → 1,000 g/week; green kiwis 12 → 8/week. Existing fruit-only values retained from 6dc9773. Fruit tray split 1/3 breakfast, 2/3 snack over three days; kiwi one at breakfast and one at snack over four days. Weekly energy decrease 283.58 kcal. -->

<!-- 2026-11-02: Four pasta meals replace 160 g raw coho salmon each with
125 g High Liner Pan-Sear Selects Traditional Haddock (one 500 g / 4-fillet box).
Label per 126 g: 200 kcal, P17/C17/F7/sat0.5 g, cholesterol50/sodium270/Ca20/Fe0.75 mg;
https://www.highliner.com/products/undefined/pan-sear-selects-traditional-haddock
Coho reference per 100 g: 160 kcal, P21.27/F7.67/sat1.816 g, cholesterol51/sodium47/Ca12/Fe0.34/K450 mg.
Salmon seasonings halved; remove per replaced meal 1/8 tsp olive oil (0.5625 g,
4.9725 kcal, 0.078 g saturated fat) and 1/32 tsp salt (73.75 mg sodium).
Trace spice changes below reference precision are not included.
Unlabelled haddock micronutrients estimated using 90 g fish per fillet:
K257 mg, B12 1.65 mcg, D0.45 mcg, iodine204 mcg, EPA+DHA0.15 g.
These are ingredient-proxy estimates, not product measurements. Iodine is particularly variable.
Coho D proxy 9 mcg/100 g, B12 2.67 mcg/100 g, iodine14 mcg/100 g,
EPA+DHA1.206 g/100 g. ALA addition roughly0.54 g/fillet inferred from the
0.7 g total omega-3 label minus estimated marine omega-3; not a direct ALA assay.
Daily values apply substitution deltas to existing rounded plan totals.
-->

<!-- 2026-11-02: Dry Primo Spaghetti 45 -> 50 g per pasta meal, four meals/week;
100 g per half-week batch, 200 g/week. Official label per 85 g: 300 kcal,
protein10/fat1/carbohydrate63/fibre3/sugar1 g, saturated fat0/sodium0/cholesterol0.
https://www.primofoods.com/primo/products.php?catid=23&id=40
Calcium2% and iron20% use legacy Canadian DVs 1100 mg and14 mg: 22/2.8 mg.
Weekly increase70.588 kcal; use previous unrounded energy intake1724.2515 kcal/day,
weekly deficit4166.2392 kcal. Previous total fat62.2343 g/day was inadvertently
rendered61.2 by an omega-3 text replacement; corrected before adding pasta's0.0336 g/day.
Unlabelled micronutrients retain previous estimates. -->

<!-- 2026-11-02 mushroom redistribution only: per half-week, 227 g crimini
with 1/4 tsp olive oil, 1/4 tsp pepper, 1/2 tsp garlic powder and 1/2 tsp onion
powder moves from three equal portions (wrap, potato, potato) to four equal
portions (pasta, potato, pasta, potato). Approximate full batch 70 kcal.
Nutrient deltas per meal: wrap -1/3 batch; each potato -1/12; each pasta +1/4.
Raw crimini reference per100 g:22 kcal,P2.5,F0.1,sat0.014,C4.3,fibre0.6,sugar1.72 g;
Na6,Ca18,Fe0.4,K448 mg. Generic spice/oil estimates included.
Weekly ingredient quantities, daily totals and energy deficit unchanged.
Displayed rounded meal values may differ slightly when summed. -->

<!-- 2026-11-02: All 12 weekly eggs are boiled; six per batch, two each in
meals1/2/5. Rice meals retain the same two eggs and protein contribution.
Remove 1/2 tsp olive oil per batch (the former egg-stage oil), 1 tsp/week:
4.5 g fat, 39.78 kcal, 0.621 g saturated fat weekly. Per rice meal:
-9.945 kcal, -1.125 g fat, -0.15525 g saturated fat.
Previous unrounded daily intake1734.3356 ->1728.6528 kcal;
weekly deficit4095.65097 ->4135.43097 kcal. Remaining wok oil1/2 tsp/batch.
-->

<script type="application/json" id="cardio-energy-baseline">{{ site.data.plan_metrics | jsonify }}</script>
