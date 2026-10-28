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
    finish: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

  const nodes = [
    { id: 'cold-first', label: ['前半周：冷冻留用', 'First Half: Freeze Later Portions'], note: ['冷冻后半周的肉和半盒排骨', 'Freeze meat and half the ribs for later'], group: 'cold', before: [], link: '#cold' },
    { id: 'cold-second', label: ['后半周：冷藏解冻', 'Second Half: Thaw in Fridge'], note: ['提前约36小时', 'About 36 hours ahead'], group: 'cold', before: [], link: '#cold' },
    { id: 'ready', label: ['当批食材就绪', 'Ingredients Ready'], note: ['按本次备餐选择一条路径', 'Choose the path for this batch'], group: 'cold', before: ['cold-first', 'cold-second'], either: true, link: '#cold' },
    { id: 'rice', label: ['白米饭', 'White Rice'], note: ['电饭煲 · 约50分钟', 'Rice cooker · about 50 min'], group: 'rice', before: [], link: '#rice' },
    { id: 'oven-heat', label: ['预热烤箱', 'Preheat Oven'], note: ['400°F · 15分钟', '400°F · 15 min'], group: 'oven', before: [], link: '#oven' },
    { id: 'chicken', label: ['鸡大腿肉', 'Chicken Thighs'], note: ['400°F · 27分钟', '400°F · 27 min'], group: 'oven', before: ['ready', 'oven-heat'], link: '#oven' },
    { id: 'potato', label: ['整颗烤土豆', 'Whole Roasted Potatoes'], note: ['400°F · 约30分钟', '400°F · about 30 min'], group: 'oven', before: ['oven-heat'], link: '#oven' },
    { id: 'ribs', label: ['BBQ排骨', 'BBQ Ribs'], note: ['400°F · 15–20分钟', '400°F · 15–20 min'], group: 'oven', before: ['ready', 'oven-heat'], link: '#oven' },
    { id: 'air-heat', label: ['预热空气炸锅', 'Preheat Air Fryer'], note: ['400°F · 4分钟', '400°F · 4 min'], group: 'air', before: [], link: '#air-fryer' },
    { id: 'salmon', label: ['三文鱼', 'Salmon'], note: ['400°F · 8分钟', '400°F · 8 min'], group: 'air', before: ['ready', 'air-heat'], link: '#air-fryer' },
    { id: 'egg-water', label: ['煮锅一：烧水', 'Pot 1: Boil Water'], note: ['', ''], group: 'pots', before: [], link: '#pot-one' },
    { id: 'eggs', label: ['水煮蛋', 'Boiled Eggs'], note: ['水开后约8分钟', 'About 8 min after boiling'], group: 'pots', before: ['egg-water'], link: '#pot-one' },
    { id: 'pasta-water', label: ['煮锅二：烧水', 'Pot 2: Boil Water'], note: ['', ''], group: 'pots', before: [], link: '#pot-two' },
    { id: 'pasta', label: ['意面', 'Pasta'], note: ['约8分钟', 'About 8 min'], group: 'pots', before: ['pasta-water'], link: '#pot-two' },
    { id: 'mushroom', label: ['蘑菇', 'Mushrooms'], note: ['小炒锅 · 约7分钟', 'Small Wok · about 7 min'], group: 'small-wok', before: [], link: '#small-wok' },
    { id: 'spinach', label: ['菠菜', 'Spinach'], note: ['小炒锅 · 约7分钟', 'Small Wok · about 7 min'], group: 'small-wok', before: ['mushroom'], link: '#small-wok' },
    { id: 'tomato', label: ['番茄意面', 'Tomato Pasta'], note: ['小炒锅 · 酱汁与意面', 'Small Wok · sauce and pasta'], group: 'small-wok', before: ['spinach', 'pasta'], link: '#small-wok' },
    { id: 'ground', label: ['鸡肉末与炒蛋', 'Ground Chicken and Eggs'], note: ['大炒锅 · 豌豆与胡萝卜', 'Large Wok · peas and carrots'], group: 'large-wok', before: ['ready'], link: '#large-wok' },
    { id: 'wrap', label: ['抹酱、装馅、卷饼', 'Sauce, Fill and Roll Wrap'], note: ['鸡腿肉、水煮蛋、蘑菇', 'Chicken, boiled eggs, mushrooms'], group: 'wrap', before: ['chicken', 'eggs', 'mushroom'], link: '#wraps' },
    { id: 'finish', label: ['分盘、入冰箱、清洗', 'Portion, Refrigerate and Clean'], note: ['所有餐食完成后', 'When every component is ready'], group: 'finish', before: ['rice', 'chicken', 'potato', 'ribs', 'salmon', 'mushroom', 'spinach', 'tomato', 'ground', 'wrap'], link: '#portions' }
  ];
  const groups = [
    { id: 'cold', icon: 'cold', title: ['冷冻／解冻', 'Freeze / Thaw'], hint: ['两种备餐情况，择一', 'Choose the path for this batch'] },
    { id: 'rice', icon: 'rice', title: ['电饭煲', 'Rice Cooker'], hint: ['可先启动', 'Start early'] },
    { id: 'oven', icon: 'oven', title: ['烤箱', 'Oven'], hint: ['预热后处理三种食材', 'Three foods after preheating'] },
    { id: 'air', icon: 'air', title: ['空气炸锅', 'Air Fryer'], hint: ['预热后烤三文鱼', 'Salmon after preheating'] },
    { id: 'pots', icon: 'pot', title: ['煮锅一、煮锅二', 'Saucepans 1 and 2'], hint: ['鸡蛋与意面并行', 'Eggs and pasta in parallel'] },
    { id: 'small-wok', icon: 'wok', title: ['小炒锅', 'Small Wok'], hint: ['蘑菇 → 菠菜 → 番茄意面', 'Mushrooms → spinach → tomato pasta'] },
    { id: 'large-wok', icon: 'wok', title: ['大炒锅', 'Large Wok'], hint: ['鸡肉末、蔬菜、炒蛋', 'Ground chicken, vegetables and eggs'] },
    { id: 'wrap', icon: 'wrap', title: ['卷饼', 'Wrap'], hint: ['等待鸡腿肉、鸡蛋和蘑菇', 'Wait for chicken, eggs and mushrooms'] },
    { id: 'finish', icon: 'finish', title: ['收尾', 'Finish'], hint: ['全部完成后分盘', 'Portion after everything is ready'] }
  ];

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
  for (const [index, text] of [t('备料', 'Prepare'), t('并行烹调', 'Cook in Parallel'), t('分盘收尾', 'Portion and Finish')].entries()) {
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
      const button = create('button', 'cooking-flow-step');
      button.type = 'button';
      button.dataset.node = node.id;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `${t(...group.title)}: ${t(...node.label)}`);
      button.append(create('span', 'cooking-flow-step-index', String(index + 1).padStart(2, '0')));
      const description = create('span', 'cooking-flow-step-copy');
      description.append(create('strong', '', t(...node.label)));
      if (t(...node.note)) description.append(create('small', '', t(...node.note)));
      button.append(description, create('span', 'cooking-flow-step-arrow', '↗'));
      button.addEventListener('click', () => select(node.id));
      buttons.set(node.id, button);
      return button;
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
      for (const [index, potNodes] of [[members[0], members[1]], [members[2], members[3]]].entries()) {
        const branch = create('div', 'cooking-flow-pot-branch');
        branch.append(create('span', 'cooking-flow-pot-label', t(`煮锅${index ? '二' : '一'}`, `Pot ${index + 1}`)));
        potNodes.forEach((node, stepIndex) => branch.append(step(node, stepIndex)));
        branches.append(branch);
      }
      list.append(branches);
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
})();
