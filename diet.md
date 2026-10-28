---
layout: default
title: 饮食安排
description: 每周餐单与加餐
permalink: /diet/
diet: true
---
## 计划表

<section class="diet-cheat-section" id="cheat-meals" data-weekly-deficit="{{ site.data.plan_metrics.weekly_deficit }}">
  <button type="button" class="diet-cheat-toggle" aria-expanded="false" aria-controls="cheat-meal-content">常见放纵餐</button>
  <div id="cheat-meal-content" hidden>
    <p class="diet-cheat-note">按在原计划外加吃一次计算；营养数据为参考估算。</p>
    {% include cheat-meal-table.html %}
  </div>
</section>



<noscript>
<p>周日—周二早餐：{{ site.data.meal_nutrition.meals.fruit_breakfast.foodZh }}；加餐（23:00）：{{ site.data.meal_nutrition.meals.fruit_snack.foodZh }}。</p>
<p>周三—周六早餐：{{ site.data.meal_nutrition.meals.kiwi_breakfast.foodZh }}；加餐（23:00）：{{ site.data.meal_nutrition.meals.kiwi_snack.foodZh }}。</p>
<p>午晚餐饮料：上1—下5每餐 Fresca 1罐（355 mL）；最后两餐（下6、下7）每餐 Fuze Tea 无糖冰茶 250 mL。</p>
</noscript>



<script type="application/json" id="diet-nutrition-data">{{ site.data.meal_nutrition.meals | jsonify }}</script>
{% include diet-schedule.html %}
