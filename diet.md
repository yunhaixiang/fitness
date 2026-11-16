---
layout: default
title: 饮食
description: 每周餐单与餐外饮品
permalink: /diet/
diet: true
---
## 计划表



<noscript>
<p>周日午餐前做饭，准备上1–上7；周三晚餐前做饭，准备下1–下7；周六下午购买整周食材及1盒 Metro 水果盘；周三—周六早餐各2个奇异果。</p>
<p>周日—周二早餐：{{ site.data.meal_nutrition.meals.fruit_breakfast.foodZh }}。</p>
<p>周三—周六早餐：{{ site.data.meal_nutrition.meals.late_fruit_breakfast.foodZh }}。</p>
<p>餐外饮品：每天无糖豆奶270 g，不固定饮用时间。</p>
<p>午晚餐饮料：每周前两顿午晚餐（周日午餐、周日晚餐）每餐 Sparkling Ice 橙芒果味气泡水 251.5 mL；其余12餐每餐 Fresca 1罐（355 mL）。</p>
</noscript>



<script type="application/json" id="diet-nutrition-data">{{ site.data.meal_nutrition.meals | jsonify }}</script>
{% include diet-schedule.html %}

## 放纵餐 {#cheat-meals}

<section class="diet-cheat-section" data-weekly-deficit="{{ site.data.plan_metrics.weekly_deficit }}">
  <p class="diet-cheat-note">按在原计划外加吃一次计算；营养数据为参考估算。</p>
  {% include cheat-meal-table.html %}
</section>

<script type="application/json" id="cardio-energy-baseline">{{ site.data.plan_metrics | jsonify }}</script>
