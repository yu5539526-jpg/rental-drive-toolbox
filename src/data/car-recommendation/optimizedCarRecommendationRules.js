// 数据来源：E:\ClaudeCode_project\CheXingKu；用于目的地车型推荐。
export const optimizedCarRecommendationRules = {
    "description":  "目的地车型推荐评分规则 — 满分100分制",
    "version":  "2.0",
    "note":  "本文件编码所有评分权重、能源偏好、硬性排除、加分扣分、价格推断规则",
    "destinationTypeMapping":  {
                                   "市郊短途":  "城区近郊",
                                   "城市周边短途游":  "城区近郊",
                                   "城区近郊轻自驾":  "城区近郊",
                                   "城区近郊":  "城区近郊",
                                   "海岛滨海":  "海岛滨海",
                                   "海岛滨海环线":  "海岛滨海",
                                   "山地高原":  "山地高原",
                                   "山地高原山路":  "山地高原",
                                   "川西高原山路":  "山地高原",
                                   "云贵山地":  "山地高原",
                                   "云南贵州山地环线":  "山地高原",
                                   "草原戈壁":  "草原戈壁",
                                   "草原边疆":  "草原戈壁",
                                   "戈壁大环线":  "草原戈壁",
                                   "草原戈壁大长线":  "草原戈壁",
                                   "北疆草原边境线":  "草原戈壁",
                                   "青甘荒漠大环线":  "草原戈壁"
                               },
    "totalScoreStructure":  {
                                "_comment":  "满分100分",
                                "destination_fit":  40,
                                "people_fit":  18,
                                "luggage_fit":  14,
                                "driving_fit":  14,
                                "energy_fit":  14
                            },
    "destinationWeights":  {
                               "城区近郊":  {
                                            "_comment":  "40分拆到这些维度",
                                            "vehicle_size":  8,
                                            "parking_difficulty":  8,
                                            "driving_difficulty":  6,
                                            "energy_type":  5,
                                            "fuel_economy":  5,
                                            "refuel_charge_convenience":  4,
                                            "price_tier":  4
                                        },
                               "海岛滨海":  {
                                            "energy_type":  6,
                                            "range":  5,
                                            "charging_convenience":  5,
                                            "fuel_economy":  4,
                                            "seat_comfort":  5,
                                            "seat_features":  3,
                                            "rear_space":  4,
                                            "trunk_space":  3,
                                            "parking_difficulty":  3,
                                            "price_tier":  2
                                        },
                               "山地高原":  {
                                            "horsepower":  6,
                                            "energy_type":  5,
                                            "drive_type":  4,
                                            "ground_clearance":  5,
                                            "real_range":  4,
                                            "refuel_charge_convenience":  5,
                                            "mountain_road_performance":  5,
                                            "high_altitude_performance":  4,
                                            "vehicle_size":  4,
                                            "parking_difficulty":  4,
                                            "driving_difficulty":  4
                                        },
                               "草原戈壁":  {
                                            "real_range":  6,
                                            "fuel_tank_battery":  4,
                                            "refuel_charge_convenience":  6,
                                            "fuel_economy":  4,
                                            "energy_type":  5,
                                            "horsepower":  3,
                                            "drive_type":  3,
                                            "ground_clearance":  3,
                                            "long_distance_comfort":  5,
                                            "seat_comfort":  4,
                                            "rear_space":  3,
                                            "trunk_space":  3,
                                            "highway_assist":  3
                                        }
                           },
    "energyPreferenceScores":  {
                                   "_comment":  "能源偏好适配分满分14, 按偏好+目的地类型计算",
                                   "不限能源，系统推荐":  {
                                                     "_comment":  "按目的地自动判断, 这里给中性分12, 由目的地加分项调节",
                                                     "default":  12
                                                 },
                                   "油车优先，补能省心":  {
                                                     "汽油":  14,
                                                     "油电混动":  13,
                                                     "插电混动":  11,
                                                     "增程式":  10,
                                                     "纯电动":  3
                                                 },
                                   "混动/增程优先":  {
                                                   "插电混动":  14,
                                                   "增程式":  14,
                                                   "油电混动":  12,
                                                   "汽油":  9,
                                                   "纯电动":  6
                                               },
                                   "纯电/新能源优先":  {
                                                    "纯电动":  14,
                                                    "插电混动":  12,
                                                    "增程式":  11,
                                                    "油电混动":  8,
                                                    "汽油":  4
                                                }
                               },
    "hardExclusions":  {
                           "seat_count":  [
                                              {
                                                  "condition":  "people\u003e=6 AND seat_count\u003c6",
                                                  "action":  "exclude",
                                                  "reason":  "座位数不足,6人及以上必须至少6座"
                                              },
                                              {
                                                  "condition":  "people==5 AND seat_count\u003c5",
                                                  "action":  "exclude",
                                                  "reason":  "座位数不足,5人出行必须至少5座"
                                              }
                                          ],
                           "bev_complex_route_penalties":  [
                                                               {
                                                                   "condition":  "山地高原 AND 纯电动 AND real_range_short",
                                                                   "penalty":  -15,
                                                                   "reason":  "山地高原纯电且实际续航短"
                                                               },
                                                               {
                                                                   "condition":  "山地高原 AND 纯电动 AND charging_slow",
                                                                   "penalty":  -10,
                                                                   "reason":  "山地高原纯电且充电速度慢"
                                                               },
                                                               {
                                                                   "condition":  "山地高原 AND 纯电动 AND refuel_inconvenient",
                                                                   "penalty":  -15,
                                                                   "reason":  "山地高原纯电且补能便利性差"
                                                               },
                                                               {
                                                                   "condition":  "草原戈壁 AND 纯电动 AND real_range_short",
                                                                   "penalty":  -20,
                                                                   "reason":  "草原戈壁纯电且实际续航短"
                                                               },
                                                               {
                                                                   "condition":  "草原戈壁 AND 纯电动 AND refuel_inconvenient",
                                                                   "penalty":  -20,
                                                                   "reason":  "草原戈壁纯电且补能便利性差"
                                                               },
                                                               {
                                                                   "condition":  "草原戈壁 AND 纯电动 AND charging_slow",
                                                                   "penalty":  -10,
                                                                   "reason":  "草原戈壁纯电且充电速度慢"
                                                               }
                                                           ],
                           "large_vehicle_narrow_road":  [
                                                             {
                                                                 "condition":  "城区近郊 AND (中大型SUV OR MPV OR 大型车)",
                                                                 "penalty":  -8,
                                                                 "reason":  "城区近郊大车停车不便"
                                                             },
                                                             {
                                                                 "condition":  "山地高原 AND 新手 AND (中大型SUV OR MPV OR 硬派越野)",
                                                                 "penalty":  -10,
                                                                 "reason":  "山地高原+新手不宜大车/硬派越野"
                                                             },
                                                             {
                                                                 "condition":  "山地高原 AND parking_diff_high AND driving_diff_high",
                                                                 "penalty":  -12,
                                                                 "reason":  "山地高原停车驾驶双难"
                                                             },
                                                             {
                                                                 "condition":  "新手 AND parking_diff_high",
                                                                 "penalty":  -10,
                                                                 "reason":  "新手不适合停车难度高的车"
                                                             },
                                                             {
                                                                 "condition":  "新手 AND driving_diff_high",
                                                                 "penalty":  -10,
                                                                 "reason":  "新手不适合驾驶难度高的车"
                                                             }
                                                         ],
                           "space_insufficient":  [
                                                      {
                                                          "condition":  "people_3_4 AND luggage_多 AND trunk_small",
                                                          "penalty":  -12,
                                                          "reason":  "3-4人+行李多+后备箱小"
                                                      },
                                                      {
                                                          "condition":  "people_5 AND (luggage_中 OR luggage_多) AND trunk_small",
                                                          "penalty":  -15,
                                                          "reason":  "5人+行李不低+后备箱小"
                                                      },
                                                      {
                                                          "condition":  "people\u003e=6 AND trunk_small",
                                                          "penalty":  -12,
                                                          "reason":  "6人及以上+后备箱小"
                                                      },
                                                      {
                                                          "condition":  "草原戈壁 AND luggage_多 AND trunk_small",
                                                          "penalty":  -15,
                                                          "reason":  "草原戈壁+行李多+后备箱小"
                                                      }
                                                  ],
                           "comfort_insufficient":  [
                                                        {
                                                            "condition":  "草原戈壁 AND long_distance_comfort_poor",
                                                            "penalty":  -10,
                                                            "reason":  "草原戈壁长途舒适性不足"
                                                        },
                                                        {
                                                            "condition":  "草原戈壁 AND seat_comfort_poor",
                                                            "penalty":  -8,
                                                            "reason":  "草原戈壁座椅舒适度不足"
                                                        },
                                                        {
                                                            "condition":  "山地高原 AND long_distance_comfort_very_poor",
                                                            "penalty":  -6,
                                                            "reason":  "山地高原长途舒适性较差"
                                                        },
                                                        {
                                                            "condition":  "people\u003e=5 AND rear_space_poor",
                                                            "penalty":  -8,
                                                            "reason":  "5人及以上后排空间不足"
                                                        }
                                                    ]
                       },
    "bonusRules":  {
                       "城区近郊":  {
                                    "纯电动":  4,
                                    "插电混动":  3,
                                    "增程式":  3,
                                    "vehicle_size_small_or_medium":  4,
                                    "parking_easy":  4,
                                    "driving_easy":  3,
                                    "price_tier_low":  4
                                },
                       "海岛滨海":  {
                                    "纯电动":  4,
                                    "插电混动":  4,
                                    "增程式":  4,
                                    "seat_ventilation_yes":  3,
                                    "seat_comfort_good":  3,
                                    "trunk_medium_or_above":  3,
                                    "stylish_bonus":  2,
                                    "parking_not_hard":  2
                                },
                       "山地高原":  {
                                    "horsepower_strong":  4,
                                    "four_wheel_drive":  4,
                                    "ground_clearance_high":  4,
                                    "mountain_performance_good":  5,
                                    "high_altitude_performance_good":  4,
                                    "phev_erev_gas":  4,
                                    "refuel_convenience_good":  4
                                },
                       "草原戈壁":  {
                                    "real_range_long":  5,
                                    "fuel_tank_large":  3,
                                    "refuel_convenience_good":  5,
                                    "long_distance_comfort_good":  4,
                                    "seat_features_rich":  3,
                                    "rear_space_good":  3,
                                    "trunk_space_good":  3,
                                    "highway_assist_good":  3
                                }
                   },
    "priceTierInference":  {
                               "_comment":  "当price_tier字段缺失时推断规则",
                               "high_brand":  [
                                                  "奔驰",
                                                  "宝马",
                                                  "奥迪",
                                                  "雷克萨斯",
                                                  "沃尔沃",
                                                  "凯迪拉克",
                                                  "捷尼赛思",
                                                  "路虎",
                                                  "保时捷",
                                                  "仰望"
                                              ],
                               "mid_high_brand":  [
                                                      "理想",
                                                      "问界",
                                                      "蔚来",
                                                      "极氪",
                                                      "腾势",
                                                      "方程豹",
                                                      "阿维塔",
                                                      "岚图",
                                                      "智己",
                                                      "特斯拉",
                                                      "小米"
                                                  ],
                               "budget_brand":  [
                                                    "五菱",
                                                    "宝骏",
                                                    "捷达",
                                                    "哪吒",
                                                    "零跑T03"
                                                ],
                               "rules":  {
                                             "large_or_luxury":  {
                                                                     "condition":  "vehicle_level in [\u0027大型\u0027,\u0027中大型\u0027] AND body_type in [\u0027MPV\u0027,\u0027SUV\u0027]",
                                                                     "tier":  "高"
                                                                 },
                                             "mid_size_suv":  {
                                                                  "condition":  "vehicle_level == \u0027中型\u0027 AND body_type == \u0027SUV\u0027",
                                                                  "tier":  "中"
                                                              },
                                             "compact_or_small":  {
                                                                      "condition":  "vehicle_level in [\u0027小型\u0027,\u0027微型\u0027,\u0027紧凑型\u0027]",
                                                                      "tier":  "低"
                                                                  },
                                             "brand_luxury":  {
                                                                  "condition":  "brand in high_brand_list",
                                                                  "tier":  "高"
                                                              },
                                             "brand_mid_high":  {
                                                                    "condition":  "brand in mid_high_brand_list",
                                                                    "tier":  "中"
                                                                },
                                             "brand_budget":  {
                                                                  "condition":  "brand in budget_brand_list",
                                                                  "tier":  "低"
                                                              }
                                         },
                               "fallback_order":  [
                                                      "large_or_luxury",
                                                      "brand_luxury",
                                                      "brand_mid_high",
                                                      "mid_size_suv",
                                                      "compact_or_small",
                                                      "brand_budget"
                                                  ]
                           },
    "recommendationLevels":  {
                                 "85-100":  "强烈推荐",
                                 "75-84":  "推荐",
                                 "65-74":  "可选",
                                 "55-64":  "谨慎选择",
                                 "0-54":  "不建议"
                             },
    "rentalCommonBrands":  {
                               "高":  [
                                         "大众",
                                         "丰田",
                                         "本田",
                                         "日产",
                                         "别克",
                                         "比亚迪",
                                         "特斯拉",
                                         "理想",
                                         "哈弗",
                                         "坦克",
                                         "吉利",
                                         "长安",
                                         "广汽埃安",
                                         "小鹏",
                                         "蔚来",
                                         "零跑",
                                         "极氪",
                                         "领克",
                                         "五菱",
                                         "宝马",
                                         "奥迪",
                                         "奔驰",
                                         "问界",
                                         "深蓝汽车"
                                     ],
                               "中":  [
                                         "奇瑞",
                                         "广汽传祺",
                                         "捷途",
                                         "沃尔沃",
                                         "凯迪拉克",
                                         "雷克萨斯",
                                         "福特",
                                         "雪佛兰",
                                         "马自达",
                                         "宝骏",
                                         "欧拉",
                                         "iCAR",
                                         "方程豹",
                                         "阿维塔",
                                         "腾势",
                                         "岚图",
                                         "智己",
                                         "极狐",
                                         "哪吒",
                                         "魏牌",
                                         "捷达"
                                     ],
                               "低":  [
                                         "仰望",
                                         "捷尼赛思",
                                         "北京汽车",
                                         "大通",
                                         "风行",
                                         "风神",
                                         "启辰"
                                     ]
                           },
    "textParsing":  {
                        "_comment":  "中文字段值解析规则",
                        "energy_type_aliases":  {
                                                    "纯电动":  [
                                                                "纯电动",
                                                                "纯电",
                                                                "BEV",
                                                                "电动"
                                                            ],
                                                    "插电混动":  [
                                                                 "插电混动",
                                                                 "插混",
                                                                 "PHEV",
                                                                 "插电式混合动力"
                                                             ],
                                                    "增程式":  [
                                                                "增程式",
                                                                "增程",
                                                                "EREV",
                                                                "REEV"
                                                            ],
                                                    "油电混动":  [
                                                                 "油电混动",
                                                                 "油混",
                                                                 "HEV",
                                                                 "油电混合",
                                                                 "双擎"
                                                             ],
                                                    "汽油":  [
                                                               "汽油",
                                                               "燃油",
                                                               "油车",
                                                               "ICE",
                                                               "Gasoline"
                                                           ]
                                                },
                        "space_level_map":  {
                                                "大":  [
                                                          "很好",
                                                          "好",
                                                          "优秀",
                                                          "宽敞",
                                                          "充裕",
                                                          "大",
                                                          "很好"
                                                      ],
                                                "中":  [
                                                          "较好",
                                                          "中等",
                                                          "适中",
                                                          "中",
                                                          "一般"
                                                      ],
                                                "小":  [
                                                          "差",
                                                          "小",
                                                          "紧凑",
                                                          "较小",
                                                          "有限"
                                                      ]
                                            },
                        "difficulty_map":  {
                                               "容易":  [
                                                          "容易",
                                                          "低",
                                                          "友好",
                                                          "简单",
                                                          "很容易"
                                                      ],
                                               "中等":  [
                                                          "中等",
                                                          "中",
                                                          "一般",
                                                          "适中"
                                                      ],
                                               "困难":  [
                                                          "较大",
                                                          "困难",
                                                          "高",
                                                          "较难",
                                                          "不友好",
                                                          "大"
                                                      ]
                                           },
                        "feature_map":  {
                                            "有":  [
                                                      "有",
                                                      "标配",
                                                      "支持",
                                                      "较强",
                                                      "强",
                                                      "较好"
                                                  ],
                                            "无":  [
                                                      "无",
                                                      "不支持",
                                                      "弱",
                                                      "较弱",
                                                      "差",
                                                      "待补充"
                                                  ]
                                        }
                    }
};

export default optimizedCarRecommendationRules;

