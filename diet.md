---
layout: default
title: 饮食安排
description: 每周餐单与睡前水果加餐
permalink: /diet/
diet: true
---
<nav class="page-links" aria-label="饮食相关页面"><a href="{{ '/treats/' | relative_url }}">放纵餐 →</a><a href="{{ '/shopping/' | relative_url }}">购物清单 →</a><a href="{{ '/cooking/' | relative_url }}">做饭流程 →</a></nav>
## 计划表



<noscript>
<p>周日—周二早餐：{{ site.data.meal_nutrition.meals.fruit_breakfast.foodZh }}；睡前加餐（23:00）：{{ site.data.meal_nutrition.meals.fruit_snack.foodZh }}。</p>
<p>周三—周六早餐：{{ site.data.meal_nutrition.meals.kiwi_breakfast.foodZh }}；睡前加餐（23:00）：{{ site.data.meal_nutrition.meals.kiwi_snack.foodZh }}。</p>
</noscript>



<script type="application/json" id="diet-nutrition-data">{{ site.data.meal_nutrition.meals | jsonify }}</script>
{% include diet-schedule.html %}
