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

  // Start all three fish together; remove the plain fish before finishing the breaded fillet.
  const nodes = [
    {"id": "oven-heat-start", "label": ["开始预热烤箱", "Start Preheating Oven"], "note": ["", ""], "group": "oven", "before": [], "link": "#cook-oven-heat-start", "minutes": 1, "instant": true},
    {"id": "prep-potato", "label": ["备土豆", "Prepare Potatoes"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-potato", "minutes": 3, "displayGroup": "oven"},
    {"id": "prep-chicken", "label": ["备鸡大腿肉", "Prepare Chicken Thighs"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-chicken", "minutes": 3, "displayGroup": "oven"},
    {"id": "prep-ribs", "label": ["备排骨", "Prepare Ribs"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-ribs", "minutes": 3, "displayGroup": "oven"},
    {"id": "prep-shrimp", "label": ["备虾仁", "Prepare Shrimp"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-shrimp", "minutes": 3, "displayGroup": "oven"},
    {"id": "oven-heat", "label": ["确认烤箱预热完成", "Confirm Oven Is Preheated"], "note": ["", ""], "group": "oven", "before": ["oven-heat-start"], "link": "#cook-oven-heat", "minutes": 15, "confirmation": true},
    {"id": "potato-start", "label": ["放入土豆", "Load Potatoes"], "note": ["放好并启动后勾选", "Check after loading and starting"], "group": "oven", "before": ["oven-heat", "prep-potato"], "link": "#cook-potato-start", "minutes": 1, "instant": true, "durationHint": 40},
    {"id": "potato-turn", "label": ["土豆中途翻面", "Turn Potatoes Halfway"], "note": ["烤约20分钟后翻面", "Turn after about 20 minutes"], "group": "oven", "before": ["potato-start"], "link": "#cook-potato-turn", "minutes": 1, "confirmation": true, "waitKind": "food", "waitFor": "potato-start"},
    {"id": "potato", "label": ["确认土豆熟透、取出", "Check and Remove Potatoes"], "note": ["按熟度确认；等待期间可做其他任务", "Confirm doneness; other tasks can be done while waiting"], "group": "oven", "before": ["potato-turn"], "link": "#cook-potato", "minutes": 40, "confirmation": true, "waitFor": "potato-start", "waitKind": "food"},
    {"id": "chicken-start", "label": ["放入鸡大腿肉", "Load Chicken Thighs"], "note": ["放好并启动后勾选", "Check after loading and starting"], "group": "oven", "before": ["oven-heat", "prep-chicken"], "link": "#cook-chicken-start", "minutes": 1, "instant": true, "durationHint": 27},
    {"id": "chicken", "label": ["确认鸡大腿肉熟透、取出", "Check and Remove Chicken Thighs"], "note": ["按熟度确认；等待期间可做其他任务", "Confirm doneness; other tasks can be done while waiting"], "group": "oven", "before": ["chicken-start"], "link": "#cook-chicken", "minutes": 27, "confirmation": true, "waitFor": "chicken-start", "waitKind": "food"},
    {"id": "ribs-start", "label": ["放入排骨", "Load Ribs"], "note": ["放好并启动后勾选", "Check after loading and starting"], "group": "oven", "before": ["oven-heat", "prep-ribs"], "link": "#cook-ribs-start", "minutes": 1, "instant": true, "durationHint": 20},
    {"id": "ribs", "label": ["确认排骨熟透、取出", "Check and Remove Ribs"], "note": ["按熟度确认；等待期间可做其他任务", "Confirm doneness; other tasks can be done while waiting"], "group": "oven", "before": ["ribs-start"], "link": "#cook-ribs", "minutes": 20, "confirmation": true, "waitFor": "ribs-start", "waitKind": "food"},
    {"id": "shrimp-start", "label": ["放入虾仁", "Load Shrimp"], "note": ["放好并启动后勾选", "Check after loading and starting"], "group": "oven", "before": ["oven-heat", "prep-shrimp"], "link": "#cook-shrimp-start", "minutes": 1, "instant": true, "durationHint": 12},
    {"id": "shrimp", "label": ["确认虾仁熟透、取出", "Check and Remove Shrimp"], "note": ["按熟度确认；等待期间可做其他任务", "Confirm doneness; other tasks can be done while waiting"], "group": "oven", "before": ["shrimp-start"], "link": "#cook-shrimp", "minutes": 12, "confirmation": true, "waitFor": "shrimp-start", "waitKind": "food"},
    {"id": "prep-rice", "label": ["备白米", "Prepare Rice"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-rice", "minutes": 3, "displayGroup": "rice"},
    {"id": "rice-start", "label": ["启动煮饭", "Start Rice Cooker"], "note": ["放好并启动后勾选", "Check after loading and starting"], "group": "rice", "before": ["prep-rice"], "link": "#cook-rice-start", "minutes": 1, "instant": true, "durationHint": 50},
    {"id": "rice", "label": ["确认米饭煮好、盛出", "Check and Serve Rice"], "note": ["按熟度确认；等待期间可做其他任务", "Confirm doneness; other tasks can be done while waiting"], "group": "rice", "before": ["rice-start"], "link": "#cook-rice", "minutes": 50, "confirmation": true, "waitFor": "rice-start", "waitKind": "food"},
    {"id": "egg-water-start", "label": ["煮锅一开始烧水", "Start Heating Water in Pot 1"], "note": ["开火后勾选；水开另行确认", "Check after turning on the heat; confirm boiling separately"], "group": "pots", "before": [], "link": "#cook-egg-water-start", "resource": "pot-1", "minutes": 1, "instant": true},
    {"id": "egg-water", "label": ["确认煮锅一水开", "Confirm Pot 1 Is Boiling"], "note": ["", ""], "group": "pots", "before": ["egg-water-start"], "link": "#cook-egg-water", "manual": true, "resource": "pot-1", "minutes": 1, "confirmation": true, "waitFor": "egg-water-start", "waitKind": "boil"},
    {"id": "pasta-water-start", "label": ["煮锅二开始烧水", "Start Heating Water in Pot 2"], "note": ["开火后勾选；水开另行确认", "Check after turning on the heat; confirm boiling separately"], "group": "pots", "before": [], "link": "#cook-pasta-water-start", "resource": "pot-2", "minutes": 1, "instant": true},
    {"id": "pasta-water", "label": ["确认煮锅二水开", "Confirm Pot 2 Is Boiling"], "note": ["", ""], "group": "pots", "before": ["pasta-water-start"], "link": "#cook-pasta-water", "manual": true, "resource": "pot-2", "minutes": 1, "confirmation": true, "waitFor": "pasta-water-start", "waitKind": "boil"},
    {"id": "eggs-start", "label": ["放入鸡蛋", "Load Eggs"], "note": ["放好并启动后勾选", "Check after loading and starting"], "group": "pots", "before": ["egg-water"], "link": "#cook-eggs-start", "resource": "pot-1", "minutes": 1, "instant": true, "durationHint": 8, "holdsResource": "pot-1", "releasesAt": "eggs"},
    {"id": "eggs", "label": ["确认鸡蛋熟透、取出", "Check and Remove Eggs"], "note": ["8分钟后检查，蛋白蛋黄凝固后取出", "Check at 8 minutes; remove once whites and yolks are set"], "group": "pots", "before": ["eggs-start"], "link": "#cook-eggs", "resource": "pot-1", "minutes": 8, "confirmation": true, "waitFor": "eggs-start", "waitKind": "food"},
    {"id": "dumpling-water-start", "label": ["捞蛋后开始回烧原锅水", "Reheat Pot 1 After Removing Eggs"], "note": ["开始加热后勾选；不必等鸡蛋剥壳", "Check after starting heat; peeling can wait"], "group": "pots", "before": ["eggs"], "link": "#cook-dumpling-water-start", "resource": "pot-1", "minutes": 1, "instant": true},
    {"id": "dumpling-water", "label": ["确认原锅水再次沸腾", "Confirm Pot 1 Has Returned to a Boil"], "note": ["水滚后再下饺子", "Add dumplings only once boiling"], "group": "pots", "before": ["dumpling-water-start"], "link": "#cook-dumpling-water", "resource": "pot-1", "minutes": 1, "manual": true, "confirmation": true, "waitFor": "dumpling-water-start", "waitKind": "boil"},
    {"id": "pasta-start", "label": ["放入全部意面", "Load All Spaghetti"], "note": ["两份意面同锅煮", "Cook both portions in one pot"], "group": "pots", "before": ["pasta-water"], "link": "#cook-pasta-start", "resource": "pot-2", "minutes": 1, "instant": true, "durationHint": 8, "holdsResource": "pot-2", "releasesAt": "pasta"},
    {"id": "pasta", "label": ["确认意面熟透、捞出", "Check and Drain Spaghetti"], "note": ["按熟度确认；等待期间可做其他任务", "Confirm doneness; other tasks can be done while waiting"], "group": "pots", "before": ["pasta-start"], "link": "#cook-pasta", "resource": "pot-2", "minutes": 8, "confirmation": true, "waitFor": "pasta-start", "waitKind": "food"},
    {"id": "dumplings-start", "label": ["放入水饺", "Load Dumplings"], "note": ["放好并启动后勾选", "Check after loading and starting"], "group": "pots", "before": ["dumpling-water"], "link": "#cook-dumplings-start", "resource": "pot-1", "minutes": 1, "instant": true, "durationHint": 8, "holdsResource": "pot-1", "releasesAt": "dumplings"},
    {"id": "dumplings", "label": ["确认水饺熟透、取出", "Check and Remove Dumplings"], "note": ["按熟度确认；等待期间可做其他任务", "Confirm doneness; other tasks can be done while waiting"], "group": "pots", "before": ["dumplings-start"], "link": "#cook-dumplings", "resource": "pot-1", "minutes": 8, "confirmation": true, "waitFor": "dumplings-start", "waitKind": "food"},
    {"id": "peel-eggs", "label": ["剥壳、分配鸡蛋", "Peel and Portion Eggs"], "note": ["", ""], "group": "prep", "before": ["eggs"], "link": "#cook-peel-eggs", "minutes": 5, "displayGroup": "pots"},
    {"id": "prep-salmon", "label": ["备三文鱼", "Prepare Salmon"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-salmon", "minutes": 3, "displayGroup": "air"},
    {"id": "air-heat-start", "label": ["开始预热空气炸锅", "Start Preheating Air Fryer"], "note": ["", ""], "group": "air", "before": [], "link": "#cook-air-heat-start", "minutes": 1, "instant": true},
    {"id": "air-heat", "label": ["确认空气炸锅预热完成", "Confirm Air Fryer Is Preheated"], "note": ["预热期间可继续其他任务", "Continue Other Tasks While Heating"], "group": "air", "before": ["air-heat-start"], "link": "#cook-air-heat", "minutes": 4, "confirmation": true},
    {"id": "prep-haddock", "label": ["备罗非鱼", "Prepare Tilapia"], "note": ["", ""], "group": "prep", "displayGroup": "air", "before": [], "link": "#cook-prep-haddock", "minutes": 3},
    {"id": "fish-start", "label": ["同时放入三种鱼", "Load All Three Fish Together"], "note": ["放好并启动后勾选", "Check after loading and starting"], "group": "air", "before": ["air-heat", "prep-salmon", "prep-haddock"], "link": "#cook-fish-start", "minutes": 1, "instant": true, "durationHint": 9, "holdsResource": "air", "releasesAt": "fish"},
    {"id": "fish", "label": ["9分钟后检查、取出三文鱼和罗非鱼", "Check and Remove Salmon and Tilapia at 9 Minutes"], "note": ["熟透后取出；裹粉黑线鳕留在炸篮内", "Remove once cooked through; leave breaded haddock in the basket"], "group": "air", "before": ["fish-start"], "link": "#cook-fish", "minutes": 9, "confirmation": true, "waitFor": "fish-start", "waitKind": "food"},
    {"id": "breaded-fish-start", "label": ["推回炸篮，继续炸黑线鳕", "Return Basket and Continue Cooking Haddock"], "note": ["通常再炸5–7分钟；按已烹调时间调整", "Usually another 5–7 minutes; adjust for time already cooked"], "group": "air", "before": ["fish"], "link": "#cook-breaded-fish-start", "minutes": 1, "instant": true, "durationHint": 7, "holdsResource": "air", "releasesAt": "breaded-fish"},
    {"id": "breaded-fish", "label": ["确认裹粉鱼熟透、取出", "Check and Remove Breaded Haddock"], "note": ["累计约14–16分钟后按包装确认熟度", "Check package doneness after about 14–16 minutes total"], "group": "air", "before": ["breaded-fish-start"], "link": "#cook-breaded-fish", "minutes": 7, "confirmation": true, "waitFor": "breaded-fish-start", "waitKind": "food"},
    {"id": "prep-zucchini", "label": ["备西葫芦", "Prepare Zucchini"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-zucchini", "minutes": 2, "displayGroup": "small-wok"},
    {"id": "spinach", "label": ["菠菜", "Spinach"], "note": ["", ""], "group": "large-wok", "before": [], "link": "#cook-spinach", "minutes": 5},
    {"id": "ground", "label": ["先炒西葫芦，再加鸡肉末", "Cook Zucchini, Then Add Ground Chicken"], "note": ["", ""], "group": "small-wok", "before": ["prep-zucchini"], "link": "#cook-ground", "minutes": 8, "holdsResource": "small-wok", "releasesAt": "tomato"},
    {"id": "tomato", "label": ["拌两份鸡肉番茄意面", "Mix Both Chicken Spaghetti Portions"], "note": ["", ""], "group": "small-wok", "before": ["ground", "pasta", "prep-noodle-sauce"], "link": "#cook-tomato", "minutes": 4, "waitFor": "ground"},
    {"id": "prep-noodle-sauce", "label": ["分装Catelli意面酱", "Portion Catelli Pasta Sauce"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-noodle-sauce", "minutes": 3, "displayGroup": "small-wok"},
    {"id": "season-noodles", "label": ["均分意面、配鸡腿", "Divide Spaghetti and Add Chicken Thighs"], "note": ["", ""], "group": "small-wok", "before": ["tomato", "chicken"], "link": "#cook-season-noodles", "minutes": 2},
    {"id": "prep-chickpeas", "label": ["分配鹰嘴豆", "Portion Chickpeas"], "note": ["", ""], "group": "prep", "before": [], "link": "#cook-prep-chickpeas", "minutes": 3, "displayGroup": "finish"},
    {"id": "prep-bread", "label": ["铺卷饼皮和面包", "Lay Out Tortilla and Bread"], "note": ["", ""], "group": "finish", "before": [], "link": "#cook-prep-bread", "minutes": 2},
    {"id": "prep-wrap", "label": ["备卷饼配料", "Prepare Wrap Fillings"], "note": ["", ""], "group": "prep", "before": ["prep-bread"], "link": "#cook-prep-wrap", "minutes": 3, "displayGroup": "finish"},
    {"id": "prep-sandwich", "label": ["备三明治配料", "Prepare Sandwich Fillings"], "note": ["", ""], "group": "prep", "before": ["prep-bread"], "link": "#cook-prep-sandwich", "minutes": 3, "displayGroup": "finish"},
    {"id": "peas-carrots", "label": ["豌豆胡萝卜", "Peas and Carrots"], "note": ["", ""], "group": "finish", "before": [], "link": "#cook-peas-carrots", "minutes": 3},
    {"id": "wrap", "label": ["卷饼", "Wrap"], "note": ["", ""], "group": "finish", "before": ["prep-wrap", "prep-chickpeas", "chicken", "peel-eggs"], "link": "#cook-wrap", "minutes": 1},
    {"id": "sandwich", "label": ["三明治", "Sandwich"], "note": ["", ""], "group": "finish", "before": ["prep-sandwich", "breaded-fish", "peel-eggs"], "link": "#cook-sandwich", "minutes": 1},
    {"id": "refrigerate", "label": ["入冰箱", "Refrigerate"], "note": ["", ""], "group": "finish", "before": ["rice", "potato", "ribs", "shrimp", "dumplings", "season-noodles", "tomato", "wrap", "sandwich", "spinach", "fish", "peas-carrots", "prep-chickpeas"], "link": "#cook-refrigerate", "minutes": 5},
    {"id": "clean", "label": ["清洗", "Clean Up"], "note": ["", ""], "group": "finish", "before": ["refrigerate"], "link": "#cook-clean", "minutes": 7}
  ];
  const stepEmoji = {
    'prep-rice': '🍚', rice: '🍚',
    'oven-heat-start': '🔥', 'oven-heat': '🌡️',
    'prep-chicken': '🍗', chicken: '🍗',
    'prep-potato': '🥔', potato: '🥔',
    'prep-ribs': '🍖', ribs: '🍖',
    'prep-shrimp': '🦐', shrimp: '🦐',
    fish: '🐟', 'prep-haddock': '🐟', 'prep-salmon': '🐟', salmon: '🐟', haddock: '🐟',
    'air-heat-start': '🔥', 'air-heat': '🌡️',
    'egg-water': '💧', 'pasta-water': '💧',
    'eggs-start': '🥚', 'pasta-start': '🍝', 'dumpling-water-start': '💧🔥', 'dumpling-water': '💧', eggs: '🥚', dumplings: '🥟', pasta: '🍝', noodles: '🍝',
    mushroom: '🍄', curry: '🍛', 'season-noodles': '🍝',
    'breaded-fish-start': '🐟', 'breaded-fish': '🐟', spinach: '🥬', ground: '🍗', tomato: '🍅',
    'prep-chickpeas': '🫘', 'prep-zucchini': '🥒', 'prep-noodle-sauce': '🍅', 'prep-wrap': '🌯', 'prep-sandwich': '🥪', 'peel-eggs': '🥚', 'prep-bread': '🌯🍞', 'peas-carrots': '🫛🥕', wrap: '🌯', sandwich: '🥪', refrigerate: '🧊', clean: '🧼'
  };
  const groups = [
    {"id": "oven", "icon": "oven", "title": ["烤箱", "Oven"], "hint": ["按烤盘空间安排", "Schedule According to Tray Space"]},
    {"id": "rice", "icon": "rice", "title": ["电饭煲", "Rice Cooker"], "hint": ["先启动", "Start Early"]},
    {"id": "pots", "icon": "pot", "title": ["煮锅一、煮锅二", "Pots 1 and 2"], "hint": ["两锅并行", "Two Parallel Pots"]},
    {"id": "air", "icon": "air", "title": ["空气炸锅", "Air Fryer"], "hint": ["三种鱼同下，原味鱼先取出", "Start All Three Together; Remove Plain Fish First"]},
    {"id": "large-wok", "icon": "wok", "title": ["大锅", "Wok"], "hint": ["炒菠菜", "Cook Spinach"]},
    {"id": "small-wok", "icon": "pot", "title": ["小锅", "Saucepan"], "hint": ["锅空时任选，换菜按需清理", "Choose Any Ready Task; Clean Between Dishes as Needed"]},
    {"id": "finish", "icon": "finish", "title": ["收尾", "Finish"], "hint": ["备好配菜与餐点、入冰箱、清洗", "Assemble Meals, Refrigerate and Clean"]}
  ];

  const instructionSections = [["rice", "rice", ["prep-rice", "rice-start", "rice"]], ["oven", "oven", ["oven-heat-start", "prep-potato", "prep-chicken", "prep-ribs", "prep-shrimp", "oven-heat", "potato-start", "potato-turn", "potato", "chicken-start", "chicken", "ribs-start", "ribs", "shrimp-start", "shrimp"]], ["air-fryer", "air", ["prep-salmon", "prep-haddock", "air-heat-start", "air-heat", "fish-start", "fish", "breaded-fish-start", "breaded-fish"]], ["pot-one", "pots", ["egg-water-start", "egg-water", "eggs-start", "eggs", "dumpling-water-start", "dumpling-water", "dumplings-start", "dumplings", "peel-eggs"]], ["pot-two", "pots", ["pasta-water-start", "pasta-water", "pasta-start", "pasta"]], ["small-wok", "small-wok", ["prep-noodle-sauce", "prep-zucchini", "ground", "tomato", "season-noodles"]], ["large-wok", "large-wok", ["spinach"]], ["finish", "finish", ["prep-chickpeas", "prep-bread", "prep-wrap", "prep-sandwich", "peas-carrots", "wrap", "sandwich", "refrigerate", "clean"]]];
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
    '虾仁', '虾肉', '面包糠', '三文鱼', '裹粉黑线鳕', '黑线鳕', '金枪鱼', '水煮蛋', '鸡蛋', '水饺',
    '干意面', '意面', '干扁米粉', '米粉', '干米', '米饭', '蘑菇', '菠菜', '西葫芦',
    'Unico浓缩番茄膏', '罗马番茄', '番茄', '鹰嘴豆', '豆泥', '橙甜椒', '大号卷饼皮', '全麦面包', '豌豆胡萝卜',
    'Hellmann’s Light ½ Fat 蛋黄酱', 'Chipotle蛋黄酱', '橄榄油', '蒜粉', '洋葱粉', '黑胡椒', '红椒粉', '红辣椒', '辣椒',
    '意式香料', '牛至', '罗勒叶', '罗勒', '鱼露', '生抽', '老抽', '蚝油', '咖喱块', '咖喱酱', '热水', '面水', '沸水', '水'
  ].sort((a, b) => b.length - a.length).join('|');
  const cookingEnglishIngredients = String.raw`\b(?:chicken thighs?|raw thighs?|ground chicken|chicken|potatoes|potato wedges|ribs|meatballs|shrimp|panko|salmon|(?:breaded )?haddock(?: fillet)?|tuna|boiled eggs?|eggs?|dumplings|spaghetti|rice noodles|noodles|dry rice|rice|mushrooms|spinach|zucchini|Unico Tomato Paste|Roma tomato|tomato|chickpeas|refried beans|orange bell pepper|tortillas?|whole-wheat bread|bread|peas and carrots|Hellmann’s Light ½ Fat mayonnaise|Chipotle mayonnaise|olive oil|garlic powder|onion powder|black pepper|pepper|paprika|red chili|chili|Italian seasoning|oregano|basil(?: leaves)?|fish sauce|light and dark soy sauces|light soy sauce|dark soy sauce|oyster sauce|Golden Curry|water)\b`;
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
      const emoji = create('span', 'cooking-step-emoji', stepEmoji[node.id] || stepEmoji[node.id.replace(/-start$/, '')] || (node.id === 'potato-turn' ? '🥔' : '✅'));
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
