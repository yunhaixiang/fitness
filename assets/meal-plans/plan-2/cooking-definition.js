/* Plan 2: historical recipe with shared interactive rendering. */
(function () {
 const definition = {
  "nodes": [
    {
      "id": "oven-heat-start",
      "label": [
        "开始预热烤箱",
        "Start Preheating Oven"
      ],
      "note": [
        "",
        ""
      ],
      "group": "oven",
      "before": [],
      "link": "#cook-oven-heat-start",
      "minutes": 1,
      "instant": true
    },
    {
      "id": "prep-potato",
      "label": [
        "备土豆",
        "Prepare Potatoes"
      ],
      "note": [
        "",
        ""
      ],
      "group": "prep",
      "before": [],
      "link": "#cook-prep-potato",
      "minutes": 3,
      "displayGroup": "oven"
    },
    {
      "id": "prep-chicken",
      "label": [
        "备鸡大腿肉",
        "Prepare Chicken Thighs"
      ],
      "note": [
        "",
        ""
      ],
      "group": "prep",
      "before": [],
      "link": "#cook-prep-chicken",
      "minutes": 3,
      "displayGroup": "oven"
    },
    {
      "id": "prep-ribs",
      "label": [
        "备排骨",
        "Prepare Ribs"
      ],
      "note": [
        "",
        ""
      ],
      "group": "prep",
      "before": [],
      "link": "#cook-prep-ribs",
      "minutes": 3,
      "displayGroup": "oven"
    },
    {
      "id": "oven-heat",
      "label": [
        "确认烤箱预热完成",
        "Confirm Oven Is Preheated"
      ],
      "note": [
        "",
        ""
      ],
      "group": "oven",
      "before": [
        "oven-heat-start"
      ],
      "link": "#cook-oven-heat",
      "minutes": 15,
      "confirmation": true
    },
    {
      "id": "potato-start",
      "label": [
        "放入土豆",
        "Load Potatoes"
      ],
      "note": [
        "放好并启动后勾选",
        "Check after loading and starting"
      ],
      "group": "oven",
      "before": [
        "oven-heat",
        "prep-potato"
      ],
      "link": "#cook-potato-start",
      "minutes": 1,
      "instant": true,
      "durationHint": 40
    },
    {
      "id": "potato-turn",
      "label": [
        "土豆中途翻面",
        "Turn Potatoes Halfway"
      ],
      "note": [
        "烤约20分钟后翻面",
        "Turn after about 20 minutes"
      ],
      "group": "oven",
      "before": [
        "potato-start"
      ],
      "link": "#cook-potato-turn",
      "minutes": 1,
      "confirmation": true,
      "waitKind": "food",
      "waitFor": "potato-start"
    },
    {
      "id": "potato",
      "label": [
        "确认土豆熟透、取出",
        "Check and Remove Potatoes"
      ],
      "note": [
        "按熟度确认；等待期间可做其他任务",
        "Confirm doneness; other tasks can be done while waiting"
      ],
      "group": "oven",
      "before": [
        "potato-turn"
      ],
      "link": "#cook-potato",
      "minutes": 40,
      "confirmation": true,
      "waitFor": "potato-start",
      "waitKind": "food"
    },
    {
      "id": "chicken-start",
      "label": [
        "放入鸡大腿肉",
        "Load Chicken Thighs"
      ],
      "note": [
        "放好并启动后勾选",
        "Check after loading and starting"
      ],
      "group": "oven",
      "before": [
        "oven-heat",
        "prep-chicken"
      ],
      "link": "#cook-chicken-start",
      "minutes": 1,
      "instant": true,
      "durationHint": 27
    },
    {
      "id": "chicken",
      "label": [
        "确认鸡大腿肉熟透、取出",
        "Check and Remove Chicken Thighs"
      ],
      "note": [
        "按熟度确认；等待期间可做其他任务",
        "Confirm doneness; other tasks can be done while waiting"
      ],
      "group": "oven",
      "before": [
        "chicken-start"
      ],
      "link": "#cook-chicken",
      "minutes": 27,
      "confirmation": true,
      "waitFor": "chicken-start",
      "waitKind": "food"
    },
    {
      "id": "ribs-start",
      "label": [
        "放入排骨",
        "Load Ribs"
      ],
      "note": [
        "放好并启动后勾选",
        "Check after loading and starting"
      ],
      "group": "oven",
      "before": [
        "oven-heat",
        "prep-ribs"
      ],
      "link": "#cook-ribs-start",
      "minutes": 1,
      "instant": true,
      "durationHint": 20
    },
    {
      "id": "ribs",
      "label": [
        "确认排骨熟透、取出",
        "Check and Remove Ribs"
      ],
      "note": [
        "按熟度确认；等待期间可做其他任务",
        "Confirm doneness; other tasks can be done while waiting"
      ],
      "group": "oven",
      "before": [
        "ribs-start"
      ],
      "link": "#cook-ribs",
      "minutes": 20,
      "confirmation": true,
      "waitFor": "ribs-start",
      "waitKind": "food"
    },
    {
      "id": "prep-rice",
      "label": [
        "备白米",
        "Prepare Rice"
      ],
      "note": [
        "",
        ""
      ],
      "group": "prep",
      "before": [],
      "link": "#cook-prep-rice",
      "minutes": 3,
      "displayGroup": "rice"
    },
    {
      "id": "rice-start",
      "label": [
        "启动煮饭",
        "Start Rice Cooker"
      ],
      "note": [
        "放好并启动后勾选",
        "Check after loading and starting"
      ],
      "group": "rice",
      "before": [
        "prep-rice"
      ],
      "link": "#cook-rice-start",
      "minutes": 1,
      "instant": true,
      "durationHint": 50
    },
    {
      "id": "rice",
      "label": [
        "确认米饭煮好、盛出",
        "Check and Serve Rice"
      ],
      "note": [
        "按熟度确认；等待期间可做其他任务",
        "Confirm doneness; other tasks can be done while waiting"
      ],
      "group": "rice",
      "before": [
        "rice-start"
      ],
      "link": "#cook-rice",
      "minutes": 50,
      "confirmation": true,
      "waitFor": "rice-start",
      "waitKind": "food"
    },
    {
      "id": "egg-water-start",
      "label": [
        "煮锅一开始烧水",
        "Start Heating Water in Pot 1"
      ],
      "note": [
        "开火后勾选；水开另行确认",
        "Check after turning on the heat; confirm boiling separately"
      ],
      "group": "pots",
      "before": [],
      "link": "#cook-egg-water-start",
      "resource": "pot-1",
      "minutes": 1,
      "instant": true
    },
    {
      "id": "egg-water",
      "label": [
        "确认煮锅一水开",
        "Confirm Pot 1 Is Boiling"
      ],
      "note": [
        "",
        ""
      ],
      "group": "pots",
      "before": [
        "egg-water-start"
      ],
      "link": "#cook-egg-water",
      "manual": true,
      "resource": "pot-1",
      "minutes": 1,
      "confirmation": true,
      "waitFor": "egg-water-start",
      "waitKind": "boil"
    },
    {
      "id": "pasta-water-start",
      "label": [
        "煮锅二开始烧水",
        "Start Heating Water in Pot 2"
      ],
      "note": [
        "开火后勾选；水开另行确认",
        "Check after turning on the heat; confirm boiling separately"
      ],
      "group": "pots",
      "before": [],
      "link": "#cook-pasta-water-start",
      "resource": "pot-2",
      "minutes": 1,
      "instant": true
    },
    {
      "id": "pasta-water",
      "label": [
        "确认煮锅二水开",
        "Confirm Pot 2 Is Boiling"
      ],
      "note": [
        "",
        ""
      ],
      "group": "pots",
      "before": [
        "pasta-water-start"
      ],
      "link": "#cook-pasta-water",
      "manual": true,
      "resource": "pot-2",
      "minutes": 1,
      "confirmation": true,
      "waitFor": "pasta-water-start",
      "waitKind": "boil"
    },
    {
      "id": "eggs-start",
      "label": [
        "放入鸡蛋",
        "Load Eggs"
      ],
      "note": [
        "放好并启动后勾选",
        "Check after loading and starting"
      ],
      "group": "pots",
      "before": [
        "egg-water"
      ],
      "link": "#cook-eggs-start",
      "resource": "pot-1",
      "minutes": 1,
      "instant": true,
      "durationHint": 9,
      "holdsResource": "pot-1",
      "releasesAt": "eggs"
    },
    {
      "id": "eggs",
      "label": [
        "确认鸡蛋熟透、取出",
        "Check and Remove Eggs"
      ],
      "note": [
        "按熟度确认；等待期间可做其他任务",
        "Confirm doneness; other tasks can be done while waiting"
      ],
      "group": "pots",
      "before": [
        "eggs-start"
      ],
      "link": "#cook-eggs",
      "resource": "pot-1",
      "minutes": 9,
      "confirmation": true,
      "waitFor": "eggs-start",
      "waitKind": "food"
    },
    {
      "id": "pasta-start",
      "label": [
        "放入意面",
        "Load Spaghetti"
      ],
      "note": [
        "放好并启动后勾选",
        "Check after loading and starting"
      ],
      "group": "pots",
      "before": [
        "pasta-water"
      ],
      "link": "#cook-pasta-start",
      "resource": "pot-2",
      "minutes": 1,
      "instant": true,
      "durationHint": 8,
      "holdsResource": "pot-2",
      "releasesAt": "pasta"
    },
    {
      "id": "pasta",
      "label": [
        "确认意面熟透、取出",
        "Check and Remove Spaghetti"
      ],
      "note": [
        "按熟度确认；等待期间可做其他任务",
        "Confirm doneness; other tasks can be done while waiting"
      ],
      "group": "pots",
      "before": [
        "pasta-start"
      ],
      "link": "#cook-pasta",
      "resource": "pot-2",
      "minutes": 8,
      "confirmation": true,
      "waitFor": "pasta-start",
      "waitKind": "food"
    },
    {
      "id": "peel-eggs",
      "label": [
        "剥壳、分配鸡蛋",
        "Peel and Portion Eggs"
      ],
      "note": [
        "",
        ""
      ],
      "group": "prep",
      "before": [
        "eggs"
      ],
      "link": "#cook-peel-eggs",
      "minutes": 5,
      "displayGroup": "pots"
    },
    {
      "id": "prep-salmon",
      "label": [
        "备三文鱼和罗非鱼",
        "Prepare Salmon and Tilapia"
      ],
      "note": [
        "",
        ""
      ],
      "group": "prep",
      "before": [],
      "link": "#cook-prep-salmon",
      "minutes": 3,
      "displayGroup": "air"
    },
    {
      "id": "air-heat-start",
      "label": [
        "开始预热空气炸锅",
        "Start Preheating Air Fryer"
      ],
      "note": [
        "",
        ""
      ],
      "group": "air",
      "before": [],
      "link": "#cook-air-heat-start",
      "minutes": 1,
      "instant": true
    },
    {
      "id": "air-heat",
      "label": [
        "确认空气炸锅预热完成",
        "Confirm Air Fryer Is Preheated"
      ],
      "note": [
        "预热期间可继续其他任务",
        "Continue Other Tasks While Heating"
      ],
      "group": "air",
      "before": [
        "air-heat-start"
      ],
      "link": "#cook-air-heat",
      "minutes": 4,
      "confirmation": true
    },
    {
      "id": "salmon-start",
      "label": [
        "放入三文鱼和罗非鱼",
        "Load Salmon and Tilapia"
      ],
      "note": [
        "放好并启动后勾选",
        "Check after loading and starting"
      ],
      "group": "air",
      "before": [
        "air-heat",
        "prep-salmon"
      ],
      "link": "#cook-salmon-start",
      "minutes": 1,
      "instant": true,
      "durationHint": 8,
      "holdsResource": "air",
      "releasesAt": "salmon"
    },
    {
      "id": "salmon",
      "label": [
        "确认两种鱼熟透、取出",
        "Check and Remove Both Fish"
      ],
      "note": [
        "按熟度确认；等待期间可做其他任务",
        "Confirm doneness; other tasks can be done while waiting"
      ],
      "group": "air",
      "before": [
        "salmon-start"
      ],
      "link": "#cook-salmon",
      "minutes": 8,
      "confirmation": true,
      "waitFor": "salmon-start",
      "waitKind": "food"
    },
    {
      "id": "spinach",
      "label": [
        "菠菜",
        "Spinach"
      ],
      "note": [
        "",
        ""
      ],
      "group": "large-wok",
      "before": [],
      "link": "#cook-spinach",
      "minutes": 5
    },
    {
      "id": "ground",
      "label": [
        "鸡肉末，豌豆，胡萝卜",
        "Ground Chicken, Peas and Carrots"
      ],
      "note": [
        "",
        ""
      ],
      "group": "large-wok",
      "before": [],
      "link": "#cook-ground",
      "minutes": 8
    },
    {
      "id": "cauliflower-start",
      "label": [
        "加入菜花、开始煮",
        "Add Cauliflower and Start Simmering"
      ],
      "note": [
        "",
        ""
      ],
      "group": "large-wok",
      "before": [
        "ground"
      ],
      "link": "#cook-cauliflower-start",
      "minutes": 1,
      "instant": true
    },
    {
      "id": "cauliflower",
      "label": [
        "确认菜花熟透",
        "Check Cauliflower Doneness"
      ],
      "note": [
        "按包装时间和软度确认",
        "Follow package cooking time and check tenderness"
      ],
      "group": "large-wok",
      "before": [
        "cauliflower-start"
      ],
      "link": "#cook-cauliflower",
      "minutes": 1,
      "confirmation": true,
      "waitFor": "cauliflower-start",
      "waitKind": "food"
    },
    {
      "id": "curry-start",
      "label": [
        "加入咖喱、开始小火煮",
        "Add Curry and Start Simmering"
      ],
      "note": [
        "",
        ""
      ],
      "group": "large-wok",
      "before": [
        "cauliflower"
      ],
      "link": "#cook-curry-start",
      "minutes": 2,
      "instant": true,
      "durationHint": 5
    },
    {
      "id": "curry",
      "label": [
        "确认咖喱完成、分盘",
        "Check and Portion Curry"
      ],
      "note": [
        "",
        ""
      ],
      "group": "large-wok",
      "before": [
        "curry-start"
      ],
      "link": "#cook-curry",
      "minutes": 5,
      "confirmation": true,
      "waitFor": "curry-start",
      "waitKind": "food"
    },
    {
      "id": "tomato",
      "label": [
        "拌番茄意面",
        "Finish Tomato Spaghetti"
      ],
      "note": [
        "",
        ""
      ],
      "group": "small-wok",
      "before": [
        "pasta"
      ],
      "link": "#cook-tomato",
      "minutes": 4
    },
    {
      "id": "broccoli-start",
      "label": [
        "开始微波西兰花",
        "Start Microwaving Broccoli"
      ],
      "note": [
        "",
        ""
      ],
      "group": "finish",
      "before": [],
      "link": "#cook-broccoli-start",
      "minutes": 1,
      "instant": true
    },
    {
      "id": "broccoli",
      "label": [
        "确认西兰花熟透、分盘",
        "Check and Portion Broccoli"
      ],
      "note": [
        "按包装加热并确认熟度",
        "Follow package directions and confirm doneness"
      ],
      "group": "finish",
      "before": [
        "broccoli-start"
      ],
      "link": "#cook-broccoli",
      "minutes": 1,
      "confirmation": true,
      "waitFor": "broccoli-start",
      "waitKind": "food"
    },
    {
      "id": "prep-bread",
      "label": [
        "切甜椒、铺卷饼皮、抹酱",
        "Slice Pepper, Lay Out Tortilla and Spread Sauce"
      ],
      "note": [
        "",
        ""
      ],
      "group": "finish",
      "before": [],
      "link": "#cook-prep-bread",
      "minutes": 2
    },
    {
      "id": "wrap",
      "label": [
        "卷饼",
        "Wrap"
      ],
      "note": [
        "",
        ""
      ],
      "group": "finish",
      "before": [
        "prep-bread",
        "chicken",
        "peel-eggs"
      ],
      "link": "#cook-wrap",
      "minutes": 1
    },
    {
      "id": "refrigerate",
      "label": [
        "入冰箱",
        "Refrigerate"
      ],
      "note": [
        "",
        ""
      ],
      "group": "finish",
      "before": [
        "rice",
        "potato",
        "chicken",
        "ribs",
        "peel-eggs",
        "salmon",
        "spinach",
        "curry",
        "tomato",
        "wrap",
        "broccoli"
      ],
      "link": "#cook-refrigerate",
      "minutes": 5
    },
    {
      "id": "clean",
      "label": [
        "清洗",
        "Clean Up"
      ],
      "note": [
        "",
        ""
      ],
      "group": "finish",
      "before": [
        "refrigerate"
      ],
      "link": "#cook-clean",
      "minutes": 7
    }
  ],
  "instructionSections": [
    [
      "rice",
      "rice",
      [
        "prep-rice",
        "rice-start",
        "rice"
      ]
    ],
    [
      "oven",
      "oven",
      [
        "oven-heat-start",
        "prep-potato",
        "prep-chicken",
        "prep-ribs",
        "oven-heat",
        "potato-start",
        "potato-turn",
        "potato",
        "chicken-start",
        "chicken",
        "ribs-start",
        "ribs"
      ]
    ],
    [
      "air-fryer",
      "air",
      [
        "prep-salmon",
        "air-heat-start",
        "air-heat",
        "salmon-start",
        "salmon"
      ]
    ],
    [
      "pot-one",
      "pots",
      [
        "egg-water-start",
        "egg-water",
        "eggs-start",
        "eggs",
        "peel-eggs"
      ]
    ],
    [
      "pot-two",
      "pots",
      [
        "pasta-water-start",
        "pasta-water",
        "pasta-start",
        "pasta"
      ]
    ],
    [
      "small-wok",
      "small-wok",
      [
        "tomato"
      ]
    ],
    [
      "large-wok",
      "large-wok",
      [
        "spinach",
        "ground",
        "cauliflower-start",
        "cauliflower",
        "curry-start",
        "curry"
      ]
    ],
    [
      "finish",
      "finish",
      [
        "broccoli-start",
        "broccoli",
        "prep-bread",
        "wrap",
        "refrigerate",
        "clean"
      ]
    ]
  ]
};
 if (typeof module !== "undefined" && module.exports) module.exports = definition;
 else window.fitnessCookingDefinition = definition;
})();
