---
layout: default
title: 饮食安排
description: 每周餐单、睡前水果加餐与放纵餐参考
permalink: /diet/
diet: true
---
<nav class="page-links" aria-label="饮食相关页面"><a href="{{ '/shopping/' | relative_url }}">购物清单 →</a><a href="{{ '/cooking/' | relative_url }}">做饭流程 →</a></nav>
## 计划表



<div class="diet-fruit-split">
<p class="diet-breakfast-note">早餐：高纤维谷物早餐40 g + 无糖豆奶约270 g + 一水肌酸 5g + 水果（周日—周二混合水果盘约144 g；周三—周六奇异果1个）。</p>
<p class="diet-snack-note">睡前水果加餐（23:00）：周日—周二混合水果盘约289 g；周三—周六奇异果2个。</p>
</div>



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

滚动备餐：周日午餐饭后做上1–上7；周三晚餐饭后做下1–下7。周二中午记得拿出冻肉到冷藏解冻。

## 放纵餐

### 常见放纵餐


<div class="table-wrap">
<table class="plan-table" data-diet-view="treats">
<thead>
<tr>
<th>食物</th>
<th>份量</th>
<th style="text-align: right;">热量（kcal）</th>
<th style="text-align: right;">占参考赤字3,983 kcal（额外加吃）</th>
<th style="text-align: right;">剩余每周赤字（kcal，额外加吃）</th>
<th style="text-align: right;">剩余日均赤字（kcal）</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://www.bbqchickenca.com/">酱蒜无骨炸鸡（bb.q Chicken Soy Garlic Chicken）</a></td>
<td>1整份，1.2 lb</td>
<td style="text-align: right;">1,156，菜单标注</td>
<td style="text-align: right;">约29%</td>
<td style="text-align: right;">2,827.12</td>
<td style="text-align: right;">403.87</td>
</tr>
<tr>
<td><a href="https://6ixtywings.com/menu_items/chicken-caesar-wrap/">凯撒鸡肉卷（6IXTY WINGS Chicken Caesar Wrap）</a></td>
<td>1个＋默认普通薯条</td>
<td style="text-align: right;">估1,100–1,500</td>
<td style="text-align: right;">约28–38%</td>
<td style="text-align: right;">2,483.12–2,883.12</td>
<td style="text-align: right;">354.73–411.87</td>
</tr>
<tr>
<td><a href="https://order.online/store/burger-burger-25113744">炸鸡汉堡（Burger Burger Johnny Cash Chicken）</a></td>
<td>1个</td>
<td style="text-align: right;">估750–1,050</td>
<td style="text-align: right;">约19–26%</td>
<td style="text-align: right;">2,933.12–3,233.12</td>
<td style="text-align: right;">419.02–461.87</td>
</tr>
<tr>
<td><a href="https://www.ubereats.com/ca/store/ozen-sushi/yCgRS0Q7S_Wlx8Flww4rWQ">炸鸡排套餐（Ozen Sushi Chicken Katsu Combo）</a></td>
<td>1整套，含米饭、饺子、yam配菜、汤及沙拉</td>
<td style="text-align: right;">估1,100–1,600</td>
<td style="text-align: right;">约28–40%</td>
<td style="text-align: right;">2,383.12–2,883.12</td>
<td style="text-align: right;">340.45–411.87</td>
</tr>
<tr>
<td><a href="https://osmows.com/nutrition-calculator">脆鸡沙威玛卷（Osmow’s Crispy Chicken Shawarma Wrap）</a></td>
<td>1个Regular，含蒜酱及OzPotle酱</td>
<td style="text-align: right;">估750–1,050</td>
<td style="text-align: right;">约19–26%</td>
<td style="text-align: right;">2,933.12–3,233.12</td>
<td style="text-align: right;">419.02–461.87</td>
</tr>
<tr>
<td>新奥尔良烤翅（Mr. Panda BBQ Sweet Roasted Chicken Wings）</td>
<td>1整份，1 lb带骨</td>
<td style="text-align: right;">估650–950</td>
<td style="text-align: right;">约16–24%</td>
<td style="text-align: right;">3,033.12–3,333.12</td>
<td style="text-align: right;">433.30–476.16</td>
</tr>
<tr>
<td><a href="https://www.pizzapizza.ca/about-us/nutrition/large-pizza/">Pepperoni 披萨（Pizza Pizza，大号）</a></td>
<td>3片</td>
<td style="text-align: right;">约750</td>
<td style="text-align: right;">约19%</td>
<td style="text-align: right;">3,233.12</td>
<td style="text-align: right;">461.87</td>
</tr>
<tr>
<td><a href="https://www.dairyqueen.com/en-ca/nutrition/food-treats/">奥利奥暴风雪冰淇淋（DQ OREO Cookie Blizzard）</a></td>
<td>1杯Small</td>
<td style="text-align: right;">约670</td>
<td style="text-align: right;">约17%</td>
<td style="text-align: right;">3,313.12</td>
<td style="text-align: right;">473.30</td>
</tr>
<tr>
<td><a href="https://www.pandaexpress.com/nutritioninformation">炒饭（Panda Express Fried Rice，美版参考）</a></td>
<td>1份约312 g</td>
<td style="text-align: right;">约620</td>
<td style="text-align: right;">约16%</td>
<td style="text-align: right;">3,363.12</td>
<td style="text-align: right;">480.45</td>
</tr>
<tr>
<td><a href="https://www.pizzapizza.ca/about-us/nutrition/poutine/">肉汁奶酪薯条（Pizza Pizza Classic Poutine）</a></td>
<td>1份</td>
<td style="text-align: right;">约600</td>
<td style="text-align: right;">约15%</td>
<td style="text-align: right;">3,383.12</td>
<td style="text-align: right;">483.30</td>
</tr>
<tr>
<td><a href="https://rippedrestaurants.com/ca/chains/mcdonalds/big-mac">巨无霸汉堡（加拿大 McDonald’s）</a></td>
<td>1个，不含薯条和饮料</td>
<td style="text-align: right;">约570</td>
<td style="text-align: right;">约14%</td>
<td style="text-align: right;">3,413.12</td>
<td style="text-align: right;">487.59</td>
</tr>
<tr>
<td><a href="https://assets.ctfassets.net/a2mgcrjjefyo/3AUi2N7aacNo4rjQ1jE3di/4de20ade3ee68d86901ad9d97230accf/KFC_Website_Nutritional_Information__W4_2024_.pdf">炸鸡汉堡（KFC Famous Chicken Sandwich）</a></td>
<td>1个，不含薯条和饮料</td>
<td style="text-align: right;">约540</td>
<td style="text-align: right;">约14%</td>
<td style="text-align: right;">3,443.12</td>
<td style="text-align: right;">491.87</td>
</tr>
<tr>
<td><a href="https://www.dairyqueen.com/en-ca/nutrition/food-treats/">巧克力奶昔（DQ Chocolate Shake）</a></td>
<td>1杯Small</td>
<td style="text-align: right;">约530</td>
<td style="text-align: right;">约13%</td>
<td style="text-align: right;">3,453.12</td>
<td style="text-align: right;">493.30</td>
</tr>
<tr>
<td><a href="https://www.pandaexpress.com/nutritioninformation">陈皮鸡（Panda Express Orange Chicken，美版参考）</a></td>
<td>1份约168 g，不含米饭</td>
<td style="text-align: right;">约510</td>
<td style="text-align: right;">约13%</td>
<td style="text-align: right;">3,473.12</td>
<td style="text-align: right;">496.16</td>
</tr>
<tr>
<td><a href="https://www.pizzapizza.ca/about-us/nutrition/desserts/">迷你布朗尼（Pizza Pizza Two-Bite Brownies）</a></td>
<td>6个</td>
<td style="text-align: right;">约480</td>
<td style="text-align: right;">约12%</td>
<td style="text-align: right;">3,503.12</td>
<td style="text-align: right;">500.45</td>
</tr>
<tr>
<td><a href="https://assets.ctfassets.net/a2mgcrjjefyo/3AUi2N7aacNo4rjQ1jE3di/4de20ade3ee68d86901ad9d97230accf/KFC_Website_Nutritional_Information__W4_2024_.pdf">炸鸡（KFC Original Recipe）</a></td>
<td>2块鸡大腿，不含配餐和蘸酱</td>
<td style="text-align: right;">约440</td>
<td style="text-align: right;">约11%</td>
<td style="text-align: right;">3,543.12</td>
<td style="text-align: right;">506.16</td>
</tr>
<tr>
<td><a href="https://www.tastyrewards.com/en-ca/brands/lays/products/wavy-laysr-original-potato-chips">原味波浪薯片（Wavy Lay’s）</a></td>
<td>75 g</td>
<td style="text-align: right;">约420</td>
<td style="text-align: right;">约11%</td>
<td style="text-align: right;">3,563.12</td>
<td style="text-align: right;">509.02</td>
</tr>
<tr>
<td><a href="https://fr.starbucks.ca/menu/product/424/iced">焦糖星冰乐（Starbucks Caramel Frappuccino）</a></td>
<td>1杯Grande，473 mL，标准配方</td>
<td style="text-align: right;">约380</td>
<td style="text-align: right;">约10%</td>
<td style="text-align: right;">3,603.12</td>
<td style="text-align: right;">514.73</td>
</tr>
<tr>
<td><a href="https://www.dairyqueen.com/en-ca/nutrition/food-treats/">牧场酱脆鸡卷（DQ Ranch Crispy Chicken Wrap）</a></td>
<td>1个</td>
<td style="text-align: right;">约340</td>
<td style="text-align: right;">约9%</td>
<td style="text-align: right;">3,643.12</td>
<td style="text-align: right;">520.45</td>
</tr>
<tr>
<td><a href="https://www.dairyqueen.com/en-ca/nutrition/food-treats/">炸鸡柳（DQ Chicken Strips）</a></td>
<td>3条，不含蘸酱</td>
<td style="text-align: right;">约320</td>
<td style="text-align: right;">约8%</td>
<td style="text-align: right;">3,663.12</td>
<td style="text-align: right;">523.30</td>
</tr>
<tr>
<td><a href="https://www.dairyqueen.com/en-ca/nutrition/food-treats/">薯条（DQ Fries）</a></td>
<td>1份Regular，不含蘸酱</td>
<td style="text-align: right;">约280</td>
<td style="text-align: right;">约7%</td>
<td style="text-align: right;">3,703.12</td>
<td style="text-align: right;">529.02</td>
</tr>
<tr>
<td><a href="https://www.dairyqueen.com/en-ca/nutrition/food-treats/">炸洋葱圈（DQ Onion Rings）</a></td>
<td>1份Regular，不含蘸酱</td>
<td style="text-align: right;">约260</td>
<td style="text-align: right;">约7%</td>
<td style="text-align: right;">3,723.12</td>
<td style="text-align: right;">531.87</td>
</tr>
<tr>
<td><a href="https://www.dairyqueen.com/en-ca/nutrition/food-treats/">香草冰淇淋（DQ Vanilla Cone）</a></td>
<td>1个Small甜筒，不加脆皮和配料</td>
<td style="text-align: right;">约230</td>
<td style="text-align: right;">约6%</td>
<td style="text-align: right;">3,753.12</td>
<td style="text-align: right;">536.16</td>
</tr>
<tr>
<td><a href="https://www.coca-cola.com/ca/en/brands/sprite/products">普通雪碧</a></td>
<td>1瓶500 mL</td>
<td style="text-align: right;">约200</td>
<td style="text-align: right;">约5%</td>
<td style="text-align: right;">3,783.12</td>
<td style="text-align: right;">540.45</td>
</tr>
<tr>
<td><a href="https://www.repertoirealimentsquebecois.gouv.qc.ca/Produit/Index/8203394">普通可口可乐</a></td>
<td>1罐355 mL</td>
<td style="text-align: right;">约140</td>
<td style="text-align: right;">约4%</td>
<td style="text-align: right;">3,843.12</td>
<td style="text-align: right;">549.02</td>
</tr>
</tbody>
</table>
</div>

