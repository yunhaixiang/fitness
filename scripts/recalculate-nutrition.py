from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1]
def recalculate(root):
 source=json.loads((root/'_data/nutrition_basis.json').read_text());data=json.loads((root/'_data/meal_nutrition.json').read_text());meals=data['meals']
 fields=['kcal','protein','carbs','fat','saturatedFat','fibre','sugar','sodium','cholesterol','epaDha']
 for key,recipe in zip(source['mealKeys'],source['recipes']):
  for i,field in enumerate(fields):
   value=sum(source['arr'][food][i]*amount for food,amount in recipe.items())
   meals[key][field]=str(round(value)) if field in ['kcal','sodium','cholesterol'] else f'{value:.2f}' if field=='epaDha' else f'{value:.1f}'
 # Reset breakfast from its baseline before adding supplements and flaxseed.
 for key,base in source.get('breakfastBase',{}).items():
  supplement=source['breakfastSupplement']
  for field in fields:
   addition=source.get('breakfastAddition',{})
   value=base.get(field,0)+supplement.get(field,0)*supplement['dailySoftgels']+addition.get(field,0)*addition.get('dailyGrams',0)/addition.get('referenceGrams',1)
   meals[key][field]=str(round(value)) if field in ['kcal','sodium','cholesterol'] else f'{value:.2f}' if field=='epaDha' else f'{value:.1f}'
 micro=json.loads((root/'_data/micronutrient_basis.json').read_text())
 micro_recipes=dict(zip(source['mealKeys'],source['recipes'])) | micro['extraRecipes']
 for key,recipe in micro_recipes.items():
  for field in micro['fields']:
   value=sum(micro['foods'][food]['values'][field]*amount for food,amount in recipe.items())
   meals[key][field]=f'{value:.3f}'
 fields+=micro['fields']
 daily={f:(sum(float(meals[k].get(f,0))*2 for k in source['mealKeys'])+3*float(meals['fruit_breakfast'].get(f,0))+4*float(meals['kiwi_breakfast'].get(f,0))+7*float(meals['outside_drink'].get(f,0)))/7 for f in fields}
 daily['sodium']+=12*35/7
 (root/'_data/meal_nutrition.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 file=root/'_data/plan_metrics.yml';metrics=file.read_text();burn=float(re.search(r'weekly_burn: ([\d.]+)',metrics)[1]);deficit=burn-daily['kcal']*7
 updates={'weekly_deficit':str(round(deficit)),'weekly_deficit_display':f'"{round(deficit):,}"','weekly_deficit_precise':f'{deficit:.5f}','intake_daily':f'{daily["kcal"]:.5f}'}
 for key,value in updates.items():metrics=re.sub(r'^'+key+':.*$',key+': '+value,metrics,flags=re.M)
 file.write_text(metrics)
 file=root/'stats.md';page=file.read_text()
 values={'热量':f'{round(daily["kcal"]):,} kcal','蛋白质':f'{daily["protein"]:.1f} g','总脂肪':f'{daily["fat"]:.1f} g','饱和脂肪':f'{daily["saturatedFat"]:.1f} g','饱和脂肪占总热量':f'{daily["saturatedFat"]*900/daily["kcal"]:.1f}%','碳水化合物':f'{daily["carbs"]:.1f} g','膳食纤维':f'{daily["fibre"]:.1f} g','总糖':f'{daily["sugar"]:.1f} g','膳食胆固醇':f'{round(daily["cholesterol"])} mg','钠':f'{round(daily["sodium"]):,} mg','Omega-3：EPA，DHA（合计）':f'{daily["epaDha"]:.1f} g'}
 for label,field,unit,decimals in [('钙','calcium','mg',0),('铁','iron','mg',1),('钾','potassium','mg',0),('维生素D','vitaminD','µg',1),('维生素B12','vitaminB12','µg',1),('碘','iodine','µg',0)]:
  values[label]=f'{daily[field]:,.{decimals}f} {unit}'
 page=page.replace(' data-en="Pending Verification"','')
 addition=source.get('breakfastAddition',{})
 ala=addition.get('ala',0)*addition.get('dailyGrams',0)/addition.get('referenceGrams',1)
 values['Omega-3：ALA']=f'{1.1+ala:.1f}–{1.3+ala:.1f} g'
 for label,value in values.items():page=re.sub(r'(<td>'+re.escape(label)+r'</td>\s*<td[^>]*>).*?(</td>)',lambda m:m[1]+value+m[2],page,flags=re.S)
 page=re.sub(r'(<td>饱和脂肪</td>\s*<td[^>]*>.*?</td>\s*<td>)≤[\d.]+ g',lambda m:m[1]+f'≤{daily["kcal"]*.06/9:.1f} g',page,flags=re.S)
 page=re.sub(r'(data-energy="dailyDeficit">)[\d,]+',lambda m:m[1]+str(round(deficit/7)),page)
 page=re.sub(r'(data-energy="fatEquivalent">)[\d.]+',lambda m:m[1]+f'{deficit/7700:.2f}',page)
 page=re.sub(r'(<span>日均摄入</span><strong>)[\d,]+',lambda m:m[1]+f'{round(daily["kcal"]):,}',page)
 page=re.sub(r'--intake-share:[\d.]+%',f'--intake-share:{daily["kcal"]/(burn/7)*100:.1f}%',page)
 file.write_text(page)
 print(f'Daily: {daily["kcal"]:.1f} kcal, P{daily["protein"]:.1f}, C{daily["carbs"]:.1f}, F{daily["fat"]:.1f}; deficit {deficit/7:.1f}')
if __name__=='__main__':recalculate(R)
