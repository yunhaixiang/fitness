---
layout: default
title: 营养
description: 每日营养与消耗构成
permalink: /plans/plan-2/stats/
visual: true
nutrition: true
---


## 每日营养

<figure class="nutrition-overview" aria-label="每日能量与每周赤字或盈余">
  <div class="nutrition-overview-main">
    <div class="nutrition-ring" style="--intake-share:79.6%" aria-label="每日摄入与消耗">
      <div class="nutrition-ring-center">
        <span data-energy-label="dailyDeficit">日均能量差</span>
        <strong data-energy="dailyDeficit">— <small>kcal／天</small></strong>
      </div>
    </div>
    <div class="nutrition-overview-key">
      <p class="nutrition-overview-eyebrow">能量概览 · 不含放纵餐</p>
      <div class="nutrition-key-row nutrition-key-intake"><span>日均摄入</span><strong>1,801 <small>kcal／天</small></strong></div>
      <div class="nutrition-key-row nutrition-key-burn"><span>日均消耗</span><strong data-energy="dailyBurn">— <small>kcal／天</small></strong></div>
      <div class="nutrition-key-row nutrition-key-deficit"><span data-energy-label="dailyDeficit">日均能量差</span><strong data-energy="dailyDeficit">— <small>kcal／天</small></strong></div>
      <div class="nutrition-key-row"><span data-energy-label="weeklyDeficit">每周能量差</span><strong data-energy="weeklyDeficit">— <small>kcal</small></strong></div>
      <div class="nutrition-key-row"><span data-energy-label="fatEquivalent">每周能量差等价脂肪</span><strong data-energy="fatEquivalent">— <small>kg／周</small></strong></div>
    </div>
  </div>
</figure>



<h2 id="half-week-meals" data-en="Meal Plan">饮食计划</h2>

{% assign summary_daily_meals = site.data.meal_plan_content['plan-2'].nutrition.meals %}
<div class="nutrition-routine-grid">
{% include nutrition-daily-meals.html meals=summary_daily_meals keys="fruit_breakfast,outside_drink" title="周日—周二" title_en="Sun–Tue" %}
{% include nutrition-daily-meals.html meals=summary_daily_meals keys="kiwi_breakfast,outside_drink" title="周三—周六" title_en="Wed–Sat" %}
</div>

{% include meal-plans/plan-2/nutrition-meal-summary.html %}

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
<tr data-nutrient="energy">
<td>热量</td>
<td style="text-align: right;">1,801 kcal</td>
<td>—</td>
</tr>
<tr data-macro="protein" data-nutrient="protein">
<td>蛋白质</td>
<td style="text-align: right;">134.9 g</td>
<td>—</td>
</tr>
<tr data-macro="fat" data-nutrient="fat">
<td>总脂肪</td>
<td style="text-align: right;">57.4 g</td>
<td>—</td>
</tr>
<tr data-nutrient="saturatedFat">
<td>饱和脂肪</td>
<td style="text-align: right;">15.4 g</td>
<td>—</td>
</tr>
<tr data-macro="carbs" data-nutrient="carbs">
<td>碳水化合物</td>
<td style="text-align: right;">199.7 g</td>
<td>—</td>
</tr>
<tr data-nutrient="fibre">
<td>膳食纤维</td>
<td style="text-align: right;">39.4 g</td>
<td>—</td>
</tr>
<tr data-nutrient="sugar">
<td>总糖</td>
<td style="text-align: right;">39.2 g</td>
<td>—</td>
</tr>
<tr data-nutrient="addedSugar">
<td>添加糖</td>
<td style="text-align: right;">4–9 g</td>
<td>—</td>
</tr>
<tr data-nutrient="cholesterol">
<td>膳食胆固醇</td>
<td style="text-align: right;">640 mg</td>
<td>—</td>
</tr>
<tr data-nutrient="sodium">
<td>钠</td>
<td style="text-align: right;">2,343 mg</td>
<td>—</td>
</tr>
<tr data-nutrient="calcium">
<td>钙</td>
<td style="text-align: right;">1,128 mg</td>
<td>—</td>
</tr>
<tr data-nutrient="iron">
<td>铁</td>
<td style="text-align: right;">19.0 mg</td>
<td>—</td>
</tr>
<tr data-nutrient="potassium">
<td>钾</td>
<td style="text-align: right;">4,571 mg</td>
<td>—</td>
</tr>
<tr data-nutrient="vitaminD">
<td>维生素D</td>
<td style="text-align: right;">15.3 µg</td>
<td>—</td>
</tr>
<tr data-nutrient="vitaminB12">
<td>维生素B12</td>
<td style="text-align: right;">5.6 µg</td>
<td>—</td>
</tr>
<tr data-nutrient="iodine">
<td>碘</td>
<td style="text-align: right;">107–122 µg</td>
<td>—</td>
</tr>
<tr data-nutrient="ala">
<td>Omega-3：ALA</td>
<td style="text-align: right;">1.1–1.3 g</td>
<td>—</td>
</tr>
<tr data-nutrient="epaDha">
<td>Omega-3：EPA，DHA（合计）</td>
<td style="text-align: right;">1.2 g</td>
<td>—</td>
</tr>
</tbody>
</table>
</div>















<script type="application/json" id="cardio-energy-baseline">{{ site.data.meal_plan_content['plan-2'].metrics | jsonify }}</script>
