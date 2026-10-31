---
layout: default
title: 饮食
description: 每周餐单与加餐
permalink: /diet/
diet: true
---
## 计划表



<noscript>
<p>周日午餐后做饭，准备上1–上7；周三晚餐后做饭，准备下1–下7；周六下午购物。</p>
<p>周日—周二早餐：{{ site.data.meal_nutrition.meals.fruit_breakfast.foodZh }}；加餐（23:00）：{{ site.data.meal_nutrition.meals.fruit_snack.foodZh }}。</p>
<p>周三—周六早餐：{{ site.data.meal_nutrition.meals.kiwi_breakfast.foodZh }}；加餐（23:00）：{{ site.data.meal_nutrition.meals.kiwi_snack.foodZh }}。</p>
<p>午晚餐饮料：前两餐（上1、上2）每餐 Fuze Tea 无糖冰茶 250 mL；其余12餐每餐 Fresca 1罐（355 mL）。</p>
</noscript>



<script type="application/json" id="diet-nutrition-data">{{ site.data.meal_nutrition.meals | jsonify }}</script>
{% include diet-schedule.html %}

## 放纵餐 {#cheat-meals}

<section class="diet-cheat-section" data-weekly-deficit="{{ site.data.plan_metrics.weekly_deficit }}">
  <p class="diet-cheat-note">按在原计划外加吃一次计算；营养数据为参考估算。</p>
  {% include cheat-meal-table.html %}
</section>
