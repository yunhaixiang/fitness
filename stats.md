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
    <div class="nutrition-ring" style="--intake-share:81.5%" aria-label="每日摄入与消耗">
      <div class="nutrition-ring-center">
        <span>日均赤字</span>
        <strong data-energy="dailyDeficit">— <small>kcal／天</small></strong>
      </div>
    </div>
    <div class="nutrition-overview-key">
      <p class="nutrition-overview-eyebrow">能量概览 · 不含放纵餐</p>
      <div class="nutrition-key-row nutrition-key-intake"><span>日均摄入</span><strong>1,843 <small>kcal／天</small></strong></div>
      <div class="nutrition-key-row nutrition-key-burn"><span>日均消耗</span><strong data-energy="dailyBurn">— <small>kcal／天</small></strong></div>
      <div class="nutrition-key-row nutrition-key-deficit"><span>日均赤字</span><strong data-energy="dailyDeficit">— <small>kcal／天</small></strong></div>
      <div class="nutrition-key-row"><span>每周赤字</span><strong data-energy="weeklyDeficit">— <small>kcal</small></strong></div>
      <div class="nutrition-key-row"><span>每周赤字等价脂肪</span><strong data-energy="fatEquivalent">— <small>kg／周</small></strong></div>
    </div>
  </div>
</figure>



<h2 id="half-week-meals" data-en="Seven-Meal Plan">半周七餐计划</h2>

{% include nutrition-meal-summary.html %}

<h2 id="calorie-intake" data-en="Calorie Intake Breakdown">摄入构成</h2>

<div data-intake-chart></div>

<h2 id="calories-burned" data-en="Calories Burned Breakdown">消耗构成</h2>

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
<tr data-energy-row="resting">
<td>基础代谢</td>
<td style="text-align: right;">—</td>
<td style="text-align: right;">—</td>
</tr>
<tr data-energy-row="activity">
<td>日常活动等（久坐系数加成）</td>
<td style="text-align: right;">—</td>
<td style="text-align: right;">—</td>
</tr>
<tr data-energy-row="strength">
<td>力量训练（净增加）</td>
<td style="text-align: right;">—</td>
<td style="text-align: right;">—</td>
</tr>
<tr data-energy-row="cardio">
<td>有氧：HIIT、游泳、跑步机或健身馆自行车，2次／周（净增加）</td>
<td style="text-align: right;">—</td>
<td style="text-align: right;">—</td>
</tr>
<tr data-energy-row="walking">
<td>步行（按同步步数）</td>
<td style="text-align: right;">—</td>
<td style="text-align: right;">—</td>
</tr>
<tr data-energy-row="total">
<td>合计</td>
<td style="text-align: right;">—</td>
<td style="text-align: right;">—</td>
</tr>
</tbody>
</table>
</div>


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
<td style="text-align: right;">1,843 kcal</td>
<td>1,800–2,000 kcal</td>
</tr>
<tr data-macro="protein">
<td>蛋白质</td>
<td style="text-align: right;">131.6 g</td>
<td>120–140 g</td>
</tr>
<tr data-macro="fat">
<td>总脂肪</td>
<td style="text-align: right;">66.1 g</td>
<td>45–65 g</td>
</tr>
<tr>
<td>饱和脂肪</td>
<td style="text-align: right;">14.4 g</td>
<td>≤12.3 g</td>
</tr>
<tr>
<td>饱和脂肪占总热量</td>
<td style="text-align: right;">7.0%</td>
<td>≤6%</td>
</tr>
<tr data-macro="carbs">
<td>碳水化合物</td>
<td style="text-align: right;">193.1 g</td>
<td>180–240 g</td>
</tr>
<tr>
<td>膳食纤维</td>
<td style="text-align: right;">36.3 g</td>
<td>30–38 g</td>
</tr>
<tr>
<td>总糖</td>
<td style="text-align: right;">49.6 g</td>
<td>无单独上限；重点控制添加糖</td>
</tr>
<tr>
<td>添加糖</td>
<td style="text-align: right;">4–9 g</td>
<td>≤25 g</td>
</tr>
<tr>
<td>膳食胆固醇</td>
<td style="text-align: right;">656 mg</td>
<td>尽量少；优先控制饱和脂肪</td>
</tr>
<tr>
<td>钠</td>
<td style="text-align: right;">2,167 mg</td>
<td>≤2,300 mg</td>
</tr>
<tr>
<td>钙</td>
<td>1,137 mg</td>
<td>1,000 mg</td>
</tr>
<tr>
<td>铁</td>
<td>19.1 mg</td>
<td>8 mg</td>
</tr>
<tr>
<td>钾</td>
<td>4,605 mg</td>
<td>≥3,400 mg</td>
</tr>
<tr>
<td>维生素D</td>
<td>39.0 µg</td>
<td>15 µg</td>
</tr>
<tr>
<td>维生素B12</td>
<td>8.3 µg</td>
<td>2.4 µg</td>
</tr>
<tr>
<td>碘</td>
<td>114 µg</td>
<td>150 µg</td>
</tr>
<tr>
<td>Omega-3：ALA</td>
<td style="text-align: right;">1.8–2.0 g</td>
<td>1.6 g</td>
</tr>
<tr>
<td>Omega-3：EPA，DHA（合计）</td>
<td style="text-align: right;">1.8 g</td>
<td>250 mg</td>
</tr>
</tbody>
</table>
</div>















<script type="application/json" id="cardio-energy-baseline">{{ site.data.plan_metrics | jsonify }}</script>

<!-- Revised meal estimates: _data/nutrition_basis.json. Daily totals include 3 early-week and 4 late-week fruit breakfasts and bedtime snacks, plus 2 of each main meal. Micronutrient point estimates use _data/micronutrient_basis.json (Canadian labels, CNF 2026, USDA iodine proxies and documented recipe assumptions); they are not measured product totals. Added sugar and ALA remain broad composition estimates. -->