### 零卡或低卡放纵餐替代品

以下为可选替代，不计入固定饮食；若额外加吃，仍扣减相应热量赤字。

<div class="table-wrap">
<table class="plan-table" data-diet-view="alternatives">
<thead>
<tr>
<th>想吃／喝</th>
<th>替代品</th>
<th>份量</th>
<th style="text-align: right;">热量（kcal）</th>
<th style="text-align: right;">占参考赤字3,983 kcal（额外加吃）</th>
</tr>
</thead>
<tbody>
<tr>
<td>含糖可乐</td>
<td><a href="https://www.walmart.ca/en/ip/Coca-Cola-Zero-Sugar-Zero-Caffeine-355mL-Can-12-Pack/6000202941547">Coca-Cola Zero Sugar Zero Caffeine</a></td>
<td>1罐355 mL</td>
<td style="text-align: right;">0</td>
<td style="text-align: right;">0%</td>
</tr>
<tr>
<td>汽水，不想要甜味</td>
<td><a href="https://www.walmart.ca/en/ip/Bubly-Lime-Sparkling-Water-355ml-cans-pack-of-12/6000197924484">bubly Lime Sparkling Water</a></td>
<td>1罐355 mL</td>
<td style="text-align: right;">0</td>
<td style="text-align: right;">0%</td>
</tr>
<tr>
<td>含糖冰茶</td>
<td><a href="https://www.walmart.ca/en/ip/Nestea-Zero-Sugar-Iced-Tea-473mL/2QW2HXHP2Z41">Nestea Zero Sugar Iced Tea</a></td>
<td>1瓶473 mL</td>
<td style="text-align: right;">约10</td>
<td style="text-align: right;">约0.3%</td>
</tr>
<tr>
<td>果冻、甜点</td>
<td><a href="https://www.walmart.ca/en/ip/Jell-O-Strawberry-Jelly-Powder-Light-Gelatin-Mix/6000188760145">Jell-O Zero Sugar Strawberry Jelly Powder Mix</a></td>
<td>加水制成125 mL</td>
<td style="text-align: right;">约10</td>
<td style="text-align: right;">约0.3%</td>
</tr>
<tr>
<td>巧克力甜点</td>
<td><a href="https://www.walmart.ca/en/ip/seort/10287782">Snack Pack No Sugar Added Chocolate Pudding Cups</a></td>
<td>1杯99 g</td>
<td style="text-align: right;">约60</td>
<td style="text-align: right;">约1.5%</td>
</tr>
<tr>
<td>香草奶味甜点</td>
<td><a href="https://www.walmart.ca/en/ip/snack-pack-no-sugar-added-vanilla-pudding-cups/10287875">Snack Pack No Sugar Added Vanilla Pudding Cups</a></td>
<td>1杯99 g</td>
<td style="text-align: right;">约60</td>
<td style="text-align: right;">约1.5%</td>
</tr>
<tr>
<td>冰淇淋、雪糕</td>
<td><a href="https://www.walmart.ca/en/ip/DEL-MONTE-Strawberry-Frozen-Fruit-Bars-10-x-50-ml/6000202764024">DEL MONTE Strawberry Frozen Fruit Bars</a></td>
<td>1支50 mL</td>
<td style="text-align: right;">约50</td>
<td style="text-align: right;">约1.3%</td>
</tr>
<tr>
<td>巧克力雪糕</td>
<td><a href="https://www.walmart.ca/en/ip/Popsicle-Fudgsicle-Frozen-Dairy-Dessert-Bars-12-x-60-ml/6000195509106">Popsicle Fudgsicle Frozen Dairy Dessert Bars</a></td>
<td>1支60 mL</td>
<td style="text-align: right;">约80</td>
<td style="text-align: right;">约2.0%</td>
</tr>
<tr>
<td>奶味冰淇淋</td>
<td><a href="https://www.walmart.ca/en/ip/Halo-Top-Vanilla-Bean-Frozen-Dessert/6000199406471">Halo Top Vanilla Bean Frozen Dessert</a></td>
<td>125 mL</td>
<td style="text-align: right;">约80</td>
<td style="text-align: right;">约2.0%</td>
</tr>
<tr>
<td>饼干、脆口零食</td>
<td><a href="https://www.walmart.ca/en/ip/quaker-crispy-minis-rice-cakes-original/10284949">Quaker Crispy Minis Original Large Brown Rice Cakes</a></td>
<td>2片，不加抹酱</td>
<td style="text-align: right;">约70</td>
<td style="text-align: right;">约1.8%</td>
</tr>
<tr>
<td>薯片、咸脆零食</td>
<td><a href="https://www.walmart.ca/en/ip/Orville-Redenbacher-Smart-Pop-Mircowave-Popcorn-8-Mini-Bags/206256">Orville Redenbacher Smart Pop! Microwave Popcorn Mini Bags</a></td>
<td>1迷你袋31 g</td>
<td style="text-align: right;">约110</td>
<td style="text-align: right;">约2.8%</td>
</tr>
</tbody>
</table>
</div>
