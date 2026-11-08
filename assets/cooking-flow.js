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
    {"id": "cold-first", "label": ["前半周冷冻留用", "Freeze Later Portions"], "note": ["", ""], "group": "cold", "before": [], "link": "#cook-cold-first", "minutes": 1},
    {"id": "cold-second", "label": ["后半周冷藏解冻", "Thaw Later Portions"], "note": ["", ""], "group": "cold", "before": [], "link": "#cook-cold-second", "minutes": 1},
    {"id": "ready", "label": ["当批食材就绪", "Ingredients Ready"], "note": ["", ""], "group": "cold", "before": ["cold-first", "cold-second"], "link": "#cold", "either": true},
    {"id": "prep-rice", "label": ["备白米", "Prepare Rice"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-rice", "minutes": 3},
    {"id": "prep-chicken", "label": ["备鸡大腿肉", "Prepare Chicken Thighs"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-chicken", "minutes": 3},
    {"id": "prep-potato", "label": ["备土豆", "Prepare Potatoes"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-potato", "minutes": 3},
    {"id": "prep-ribs", "label": ["备排骨", "Prepare Ribs"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-ribs", "minutes": 3},
    {"id": "prep-meatballs", "label": ["备牛肉丸", "Prepare Meatballs"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-meatballs", "minutes": 3},
    {"id": "prep-shrimp", "label": ["备虾仁", "Prepare Shrimp"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-shrimp", "minutes": 3},
    {"id": "prep-salmon", "label": ["备三文鱼", "Prepare Salmon"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-salmon", "minutes": 3},
    {"id": "prep-eggs", "label": ["备鸡蛋", "Prepare Eggs"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-eggs", "minutes": 3},
    {"id": "prep-pasta", "label": ["备意面", "Prepare Spaghetti"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-pasta", "minutes": 3},
    {"id": "prep-dumplings", "label": ["备水饺", "Prepare Dumplings"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-dumplings", "minutes": 3},
    {"id": "prep-noodles", "label": ["备扁米粉", "Prepare Rice Noodles"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-noodles", "minutes": 15, "passive": true, "resource": "soak"},
    {"id": "prep-mushroom", "label": ["备蘑菇", "Prepare Mushrooms"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-mushroom", "minutes": 3},
    {"id": "prep-spinach", "label": ["备菠菜", "Prepare Spinach"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-spinach", "minutes": 3},
    {"id": "prep-tomato", "label": ["备番茄酱", "Prepare Tomato Sauce"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-tomato", "minutes": 3},
    {"id": "prep-meat", "label": ["备鸡肉末", "Prepare Ground Chicken"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-meat", "minutes": 3},
    {"id": "prep-zucchini", "label": ["备西葫芦", "Prepare Zucchini"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-zucchini", "minutes": 3},
    {"id": "prep-peas-carrots", "label": ["备豌豆、胡萝卜", "Prepare Peas and Carrots"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-peas-carrots", "minutes": 3},
    {"id": "prep-chickpeas", "label": ["备鹰嘴豆", "Prepare Chickpeas"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-chickpeas", "minutes": 3},
    {"id": "prep-pepper", "label": ["备红甜椒", "Prepare Red Pepper"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-pepper", "minutes": 3},
    {"id": "prep-roma", "label": ["备罗马番茄", "Prepare Roma Tomato"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-roma", "minutes": 3},
    {"id": "prep-bread", "label": ["备卷饼皮与面包", "Prepare Tortilla and Bread"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-bread", "minutes": 3},
    {"id": "prep-curry", "label": ["备咖喱块", "Prepare Curry Roux"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-curry", "minutes": 3},
    {"id": "prep-corn", "label": ["备玉米", "Prepare Corn"], "note": ["", ""], "group": "prep", "before": ["ready"], "link": "#cook-prep-corn", "minutes": 2},
    {"id": "rice", "label": ["白米饭", "White Rice"], "note": ["", ""], "group": "rice", "before": ["prep-rice"], "link": "#cook-rice", "minutes": 50},
    {"id": "oven-heat", "label": ["预热烤箱", "Preheat Oven"], "note": ["", ""], "group": "oven", "before": ["ready"], "link": "#cook-oven-heat", "minutes": 15},
    {"id": "chicken", "label": ["鸡大腿肉", "Chicken Thighs"], "note": ["", ""], "group": "oven", "before": ["oven-heat", "prep-chicken"], "link": "#cook-chicken", "minutes": 27},
    {"id": "potato", "label": ["土豆块", "Potato Wedges"], "note": ["", ""], "group": "oven", "before": ["oven-heat", "prep-potato"], "link": "#cook-potato", "minutes": 40},
    {"id": "ribs", "label": ["BBQ排骨", "BBQ Ribs"], "note": ["", ""], "group": "oven", "before": ["oven-heat", "prep-ribs"], "link": "#cook-ribs", "minutes": 20},
    {"id": "meatballs", "label": ["牛肉丸", "Beef Meatballs"], "note": ["", ""], "group": "oven", "before": ["oven-heat", "prep-meatballs"], "link": "#cook-meatballs", "minutes": 20},
    {"id": "shrimp", "label": ["面包糠烤虾", "Panko-Baked Shrimp"], "note": ["", ""], "group": "oven", "before": ["oven-heat", "prep-shrimp"], "link": "#cook-shrimp", "minutes": 12},
    {"id": "air-heat", "label": ["预热空气炸锅", "Preheat Air Fryer"], "note": ["", ""], "group": "air", "before": ["prep-salmon"], "link": "#cook-air-heat", "minutes": 4},
    {"id": "salmon", "label": ["三文鱼", "Salmon"], "note": ["", ""], "group": "air", "before": ["air-heat", "prep-salmon"], "link": "#cook-salmon", "minutes": 8},
    {"id": "egg-water", "label": ["烧水", "Boil Water"], "note": ["", ""], "group": "pots", "before": ["ready"], "link": "#cook-egg-water", "manual": true, "resource": "pot-1", "minutes": 1},
    {"id": "eggs", "label": ["水煮蛋", "Boiled Eggs"], "note": ["", ""], "group": "pots", "before": ["egg-water", "prep-eggs"], "link": "#cook-eggs", "resource": "pot-1", "minutes": 9},
    {"id": "dumpling-water", "label": ["换水烧开", "Boil Fresh Water"], "note": ["", ""], "group": "pots", "before": ["eggs"], "link": "#cook-dumpling-water", "manual": true, "resource": "pot-1", "minutes": 1},
    {"id": "dumplings", "label": ["水饺", "Boiled Dumplings"], "note": ["", ""], "group": "pots", "before": ["dumpling-water", "prep-dumplings"], "link": "#cook-dumplings", "resource": "pot-1", "minutes": 8},
    {"id": "pasta-water", "label": ["烧水", "Boil Water"], "note": ["", ""], "group": "pots", "before": ["ready"], "link": "#cook-pasta-water", "manual": true, "resource": "pot-2", "minutes": 1},
    {"id": "pasta", "label": ["意面", "Spaghetti"], "note": ["", ""], "group": "pots", "before": ["pasta-water", "prep-pasta"], "link": "#cook-pasta", "resource": "pot-2", "minutes": 8},
    {"id": "noodle-water", "label": ["换水烧开", "Boil Fresh Water"], "note": ["", ""], "group": "pots", "before": ["pasta"], "link": "#cook-noodle-water", "manual": true, "resource": "pot-2", "minutes": 1},
    {"id": "noodles", "label": ["扁米粉", "Rice Noodles"], "note": ["", ""], "group": "pots", "before": ["noodle-water", "prep-noodles"], "link": "#cook-noodles", "resource": "pot-2", "minutes": 1},
    {"id": "mushroom", "label": ["蘑菇", "Mushrooms"], "note": ["", ""], "group": "small-wok", "before": ["prep-mushroom"], "link": "#cook-mushroom", "minutes": 7},
    {"id": "peas", "label": ["豌豆、胡萝卜", "Peas and Carrots"], "note": ["", ""], "group": "small-wok", "before": ["mushroom", "prep-peas-carrots"], "link": "#cook-peas", "minutes": 3},
    {"id": "curry", "label": ["咖喱扁米粉", "Curry Rice Noodles"], "note": ["", ""], "group": "small-wok", "before": ["peas", "noodles", "prep-curry"], "link": "#cook-curry", "minutes": 6},
    {"id": "corn", "label": ["加热玉米", "Warm Corn"], "note": ["", ""], "group": "small-wok", "before": ["prep-corn", "curry"], "link": "#cook-corn", "minutes": 3},
    {"id": "spinach", "label": ["菠菜", "Spinach"], "note": ["", ""], "group": "large-wok", "before": ["prep-spinach"], "link": "#cook-spinach", "minutes": 5},
    {"id": "ground", "label": ["鸡肉末、西葫芦", "Ground Chicken and Zucchini"], "note": ["", ""], "group": "large-wok", "before": ["spinach", "prep-meat", "prep-zucchini"], "link": "#cook-ground", "minutes": 10},
    {"id": "tomato", "label": ["拌番茄意面", "Finish Tomato Spaghetti"], "note": ["", ""], "group": "large-wok", "before": ["ground", "pasta", "prep-tomato"], "link": "#cook-tomato", "minutes": 4},
    {"id": "fried-eggs", "label": ["煎蛋", "Fried Eggs"], "note": ["", ""], "group": "large-wok", "before": ["tomato", "prep-eggs"], "link": "#cook-fried-eggs", "minutes": 5},
    {"id": "wrap", "label": ["卷饼", "Wrap"], "note": ["", ""], "group": "wrap", "before": ["chicken", "eggs", "prep-chickpeas", "prep-pepper", "prep-bread"], "link": "#cook-wrap", "minutes": 4},
    {"id": "sandwich", "label": ["三明治", "Sandwich"], "note": ["", ""], "group": "wrap", "before": ["chicken", "fried-eggs", "prep-chickpeas", "prep-roma", "prep-bread"], "link": "#cook-sandwich", "minutes": 4},
    {"id": "finish", "label": ["分盘、入冰箱、清洗", "Portion, Refrigerate and Clean"], "note": ["", ""], "group": "finish", "before": ["rice", "potato", "ribs", "meatballs", "shrimp", "salmon", "dumplings", "curry", "tomato", "wrap", "sandwich", "mushroom", "spinach", "corn"], "link": "#portions", "minutes": 15}
  ];
  const groups = [
    {"id": "cold", "icon": "cold", "title": ["冷冻／解冻", "Freeze / Thaw"], "hint": ["择一", "Choose One Path"]},
    {"id": "prep", "icon": "prep", "title": ["备料与调味", "Ingredient Prep"], "hint": ["与预热、烧水并行", "During Preheating and Boiling"]},
    {"id": "rice", "icon": "rice", "title": ["电饭煲", "Rice Cooker"], "hint": ["先启动", "Start Early"]},
    {"id": "oven", "icon": "oven", "title": ["烤箱", "Oven"], "hint": ["按烤盘空间安排", "Schedule According to Tray Space"]},
    {"id": "air", "icon": "air", "title": ["空气炸锅", "Air Fryer"], "hint": ["三文鱼备好再预热", "Prepare Salmon Before Preheating"]},
    {"id": "pots", "icon": "pot", "title": ["煮锅一、煮锅二", "Pots 1 and 2"], "hint": ["两锅并行", "Two Parallel Pots"]},
    {"id": "small-wok", "icon": "pot", "title": ["小锅", "Saucepan"], "hint": ["蘑菇 → 蔬菜 → 咖喱", "Mushrooms → Vegetables → Curry"]},
    {"id": "large-wok", "icon": "wok", "title": ["大锅", "Wok"], "hint": ["菠菜 → 鸡肉意面 → 煎蛋", "Spinach → Chicken Pasta → Fried Eggs"]},
    {"id": "wrap", "icon": "wrap", "title": ["卷饼与三明治", "Wrap and Sandwich"], "hint": ["等待熟肉和鸡蛋", "Wait for Cooked Chicken and Eggs"]},
    {"id": "finish", "icon": "finish", "title": ["收尾", "Finish"], "hint": ["分盘、入冰箱、清洗", "Portion, Refrigerate and Clean"]}
  ];

  window.fitnessCookingFlow = { nodes, groups };

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const next = new Map(nodes.map((node) => [node.id, nodes.filter((other) => other.before.includes(node.id)).map((other) => other.id)]));
  const create = (tag, className, content) => {
    const element = document.createElement(tag);
    element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  };
  root.replaceChildren();
  const intro = create('p', 'cooking-flow-intro', t('点选步骤，查看前置任务与后续任务。', 'Select a step to see what comes before and after it.'));
  const phases = create('div', 'cooking-flow-phases');
  for (const [index, text] of [t('启动加热与备料', 'Start Heating and Prep'), t('并行烹调', 'Cook in Parallel'), t('分盘收尾', 'Portion and Finish')].entries()) {
    phases.append(create('span', `cooking-flow-phase cooking-flow-phase-${index + 1}`, text));
  }
  const detail = create('section', 'cooking-flow-detail');
  detail.setAttribute('aria-live', 'polite');
  const cards = create('div', 'cooking-flow-grid');
  root.append(intro, phases, detail, cards);
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
    const members = nodes.filter((node) => node.group === group.id);
    const step = (node, index) => {
      const row = create('div', 'cooking-flow-step-row');
      const button = create('button', 'cooking-flow-step');
      button.type = 'button';
      button.dataset.node = node.id;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `${t(...group.title)}: ${t(...node.label)}`);
      button.append(create('span', 'cooking-flow-step-index', String(index + 1).padStart(2, '0')));
      const description = create('span', 'cooking-flow-step-copy');
      description.append(create('strong', '', t(...node.label)));
      if (t(...node.note)) description.append(create('small', '', t(...node.note)));
      button.append(description);
      button.addEventListener('click', () => select(node.id));
      const jump = create('a', 'cooking-flow-step-jump', '↘');
      jump.href = node.link;
      jump.setAttribute('aria-label', t(`跳到${node.label[0]}的详细步骤`, `Jump to ${node.label[1]} details`));
      jump.addEventListener('click', () => select(node.id));
      row.append(button, jump);
      buttons.set(node.id, button);
      return row;
    };
    const list = create('div', 'cooking-flow-steps');
    if (group.id === 'cold') {
      const choices = create('div', 'cooking-flow-branches cooking-flow-branches-two');
      choices.append(step(members[0], 0), step(members[1], 1));
      list.append(choices, create('span', 'cooking-flow-branch-label', t('任选一条路径 ↓', 'Choose either path ↓')), step(members[2], 2));
    } else if (group.id === 'oven') {
      const choices = create('div', 'cooking-flow-branches cooking-flow-branches-three');
      members.slice(1).forEach((node, index) => choices.append(step(node, index + 1)));
      list.append(step(members[0], 0), create('span', 'cooking-flow-branch-label', t('预热后可安排 ↓', 'After preheating ↓')), choices);
    } else if (group.id === 'pots') {
      const branches = create('div', 'cooking-flow-branches cooking-flow-branches-two');
      for (const [index, potNodes] of [members.filter(node => node.resource === "pot-1"), members.filter(node => node.resource === "pot-2")].entries()) {
        const branch = create('div', 'cooking-flow-pot-branch');
        branch.append(create('span', 'cooking-flow-pot-label', t(`煮锅${index ? '二' : '一'}`, `Pot ${index + 1}`)));
        potNodes.forEach((node, stepIndex) => branch.append(step(node, stepIndex)));
        branches.append(branch);
      }
      list.append(branches);
    } else if (group.id === 'prep') {
      const choices = create('div', 'cooking-flow-branches cooking-flow-branches-two');
      members.forEach((node, index) => choices.append(step(node, index)));
      list.append(choices);
    } else {
      members.forEach((node, index) => list.append(step(node, index)));
    }
    card.append(head, list);
    cards.append(card);
    cardElements.set(group.id, card);
  }

  const chipList = (ids, either) => {
    const list = create('div', 'cooking-flow-chip-list');
    if (!ids.length) {
      list.append(create('span', 'cooking-flow-empty', t('可直接开始', 'Can start immediately')));
      return list;
    }
    ids.forEach((id, index) => {
      if (either && index) list.append(create('span', 'cooking-flow-join', t('或', 'or')));
      const target = byId.get(id);
      const chip = create('button', 'cooking-flow-chip', t(...target.label));
      chip.type = 'button';
      chip.addEventListener('click', () => select(id));
      list.append(chip);
    });
    return list;
  };
  const select = (id) => {
    const node = byId.get(id);
    for (const [otherId, button] of buttons) {
      button.setAttribute('aria-pressed', String(otherId === id));
      button.classList.toggle('is-before', node.before.includes(otherId));
      button.classList.toggle('is-after', next.get(id).includes(otherId));
    }
    for (const [groupId, card] of cardElements) {
      card.classList.toggle('has-selection', groupId === node.group);
      card.classList.toggle('has-link', groupId !== node.group && nodes.some((part) => part.group === groupId && (node.before.includes(part.id) || next.get(id).includes(part.id))));
    }
    detail.replaceChildren();
    const top = create('div', 'cooking-flow-detail-top');
    top.append(create('strong', '', t(...node.label)));
    const link = create('a', '', t('查看详细步骤 ↗', 'View Full Steps ↗'));
    link.href = node.link;
    top.append(link);
    detail.append(top);
    const relations = create('div', 'cooking-flow-relations');
    for (const [heading, items, either] of [
      [t('先完成', 'Before'), node.before, node.either],
      [t('接下来', 'Next'), next.get(id), false]
    ]) {
      const column = create('div', 'cooking-flow-relation');
      column.append(create('span', 'cooking-flow-relation-label', heading), chipList(items, either));
      relations.append(column);
    }
    detail.append(relations);
  };
  detail.append(create('p', 'cooking-flow-prompt', t('选择任一步骤，查看它与其他厨具的衔接。', 'Choose a step to see how it connects to the other appliances.')));

  const instructionSections = [["cold", "cold", ["cold-first", "cold-second"]], ["prep", "prep", ["prep-rice", "prep-chicken", "prep-potato", "prep-ribs", "prep-meatballs", "prep-shrimp", "prep-salmon", "prep-eggs", "prep-pasta", "prep-dumplings", "prep-noodles", "prep-mushroom", "prep-spinach", "prep-tomato", "prep-meat", "prep-zucchini", "prep-peas-carrots", "prep-chickpeas", "prep-pepper", "prep-roma", "prep-bread", "prep-curry", "prep-corn"]], ["rice", "rice", ["rice"]], ["oven", "oven", ["oven-heat", "chicken", "potato", "ribs", "meatballs", "shrimp"]], ["air-fryer", "air", ["air-heat", "salmon"]], ["pot-one", "pots", ["egg-water", "eggs", "dumpling-water", "dumplings"]], ["pot-two", "pots", ["pasta-water", "pasta", "noodle-water", "noodles"]], ["small-wok", "small-wok", ["mushroom", "peas", "curry", "corn"]], ["large-wok", "large-wok", ["spinach", "ground", "tomato", "fried-eggs"]], ["wraps", "wrap", ["wrap", "sandwich"]]];
  for (const [headingId, group, steps] of instructionSections) {
    const heading = document.getElementById(headingId);
    let source = heading?.nextElementSibling;
    while (source && source.tagName !== 'OL' && !/^H[1-3]$/.test(source.tagName)) source = source.nextElementSibling;
    if (!source || source.tagName !== 'OL' || source.children.length !== steps.length) continue;
    const grid = create('div', 'cooking-detail-grid');
    const iconName = group === 'pots' || group === 'small-wok' ? 'pot' : group.endsWith('wok') ? 'wok' : group;
    for (const [index, entry] of steps.entries()) {
      const node = typeof entry === 'string' ? byId.get(entry) : entry;
      const card = create('article', `cooking-detail-card cooking-flow-card-${group}`);
      card.id = `cook-${node.id}`;
      card.tabIndex = -1;
      const head = create('div', 'cooking-detail-head');
      const icon = create('span', 'cooking-flow-icon');
      icon.innerHTML = svg(iconName);
      const title = create('div', 'cooking-detail-title');
      title.append(create('span', 'cooking-detail-index', String(index + 1).padStart(2, '0')));
      title.append(create(heading.tagName === 'H3' ? 'h4' : 'h3', '', t(...node.label)));
      head.append(icon, title);
      const instruction = source.children[index].textContent.trim().replace(/^[^：:]{1,24}[：:]\s*/, '');
      card.append(head, create('p', 'cooking-detail-copy', instruction));
      grid.append(card);
    }
    source.hidden = true;
    source.after(grid);
  }

  const page = root.closest('.prose');
  if (page) {
    const sectionGroups = {
      dependencies: 'finish', portions: 'finish', cold: 'cold', prep: 'prep', rice: 'rice',
      oven: 'oven', 'air-fryer': 'air', 'pot-one': 'pots', 'pot-two': 'pots',
      'small-wok': 'small-wok', 'large-wok': 'large-wok', wraps: 'wrap'
    };
    let section = null;
    for (const child of [...page.children]) {
      if (child.tagName === 'H2') {
        section = create('section', `cooking-section-card cooking-flow-card-${sectionGroups[child.id] || 'finish'}`);
        section.setAttribute('aria-labelledby', child.id);
        page.insertBefore(section, child);
      }
      if (section) section.append(child);
    }
    page.classList.add('cooking-page-enhanced');
  }
})();
