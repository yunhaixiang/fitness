(() => {
  'use strict';

  const root = document.getElementById('cooking-flow');
  if (!root) return;
  const en = window.fitnessI18n?.language === 'en';
  const t = (zh, english) => en ? english : zh;
  const icons = {
    cold: '<path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9M9 5l3 3 3-3M9 19l3-3 3 3"/>',
    rice: '<rect x="4" y="7" width="16" height="14" rx="3"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M4 12h16M10 16h4"/>',
    oven: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M7 6h.01M11 6h.01M7 17h10v-5H7z"/>',
    air: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M7 8h10v8H7zM10 12h4M9 19h6"/>',
    pot: '<path d="M4 10h16v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2 10h20M8 7V5m4 2V3m4 4V5"/>',
    wok: '<path d="M3 10h18a9 9 0 0 1-18 0zM1 10h22M9 19l-1 2m7-2 1 2"/>',
    wrap: '<path d="M5 4h14l-2 15H7L5 4zM7 7l5 8 5-8M10 19v2h4v-2"/>',
    prep: '<path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/>',
    finish: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

  const nodes = [
    {"id": "oven-heat-start", "label": ["开始预热烤箱", "Start Preheating Oven"], "note": ["", ""], "group": "oven", "before": [], "link": "#cook-oven-heat-start", "minutes": 1, "instant": true},
    {"id": "prep-potato", "label": ["备土豆", "Prepare Potatoes"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-potato", "minutes": 3, "displayGroup": "oven"},
    {"id": "prep-chicken", "label": ["备鸡大腿肉", "Prepare Chicken Thighs"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-chicken", "minutes": 3, "displayGroup": "oven"},
    {"id": "prep-ribs", "label": ["备排骨", "Prepare Ribs"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-ribs", "minutes": 3, "displayGroup": "oven"},
    {"id": "prep-shrimp", "label": ["备虾仁", "Prepare Shrimp"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-shrimp", "minutes": 3, "displayGroup": "oven"},
    {"id": "oven-heat", "label": ["确认烤箱预热完成", "Confirm Oven Is Preheated"], "note": ["", ""], "group": "oven", "before": ["oven-heat-start"], "link": "#cook-oven-heat", "minutes": 15, "confirmation": true},
    {"id": "potato", "label": ["土豆块", "Potato Wedges"], "note": ["", ""], "group": "oven", "before": ["oven-heat", "prep-potato"], "link": "#cook-potato", "minutes": 40},
    {"id": "chicken", "label": ["鸡大腿肉", "Chicken Thighs"], "note": ["", ""], "group": "oven", "before": ["oven-heat", "prep-chicken"], "link": "#cook-chicken", "minutes": 27},
    {"id": "ribs", "label": ["BBQ排骨", "BBQ Ribs"], "note": ["", ""], "group": "oven", "before": ["oven-heat", "prep-ribs"], "link": "#cook-ribs", "minutes": 20},
    {"id": "meatballs", "label": ["牛肉丸", "Beef Meatballs"], "note": ["", ""], "group": "oven", "before": ["oven-heat"], "link": "#cook-meatballs", "minutes": 20},
    {"id": "shrimp", "label": ["面包糠烤虾", "Panko-Baked Shrimp"], "note": ["", ""], "group": "oven", "before": ["oven-heat", "prep-shrimp"], "link": "#cook-shrimp", "minutes": 12},
    {"id": "prep-rice", "label": ["备白米", "Prepare Rice"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-rice", "minutes": 3, "displayGroup": "rice"},
    {"id": "rice", "label": ["白米饭", "White Rice"], "note": ["", ""], "group": "rice", "before": ["prep-rice"], "link": "#cook-rice", "minutes": 50},
    {"id": "egg-water", "label": ["煮锅一烧水", "Boil Water in Pot 1"], "note": ["", ""], "group": "pots", "before": [], "link": "#cook-egg-water", "manual": true, "resource": "pot-1", "minutes": 1},
    {"id": "pasta-water", "label": ["煮锅二烧水", "Boil Water in Pot 2"], "note": ["", ""], "group": "pots", "before": [], "link": "#cook-pasta-water", "manual": true, "resource": "pot-2", "minutes": 1},
    {"id": "eggs", "label": ["煮蛋、捞出冷却", "Boil Eggs and Set Aside to Cool"], "note": ["", ""], "group": "pots", "before": ["egg-water"], "link": "#cook-eggs", "resource": "pot-1", "minutes": 9},
    {"id": "pasta", "label": ["意面", "Spaghetti"], "note": ["", ""], "group": "pots", "before": ["pasta-water"], "link": "#cook-pasta", "resource": "pot-2", "minutes": 8},
    {"id": "noodles", "label": ["扁米粉", "Rice Noodles"], "note": ["", ""], "group": "pots", "before": ["pasta-water"], "link": "#cook-noodles", "resource": "pot-2", "minutes": 6},
    {"id": "dumplings", "label": ["水饺", "Boiled Dumplings"], "note": ["", ""], "group": "pots", "before": ["eggs"], "link": "#cook-dumplings", "resource": "pot-1", "minutes": 8},
    {"id": "peel-eggs", "label": ["剥壳、分配鸡蛋", "Peel and Portion Eggs"], "note": ["", ""], "group": "prep", "before": ["eggs"], "link": "#cook-peel-eggs", "minutes": 5, "displayGroup": "pots"},
    {"id": "prep-salmon", "label": ["备三文鱼", "Prepare Salmon"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-salmon", "minutes": 3, "displayGroup": "air"},
    {"id": "air-heat-start", "label": ["开始预热空气炸锅", "Start Preheating Air Fryer"], "note": ["", ""], "group": "air", "before": [], "link": "#cook-air-heat-start", "minutes": 1, "instant": true},
    {"id": "air-heat", "label": ["确认空气炸锅预热完成", "Confirm Air Fryer Is Preheated"], "note": ["预热期间可继续其他任务", "Continue Other Tasks While Heating"], "group": "air", "before": ["air-heat-start"], "link": "#cook-air-heat", "minutes": 4, "confirmation": true},
    {"id": "salmon", "label": ["三文鱼", "Salmon"], "note": ["", ""], "group": "air", "before": ["air-heat", "prep-salmon"], "link": "#cook-salmon", "minutes": 8},
    {"id": "haddock", "label": ["裹粉黑线鳕", "Breaded Haddock"], "note": ["", ""], "group": "air", "before": ["air-heat"], "link": "#cook-haddock", "minutes": 20},
    {"id": "prep-zucchini", "label": ["备西葫芦", "Prepare Zucchini"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-zucchini", "minutes": 2, "displayGroup": "large-wok"},
    {"id": "spinach", "label": ["菠菜", "Spinach"], "note": ["", ""], "group": "large-wok", "before": [], "link": "#cook-spinach", "minutes": 5},
    {"id": "ground", "label": ["鸡肉末、西葫芦", "Ground Chicken and Zucchini"], "note": ["", ""], "group": "large-wok", "before": ["prep-zucchini"], "link": "#cook-ground", "minutes": 8},
    {"id": "tomato", "label": ["拌番茄意面", "Finish Tomato Spaghetti"], "note": ["", ""], "group": "large-wok", "before": ["ground", "pasta"], "link": "#cook-tomato", "minutes": 4},
    {"id": "prep-noodle-sauce", "label": ["备辣椒、罗勒和米粉酱汁", "Prepare Chili, Basil and Noodle Sauce"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-noodle-sauce", "minutes": 3, "displayGroup": "small-wok"},
    {"id": "mushroom", "label": ["蘑菇", "Mushrooms"], "note": ["", ""], "group": "small-wok", "before": [], "link": "#cook-mushroom", "minutes": 7},
    {"id": "curry", "label": ["咖喱酱", "Curry Sauce"], "note": ["", ""], "group": "small-wok", "before": [], "link": "#cook-curry", "minutes": 6},
    {"id": "season-noodles", "label": ["罗勒酱香米粉", "Basil Rice Noodles"], "note": ["", ""], "group": "small-wok", "before": ["noodles", "prep-noodle-sauce"], "link": "#cook-season-noodles", "minutes": 3},
    {"id": "prep-bread", "label": ["铺卷饼皮和面包", "Lay Out Tortilla and Bread"], "note": ["", ""], "group": "finish", "before": [], "link": "#cook-prep-bread", "minutes": 2},
    {"id": "prep-wrap", "label": ["备卷饼配料", "Prepare Wrap Fillings"], "note": ["", ""], "group": "prep", "before": ["prep-bread"], "link": "#cook-prep-wrap", "minutes": 3, "displayGroup": "finish"},
    {"id": "prep-sandwich", "label": ["备三明治配料", "Prepare Sandwich Fillings"], "note": ["", ""], "group": "prep", "before": ["prep-bread"], "link": "#cook-prep-sandwich", "minutes": 3, "displayGroup": "finish"},
    {"id": "peas-carrots", "label": ["豌豆胡萝卜", "Peas and Carrots"], "note": ["", ""], "group": "finish", "before": [], "link": "#cook-peas-carrots", "minutes": 3},
    {"id": "wrap", "label": ["卷饼", "Wrap"], "note": ["", ""], "group": "finish", "before": ["prep-wrap", "chicken", "peel-eggs"], "link": "#cook-wrap", "minutes": 1},
    {"id": "sandwich", "label": ["三明治", "Sandwich"], "note": ["", ""], "group": "finish", "before": ["prep-sandwich", "chicken", "peel-eggs"], "link": "#cook-sandwich", "minutes": 1},
    {"id": "refrigerate", "label": ["入冰箱", "Refrigerate"], "note": ["", ""], "group": "finish", "before": ["rice", "potato", "ribs", "meatballs", "shrimp", "salmon", "dumplings", "curry", "season-noodles", "tomato", "wrap", "sandwich", "mushroom", "spinach", "haddock", "peas-carrots"], "link": "#cook-refrigerate", "minutes": 5},
    {"id": "clean", "label": ["清洗", "Clean Up"], "note": ["", ""], "group": "finish", "before": ["refrigerate"], "link": "#cook-clean", "minutes": 7}
  ];
  const stepEmoji = {
    'prep-rice': '🍚', rice: '🍚',
    'oven-heat-start': '🔥', 'oven-heat': '🌡️',
    'prep-chicken': '🍗', chicken: '🍗',
    'prep-potato': '🥔', potato: '🥔',
    'prep-ribs': '🍖', ribs: '🍖', meatballs: '🧆',
    'prep-shrimp': '🦐', shrimp: '🦐',
    'prep-salmon': '🐟', salmon: '🐟', haddock: '🐟',
    'air-heat-start': '🔥', 'air-heat': '🌡️',
    'egg-water': '💧', 'pasta-water': '💧',
    eggs: '🥚', dumplings: '🥟', pasta: '🍝', noodles: '🍜',
    mushroom: '🍄', curry: '🍛', 'season-noodles': '🌿',
    spinach: '🥬', ground: '🍗', tomato: '🍅',
    'prep-zucchini': '🥒', 'prep-noodle-sauce': '🌶️🥣', 'prep-wrap': '🌯', 'prep-sandwich': '🥪', 'peel-eggs': '🥚', 'prep-bread': '🌯🍞', 'peas-carrots': '🫛🥕', wrap: '🌯', sandwich: '🥪', refrigerate: '🧊', clean: '🧼'
  };
  const groups = [
    {"id": "oven", "icon": "oven", "title": ["烤箱", "Oven"], "hint": ["按烤盘空间安排", "Schedule According to Tray Space"]},
    {"id": "rice", "icon": "rice", "title": ["电饭煲", "Rice Cooker"], "hint": ["先启动", "Start Early"]},
    {"id": "pots", "icon": "pot", "title": ["煮锅一、煮锅二", "Pots 1 and 2"], "hint": ["两锅并行", "Two Parallel Pots"]},
    {"id": "air", "icon": "air", "title": ["空气炸锅", "Air Fryer"], "hint": ["两种鱼先后可选", "Cook Either Fish First"]},
    {"id": "large-wok", "icon": "wok", "title": ["大锅", "Wok"], "hint": ["菠菜与鸡肉先后可选，换菜按需清理", "Cook Spinach or Chicken First; Clean Between Dishes as Needed"]},
    {"id": "small-wok", "icon": "pot", "title": ["小锅", "Saucepan"], "hint": ["锅空时任选，换菜按需清理", "Choose Any Ready Task; Clean Between Dishes as Needed"]},
    {"id": "finish", "icon": "finish", "title": ["收尾", "Finish"], "hint": ["备好配菜与餐点、入冰箱、清洗", "Assemble Meals, Refrigerate and Clean"]}
  ];

  const instructionSections = [["rice", "rice", ["prep-rice", "rice"]], ["oven", "oven", ["oven-heat-start", "prep-potato", "prep-chicken", "prep-ribs", "prep-shrimp", "oven-heat", "potato", "chicken", "ribs", "meatballs", "shrimp"]], ["air-fryer", "air", ["prep-salmon", "air-heat-start", "air-heat", "salmon", "haddock"]], ["pot-one", "pots", ["egg-water", "eggs", "dumplings", "peel-eggs"]], ["pot-two", "pots", ["pasta-water", "pasta", "noodles"]], ["small-wok", "small-wok", ["prep-noodle-sauce", "mushroom", "curry", "season-noodles"]], ["large-wok", "large-wok", ["prep-zucchini", "spinach", "ground", "tomato"]], ["finish", "finish", ["prep-bread", "prep-wrap", "prep-sandwich", "peas-carrots", "wrap", "sandwich", "refrigerate", "clean"]]];
  if (window.fitnessCookingDefinition) {
    nodes.splice(0, nodes.length, ...window.fitnessCookingDefinition.nodes);
    instructionSections.splice(0, instructionSections.length, ...window.fitnessCookingDefinition.instructionSections);
  }
  const instructions = new Map(), seasoningNotes = new Map();
  const mergedSections = [];
  for (const [headingId, group, steps] of instructionSections) {
    const heading = document.getElementById(headingId);
    const section = [];
    for (let child = heading?.nextElementSibling; child && !/^H[1-3]$/.test(child.tagName); child = child.nextElementSibling) section.push(child);
    const source = section.find(child => child.tagName === 'OL');
    if (!source || source.children.length !== steps.length) continue;
    steps.forEach((id, index) => {
      const task = source.children[index];
      const list = task.querySelector(en ? '.cooking-source-en' : '.cooking-source-zh');
      const parts = list ? [...list.children] : [...task.children];
      instructions.set(id, parts.map(part => part.textContent.trim()));
    });
    const note = section.find(child => child.tagName === 'P');
    if (note) seasoningNotes.set(group, note.textContent.trim());
    mergedSections.push([heading, ...section]);
  }

  window.fitnessCookingFlow = { nodes, groups };

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const next = new Map(nodes.map((node) => [node.id, nodes.filter((other) => other.before.includes(node.id)).map((other) => other.id)]));
  const create = (tag, className, content) => {
    const element = document.createElement(tag);
    element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  };
  // Highlight meaning without changing the source instructions or injecting HTML.
  const cookingNumber = String.raw`(?:\d+(?:\.\d+)?(?:[½¼¾⅛⅜⅝⅞])?|[½¼¾⅛⅜⅝⅞]|\d+/\d+)`;
  const cookingRange = `${cookingNumber}(?:[–—-]${cookingNumber})?`;
  const cookingIngredients = [
    '鸡大腿肉', '生鸡腿肉', '鸡腿肉', '鸡肉末', '生肉末', '小土豆', '土豆块', '排骨', '牛肉丸',
    '虾仁', '虾肉', '面包糠', '三文鱼', '裹粉黑线鳕', '金枪鱼', '水煮蛋', '鸡蛋', '水饺',
    '干意面', '意面', '干扁米粉', '米粉', '干米', '米饭', '蘑菇', '菠菜', '西葫芦',
    'Unico浓缩番茄膏', '罗马番茄', '番茄', '鹰嘴豆', '橙甜椒', '大号卷饼皮', '全麦面包', '豌豆胡萝卜',
    'Hellmann’s Light ½ Fat 蛋黄酱', 'Chipotle蛋黄酱', '橄榄油', '蒜粉', '洋葱粉', '黑胡椒', '红椒粉', '红辣椒', '辣椒',
    '意式香料', '牛至', '罗勒叶', '罗勒', '鱼露', '生抽', '老抽', '蚝油', '咖喱块', '咖喱酱', '热水', '面水', '沸水', '水'
  ].sort((a, b) => b.length - a.length).join('|');
  const cookingEnglishIngredients = String.raw`\b(?:chicken thighs?|raw thighs?|ground chicken|chicken|potatoes|potato wedges|ribs|meatballs|shrimp|panko|salmon|(?:breaded )?haddock(?: fillet)?|tuna|boiled eggs?|eggs?|dumplings|spaghetti|rice noodles|noodles|dry rice|rice|mushrooms|spinach|zucchini|Unico Tomato Paste|Roma tomato|tomato|chickpeas|orange bell pepper|tortillas?|whole-wheat bread|bread|peas and carrots|Hellmann’s Light ½ Fat mayonnaise|Chipotle mayonnaise|olive oil|garlic powder|onion powder|black pepper|pepper|paprika|red chili|chili|Italian seasoning|oregano|basil(?: leaves)?|fish sauce|light and dark soy sauces|light soy sauce|dark soy sauce|oyster sauce|Golden Curry|water)\b`;
  const cookingTokens = new RegExp([
    `(?<heat>${cookingRange}\\s*(?:°[FC]|分钟|minutes?\\b))`,
    `(?<portion>第[0-9、，]+盘|\\bmeals?\\s+\\d+(?:(?:,\\s*|\\s+and\\s+)\\d+)*)`,
    `(?<amount>${cookingRange}\\s*(?:茶匙|汤匙|mL\\b|kg\\b|g\\b|cm\\b|tsp\\b|tbsp\\b|个|块|颗|片|罐|袋|盒)|半(?:小块|袋|盒|罐)|half a (?:bag|pack|can)|quarter can)`,
    `(?<ingredient>${cookingIngredients}|${cookingEnglishIngredients})`
  ].join('|'), 'gi');
  const appendCookingText = (element, text) => {
    let cursor = 0;
    for (const match of text.matchAll(cookingTokens)) {
      element.append(document.createTextNode(text.slice(cursor, match.index)));
      const kind = Object.keys(match.groups).find(key => match.groups[key] !== undefined);
      element.append(create('span', `cooking-text-${kind}`, match[0]));
      cursor = match.index + match[0].length;
    }
    element.append(document.createTextNode(text.slice(cursor)));
    return element;
  };
  root.replaceChildren();
  const intro = create('p', 'cooking-flow-intro', t('推荐任务高亮显示；点选步骤可高亮关联任务。', 'Recommended tasks are highlighted. Select a step to highlight related tasks.'));
  const phases = create('div', 'cooking-flow-phases');
  for (const [index, text] of [t('启动加热与备料', 'Start Heating and Prep'), t('并行烹调', 'Cook in Parallel'), t('分盘收尾', 'Portion and Finish')].entries()) {
    phases.append(create('span', `cooking-flow-phase cooking-flow-phase-${index + 1}`, text));
  }
  const cards = create('div', 'cooking-flow-grid');
  root.append(intro, phases, cards);
  const buttons = new Map();
  const cardElements = new Map();

  for (const group of groups) {
    const card = create('article', `cooking-flow-card cooking-flow-card-${group.id}`);
    card.dataset.group = group.id;
    const head = create('div', 'cooking-flow-card-head');
    const icon = create('span', 'cooking-flow-icon');
    icon.innerHTML = svg(group.icon);
    const headings = create('div', 'cooking-flow-card-heading');
    headings.append(create('h3', '', t(...group.title)), create('p', '', t(...group.hint)));
    head.append(icon, headings);
    const members = nodes.filter((node) => (node.displayGroup || node.group) === group.id);
    const step = (node, index) => {
      const row = create('div', 'cooking-flow-step-row');
      row.id = `cook-${node.id}`;
      const button = create('button', 'cooking-flow-step');
      button.type = 'button';
      button.id = `cook-task-${node.id}`;
      row.setAttribute('role', 'group');
      row.setAttribute('aria-labelledby', button.id);
      button.dataset.node = node.id;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `${t(...group.title)}: ${t(...node.label)}`);
      button.append(create('span', 'cooking-flow-step-index', String(index + 1).padStart(2, '0')));
      const description = create('span', 'cooking-flow-step-copy');
      const title = create('strong', '');
      const emoji = create('span', 'cooking-step-emoji', stepEmoji[node.id]);
      emoji.setAttribute('aria-hidden', 'true');
      title.append(emoji, document.createTextNode(t(...node.label)));
      description.append(title);
      if (t(...node.note)) description.append(create('small', '', t(...node.note)));
      button.append(description);
      button.addEventListener('click', () => select(node.id));
      row.append(button);
      if (instructions.has(node.id)) {
        const body = create('div', 'cooking-flow-instructions');
        const parts = instructions.get(node.id);
        if (parts.length > 1) {
          const sequence = create('ol', 'cooking-instruction-list');
          parts.forEach(text => sequence.append(appendCookingText(create('li', ''), text)));
          body.append(sequence);
        } else {
          body.append(appendCookingText(create('p', ''), parts[0]));
        }
        row.append(body);
      }
      buttons.set(node.id, button);
      return row;
    };
    const list = create('div', 'cooking-flow-steps');
    members.forEach((node, index) => list.append(step(node, index)));
    card.append(head);
    if (seasoningNotes.has(group.id)) card.append(create('p', 'cooking-flow-seasoning-note', seasoningNotes.get(group.id)));
    card.append(list);
    cards.append(card);
    cardElements.set(group.id, card);
  }

  const select = (id) => {
    const node = byId.get(id);
    for (const [otherId, button] of buttons) {
      button.setAttribute('aria-pressed', String(otherId === id));
      button.classList.toggle('is-before', node.before.includes(otherId));
      button.classList.toggle('is-after', next.get(id).includes(otherId));
    }
    for (const [groupId, card] of cardElements) {
      card.classList.toggle('has-selection', groupId === (node.displayGroup || node.group));
      card.classList.toggle('has-link', groupId !== (node.displayGroup || node.group) && nodes.some((part) => (part.displayGroup || part.group) === groupId && (node.before.includes(part.id) || next.get(id).includes(part.id))));
    }

  };
  // Keep the source markup as the no-JavaScript fallback; remove only successfully merged sections.
  mergedSections.flat().forEach(element => element.remove());


  const page = root.closest('.prose');
  if (page) {
    const sectionGroups = {
      dependencies: 'finish', rice: 'rice',
      oven: 'oven', 'air-fryer': 'air', 'pot-one': 'pots', 'pot-two': 'pots',
      'small-wok': 'small-wok', 'large-wok': 'large-wok', finish: 'finish'
    };
    let section = null;
    for (const child of [...page.children]) {
      if (child.tagName === 'H2') {
        section = create('section', child.id === 'dependencies'
          ? 'cooking-section-overview'
          : `cooking-section-card cooking-flow-card-${sectionGroups[child.id] || 'finish'}`);
        section.setAttribute('aria-labelledby', child.id);
        page.insertBefore(section, child);
      }
      if (section) section.append(child);
    }
    page.classList.add('cooking-page-enhanced');
  }
  // Place cards in the shorter column while retaining task order in the DOM.
  let layoutFrame;
  function layoutCards() {
    const wide = window.matchMedia('(min-width: 981px)').matches;
    cards.classList.toggle('is-masonry', wide);
    if (!wide) {
      cards.style.removeProperty('height');
      for (const card of cardElements.values()) {
        card.style.removeProperty('top');
        card.style.removeProperty('left');
      }
      return;
    }
    const gap = 16, columnWidth = (cards.clientWidth - gap) / 2;
    const heights = [0, 0];
    for (const card of cardElements.values()) {
      const column = heights[0] <= heights[1] ? 0 : 1;
      card.style.top = `${heights[column]}px`;
      card.style.left = `${column * (columnWidth + gap)}px`;
      heights[column] += card.getBoundingClientRect().height + gap;
    }
    cards.style.height = `${Math.max(...heights) - gap}px`;
  }
  function queueLayout() {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(layoutCards);
  }
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(queueLayout);
    observer.observe(cards);
    for (const card of cardElements.values()) observer.observe(card);
    window.addEventListener('resize', queueLayout);
    layoutCards();
  }
})();
