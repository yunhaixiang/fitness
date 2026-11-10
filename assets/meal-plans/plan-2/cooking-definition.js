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
      "id": "potato",
      "label": [
        "烤土豆",
        "Roast Potatoes"
      ],
      "note": [
        "",
        ""
      ],
      "group": "oven",
      "before": [
        "oven-heat",
        "prep-potato"
      ],
      "link": "#cook-potato",
      "minutes": 40
    },
    {
      "id": "chicken",
      "label": [
        "鸡大腿肉",
        "Chicken Thighs"
      ],
      "note": [
        "",
        ""
      ],
      "group": "oven",
      "before": [
        "oven-heat",
        "prep-chicken"
      ],
      "link": "#cook-chicken",
      "minutes": 27
    },
    {
      "id": "ribs",
      "label": [
        "BBQ排骨",
        "BBQ Ribs"
      ],
      "note": [
        "",
        ""
      ],
      "group": "oven",
      "before": [
        "oven-heat",
        "prep-ribs"
      ],
      "link": "#cook-ribs",
      "minutes": 20
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
      "id": "rice",
      "label": [
        "白米饭",
        "White Rice"
      ],
      "note": [
        "",
        ""
      ],
      "group": "rice",
      "before": [
        "prep-rice"
      ],
      "link": "#cook-rice",
      "minutes": 50
    },
    {
      "id": "egg-water",
      "label": [
        "煮锅一烧水",
        "Boil Water in Pot 1"
      ],
      "note": [
        "",
        ""
      ],
      "group": "pots",
      "before": [],
      "link": "#cook-egg-water",
      "manual": true,
      "resource": "pot-1",
      "minutes": 1
    },
    {
      "id": "pasta-water",
      "label": [
        "煮锅二烧水",
        "Boil Water in Pot 2"
      ],
      "note": [
        "",
        ""
      ],
      "group": "pots",
      "before": [],
      "link": "#cook-pasta-water",
      "manual": true,
      "resource": "pot-2",
      "minutes": 1
    },
    {
      "id": "eggs",
      "label": [
        "煮蛋、捞出冷却",
        "Boil Eggs and Set Aside to Cool"
      ],
      "note": [
        "",
        ""
      ],
      "group": "pots",
      "before": [
        "egg-water"
      ],
      "link": "#cook-eggs",
      "resource": "pot-1",
      "minutes": 9
    },
    {
      "id": "pasta",
      "label": [
        "意面",
        "Spaghetti"
      ],
      "note": [
        "",
        ""
      ],
      "group": "pots",
      "before": [
        "pasta-water"
      ],
      "link": "#cook-pasta",
      "resource": "pot-2",
      "minutes": 8
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
        "备三文鱼",
        "Prepare Salmon"
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
      "id": "salmon",
      "label": [
        "三文鱼",
        "Salmon"
      ],
      "note": [
        "",
        ""
      ],
      "group": "air",
      "before": [
        "air-heat",
        "prep-salmon"
      ],
      "link": "#cook-salmon",
      "minutes": 8
    },
    {
      "id": "haddock",
      "label": [
        "裹粉黑线鳕",
        "Breaded Haddock"
      ],
      "note": [
        "",
        ""
      ],
      "group": "air",
      "before": [
        "air-heat"
      ],
      "link": "#cook-haddock",
      "minutes": 20
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
      "id": "mushroom",
      "label": [
        "蘑菇",
        "Mushrooms"
      ],
      "note": [
        "",
        ""
      ],
      "group": "small-wok",
      "before": [],
      "link": "#cook-mushroom",
      "minutes": 7
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
      "id": "prep-bread",
      "label": [
        "铺卷饼皮、抹酱",
        "Lay Out Tortilla and Spread Sauce"
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
        "haddock",
        "spinach",
        "ground",
        "mushroom",
        "tomato",
        "wrap"
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
      "before": ["refrigerate"],
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
        "potato",
        "chicken",
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
        "salmon",
        "haddock"
      ]
    ],
    [
      "pot-one",
      "pots",
      [
        "egg-water",
        "eggs",
        "peel-eggs"
      ]
    ],
    [
      "pot-two",
      "pots",
      [
        "pasta-water",
        "pasta"
      ]
    ],
    [
      "small-wok",
      "small-wok",
      [
        "mushroom",
        "tomato"
      ]
    ],
    [
      "large-wok",
      "large-wok",
      [
        "spinach",
        "ground"
      ]
    ],
    [
      "finish",
      "finish",
      [
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
