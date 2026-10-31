#!/usr/bin/env python3
"""Create an independent copy of Plan 1; customize it before publishing."""
import argparse
import json
import re
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('id', help='Stable ID, e.g. plan-2')
parser.add_argument('--name-zh', required=True)
parser.add_argument('--name-en', required=True)
args = parser.parse_args()
if not re.fullmatch(r'[a-z][a-z0-9-]*', args.id):
    parser.error('ID must contain lowercase letters, numbers and hyphens.')
root = Path(__file__).resolve().parents[1]
catalog_path = root / '_data/meal_plans.json'
catalog = json.loads(catalog_path.read_text())
plan_dir = root / 'plans' / args.id
data_dir = root / '_data/meal_plan_content' / args.id
include_dir = root / '_includes/meal-plans' / args.id
asset_dir = root / 'assets/meal-plans' / args.id
if any(p.exists() for p in [plan_dir, data_dir, include_dir, asset_dir]) or any(p['id'] == args.id for p in catalog['plans']):
    parser.error('This plan already exists; no files changed.')
for folder in [plan_dir, data_dir, include_dir, asset_dir]:
    folder.mkdir(parents=True)
(data_dir/'nutrition.json').write_text((root/'_data/meal_nutrition.json').read_text())
(data_dir/'metrics.yml').write_text((root/'_data/plan_metrics.yml').read_text())
def references(text):
    return text.replace('site.data.meal_nutrition', f"site.data.meal_plan_content['{args.id}'].nutrition").replace('site.data.plan_metrics', f"site.data.meal_plan_content['{args.id}'].metrics").replace('{% include diet-schedule.html %}', '{% include meal-plans/'+args.id+'/diet-schedule.html %}')
(include_dir/'diet-schedule.html').write_text(references((root/'_includes/diet-schedule.html').read_text()))
for script in ['meal-activities','cooking-flow','cooking-guide']:
    (asset_dir/(script+'.js')).write_text((root/'assets'/(script+'.js')).read_text())
paths = {'overview': f'/plans/{args.id}/', **{page: f'/plans/{args.id}/{page}/' for page in ['diet','stats','shopping','cooking']}}
for page, filename in [('overview','index.html'),('diet','diet.md'),('stats','stats.md'),('shopping','shopping.md'),('cooking','cooking.md')]:
    _, front, body = (root/filename).read_text().split('---',2)
    front = re.sub(r'(?m)^permalink:.*$', 'permalink: '+paths[page], front)
    if page == 'overview': front += 'overview: true\n'
    front += f'meal_activities_script: /assets/meal-plans/{args.id}/meal-activities.js\n'
    front += f'cooking_flow_script: /assets/meal-plans/{args.id}/cooking-flow.js\n'
    front += f'cooking_guide_script: /assets/meal-plans/{args.id}/cooking-guide.js\n'
    (plan_dir/filename).write_text('---'+front+'---'+references(body))
catalog['plans'].append({'id':args.id,'name':{'zh':args.name_zh,'en':args.name_en},'summary':{'zh':'','en':''},'pages':paths})
catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print(f'Created {plan_dir}; customize its menu, shopping, nutrition and cooking files before publishing.')
