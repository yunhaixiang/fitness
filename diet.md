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
<div class="table-wrap">
<table class="plan-table" data-diet-view="schedule">
<thead>
<tr>
<th>编号</th>
<th>星期</th>
<th>餐次</th>
<th>碳水</th>
<th>蛋白质</th>
<th>蔬菜</th>
<th style="text-align: right;">热量（kcal）</th>
</tr>
</thead>
<tbody>
<tr data-nutrition-key="wrap">
<td>上1</td>
<td>周日</td>
<td>晚餐</td>
<td>卷饼皮</td>
<td>鸡大腿肉2块＋水煮蛋2个</td>
<td>蘑菇</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.wrap.kcal }}</td>
</tr>
<tr data-nutrition-key="rice">
<td>上2</td>
<td>周一</td>
<td>午餐</td>
<td>白米饭</td>
<td>鸡肉末炒蛋2个</td>
<td>豌豆+胡萝卜</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.rice.kcal }}</td>
</tr>
<tr data-nutrition-key="pasta">
<td>上3</td>
<td>周一</td>
<td>晚餐</td>
<td>意面</td>
<td>鸡大腿肉1块＋三文鱼1块</td>
<td>番茄</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.pasta.kcal }}</td>
</tr>
<tr data-nutrition-key="potato">
<td>上4</td>
<td>周二</td>
<td>午餐</td>
<td>烤土豆</td>
<td>BBQ排骨1/4盒＋三文鱼1块</td>
<td>菠菜+蘑菇</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.potato.kcal }}</td>
</tr>
<tr data-nutrition-key="rice">
<td>上5</td>
<td>周二</td>
<td>晚餐</td>
<td>白米饭</td>
<td>鸡肉末炒蛋2个</td>
<td>豌豆+胡萝卜</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.rice.kcal }}</td>
</tr>
<tr data-nutrition-key="pasta">
<td>上6</td>
<td>周三</td>
<td>午餐</td>
<td>意面</td>
<td>鸡大腿肉1块＋三文鱼1块</td>
<td>番茄</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.pasta.kcal }}</td>
</tr>
<tr data-nutrition-key="potato">
<td>上7</td>
<td>周三</td>
<td>晚餐</td>
<td>烤土豆</td>
<td>BBQ排骨1/4盒＋三文鱼1块</td>
<td>菠菜+蘑菇</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.potato.kcal }}</td>
</tr>
<tr data-nutrition-key="wrap">
<td>下1</td>
<td>周四</td>
<td>午餐</td>
<td>卷饼皮</td>
<td>鸡大腿肉2块＋水煮蛋2个</td>
<td>蘑菇</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.wrap.kcal }}</td>
</tr>
<tr data-nutrition-key="rice">
<td>下2</td>
<td>周四</td>
<td>晚餐</td>
<td>白米饭</td>
<td>鸡肉末炒蛋2个</td>
<td>豌豆+胡萝卜</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.rice.kcal }}</td>
</tr>
<tr data-nutrition-key="pasta">
<td>下3</td>
<td>周五</td>
<td>午餐</td>
<td>意面</td>
<td>鸡大腿肉1块＋三文鱼1块</td>
<td>番茄</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.pasta.kcal }}</td>
</tr>
<tr data-nutrition-key="potato">
<td>下4</td>
<td>周五</td>
<td>晚餐</td>
<td>烤土豆</td>
<td>BBQ排骨1/4盒＋三文鱼1块</td>
<td>菠菜+蘑菇</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.potato.kcal }}</td>
</tr>
<tr data-nutrition-key="rice">
<td>下5</td>
<td>周六</td>
<td>午餐</td>
<td>白米饭</td>
<td>鸡肉末炒蛋2个</td>
<td>豌豆+胡萝卜</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.rice.kcal }}</td>
</tr>
<tr data-nutrition-key="pasta">
<td>下6</td>
<td>周六</td>
<td>晚餐</td>
<td>意面</td>
<td>鸡大腿肉1块＋三文鱼1块</td>
<td>番茄</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.pasta.kcal }}</td>
</tr>
<tr data-nutrition-key="potato">
<td>下7</td>
<td>周日</td>
<td>午餐</td>
<td>烤土豆</td>
<td>BBQ排骨1/4盒＋三文鱼1块</td>
<td>菠菜+蘑菇</td>
<td style="text-align: right;">{{ site.data.meal_nutrition.meals.potato.kcal }}</td>
</tr>
</tbody>
</table>
</div>
