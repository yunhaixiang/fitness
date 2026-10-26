---
layout: default
title: 饮食安排
description: 每周餐单与加餐
permalink: /diet/
diet: true
---
## 计划表



<noscript>
<p>周日—周二早餐：{{ site.data.meal_nutrition.meals.fruit_breakfast.foodZh }}；加餐（23:00）：{{ site.data.meal_nutrition.meals.fruit_snack.foodZh }}。</p>
<p>周三—周六早餐：{{ site.data.meal_nutrition.meals.kiwi_breakfast.foodZh }}；加餐（23:00）：{{ site.data.meal_nutrition.meals.kiwi_snack.foodZh }}。</p>
</noscript>



<script type="application/json" id="diet-nutrition-data">{{ site.data.meal_nutrition.meals | jsonify }}</script>
{% include diet-schedule.html %}
