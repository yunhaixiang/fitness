---
layout: default
title: 饮食
description: 每周餐单与餐外饮品
permalink: /plans/plan-2/diet/
diet: true
meal_activities_script: /assets/meal-plans/plan-2/meal-activities.js
---
## 计划表



<noscript>
<p>周日午餐后做饭，准备上1–上7；周三晚餐后做饭，准备下1–下7；周六下午购物。</p>
<p>周日—周二早餐：{{ site.data.meal_plan_content['plan-2'].nutrition.meals.fruit_breakfast.foodZh }}。</p>
<p>周三—周六早餐：{{ site.data.meal_plan_content['plan-2'].nutrition.meals.kiwi_breakfast.foodZh }}。</p>
<p>餐外饮品：{{ site.data.meal_plan_content['plan-2'].nutrition.meals.outside_drink.foodZh }}。</p>
<p data-en="Lunch and Dinner Drinks: Split One 503 mL Bottle of Sparkling Ice Orange Mango Between the First Two Meals (251.5 mL Each); Have One 355 mL Can of Fresca with Each of the Other 12 Meals.">午晚餐饮料：前两餐（上1、上2）均分1瓶503 mL的Sparkling Ice橙芒果味气泡水，每餐251.5 mL；其余12餐每餐Fresca 1罐（355 mL）。</p>
</noscript>



<script type="application/json" id="diet-nutrition-data">{{ site.data.meal_plan_content['plan-2'].nutrition.meals | jsonify }}</script>
{% include meal-plans/plan-2/diet-schedule.html %}

## 放纵餐 {#cheat-meals}

<section class="diet-cheat-section" data-weekly-deficit="{{ site.data.meal_plan_content['plan-2'].metrics.weekly_deficit }}">
  <p class="diet-cheat-note">按在原计划外加吃一次计算；营养数据为参考估算。</p>
  {% include cheat-meal-table.html %}
</section>

<script type="application/json" id="cardio-energy-baseline">{{ site.data.meal_plan_content['plan-2'].metrics | jsonify }}</script>
