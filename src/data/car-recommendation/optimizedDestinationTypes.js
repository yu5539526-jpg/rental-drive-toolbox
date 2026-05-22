// 数据来源：E:\ClaudeCode_project\CheXingKu；用于目的地车型推荐。
export const optimizedDestinationTypes = [
    {
        "id":  "D001",
        "destinationId":  "D001",
        "key":  "city-short",
        "name":  "城区近郊轻自驾",
        "shortName":  "城区近郊",
        "destinationName":  "城区近郊",
        "routeName":  "城区近郊轻自驾",
        "startCity":  "所在城市",
        "mainRoute":  "城市→近郊景点/露营地/古镇→城市",
        "totalMileage":  "约50-300km",
        "recommendedDays":  "1-2",
        "roadType":  "城市道路+快速路+短途高速+景区停车场",
        "highwayRatio":  "20%",
        "mountainRoadRatio":  "5%",
        "unpavedRoadRatio":  "0%",
        "parkingPressure":  "高",
        "chargingCondition":  "好",
        "fuelCondition":  "好",
        "weatherRisk":  "低",
        "altitudeRisk":  "低",
        "comfortImportance":  "低",
        "vehicleSizeSensitivity":  "高",
        "beginnerDifficulty":  "简单",
        "suitableEnergy":  [
                               "纯电动",
                               "插电混动",
                               "增程式",
                               "汽油",
                               "油电混动"
                           ],
        "notRecommendedEnergy":  [

                                 ],
        "routeSummary":  "单日驾驶里程最短，城市通勤/机场取车/周边短途/近郊露营/周末1-2天轻自驾，核心在于好开好停省钱补能方便，而非长途能力",
        "drivingWarning":  "注意商圈景区停车场车位紧张；周末近郊可能拥堵；机场高铁站取还车注意限行",
        "scoreWeights":  [
                             "0.15",
                             "0.10",
                             "0.10",
                             "0.00",
                             "0.25",
                             "0.25",
                             "0.15"
                         ],
        "preferredBodyTypes":  [
                                   "两厢轿车",
                                   "三厢轿车",
                                   "小型SUV",
                                   "紧凑型SUV"
                               ],
        "preferredVehicleLevels":  [
                                       "小型",
                                       "紧凑型"
                                   ],
        "notPreferredBodyTypes":  [
                                      "MPV",
                                      "大型SUV"
                                  ],
        "notPreferredVehicleLevels":  [
                                          "大型",
                                          "中大型"
                                      ],
        "dataSource":  "公开资料",
        "updateDate":  "2026-05-22",
        "remark":  "城区近郊：好开好停省钱补能方便，BEV提高权重，大型车/硬派越野不作为默认推荐"
    },
    {
        "id":  "D002",
        "destinationId":  "D002",
        "key":  "island-leisure",
        "name":  "海岛滨海环线",
        "shortName":  "海岛滨海",
        "destinationName":  "海岛滨海",
        "routeName":  "海岛滨海环线",
        "startCity":  "海口/青岛/厦门/威海/北海/大连",
        "mainRoute":  "滨海城市→沿海公路→海滩景区→环岛/沿海返回",
        "totalMileage":  "约400-1200km",
        "recommendedDays":  "3-7",
        "roadType":  "高速+城市道路+沿海铺装公路",
        "highwayRatio":  "65%",
        "mountainRoadRatio":  "5%",
        "unpavedRoadRatio":  "0%",
        "parkingPressure":  "中",
        "chargingCondition":  "好",
        "fuelCondition":  "好",
        "weatherRisk":  "低",
        "altitudeRisk":  "低",
        "comfortImportance":  "中",
        "vehicleSizeSensitivity":  "低",
        "beginnerDifficulty":  "简单",
        "suitableEnergy":  [
                               "纯电动",
                               "插电混动",
                               "增程式",
                               "汽油",
                               "油电混动"
                           ],
        "notRecommendedEnergy":  [

                                 ],
        "routeSummary":  "路况轻松铺装路为主海拔低补能友好，用户在意舒适空调颜值拍照氛围空间和轻松驾驶",
        "drivingWarning":  "注意台风季天气预警；节假日滨海路段拥堵；海边盐雾注意车辆清洁",
        "scoreWeights":  [
                             "0.20",
                             "0.20",
                             "0.15",
                             "0.00",
                             "0.15",
                             "0.15",
                             "0.15"
                         ],
        "preferredBodyTypes":  [
                                   "三厢轿车",
                                   "SUV",
                                   "两厢轿车"
                               ],
        "preferredVehicleLevels":  [
                                       "紧凑型",
                                       "中型"
                                   ],
        "notPreferredBodyTypes":  [
                                      "硬派越野"
                                  ],
        "notPreferredVehicleLevels":  [
                                          "大型"
                                      ],
        "dataSource":  "公开资料",
        "updateDate":  "2026-05-22",
        "remark":  "海岛滨海：轻松自驾颜值舒适优先，BEV推荐，马力四驱离地间隙非核心"
    },
    {
        "id":  "D003",
        "destinationId":  "D003",
        "key":  "mountain-plateau",
        "name":  "山地高原山路",
        "shortName":  "山地高原",
        "destinationName":  "山地高原",
        "routeName":  "山地高原山路",
        "startCity":  "成都/昆明/贵阳/重庆/拉萨",
        "mainRoute":  "成都→康定→新都桥(川西) / 昆明→大理→丽江→香格里拉(滇西北) / 贵阳→黔东南→重庆→武隆",
        "totalMileage":  "约800-2000km",
        "recommendedDays":  "5-10",
        "roadType":  "高速+国道+山路+县道+古城窄路",
        "highwayRatio":  "40%",
        "mountainRoadRatio":  "35%",
        "unpavedRoadRatio":  "10%",
        "parkingPressure":  "中高",
        "chargingCondition":  "较差",
        "fuelCondition":  "较好",
        "weatherRisk":  "中高",
        "altitudeRisk":  "中高",
        "comfortImportance":  "高",
        "vehicleSizeSensitivity":  "高",
        "beginnerDifficulty":  "中高",
        "suitableEnergy":  [
                               "插电混动",
                               "增程式",
                               "汽油"
                           ],
        "notRecommendedEnergy":  [
                                     "纯电动(短续航)"
                                 ],
        "routeSummary":  "坡多弯多道路窄海拔可能高天气变化多，云贵古城山城停车会车压力大，动力底盘补能可靠性是核心",
        "drivingWarning":  "高原反应需提前准备；垭口可能有冰雪；古城窄路仅容小型车通行；雨季注意落石和塌方",
        "scoreWeights":  [
                             "0.22",
                             "0.18",
                             "0.10",
                             "0.22",
                             "0.12",
                             "0.06",
                             "0.10"
                         ],
        "preferredBodyTypes":  [
                                   "SUV"
                               ],
        "preferredVehicleLevels":  [
                                       "紧凑型",
                                       "中型"
                                   ],
        "notPreferredBodyTypes":  [
                                      "大型MPV",
                                      "大型SUV"
                                  ],
        "notPreferredVehicleLevels":  [
                                          "大型"
                                      ],
        "dataSource":  "公开资料",
        "updateDate":  "2026-05-22",
        "remark":  "山地高原(合并旧山地高原+云贵山地)：动力底盘优先，尺寸敏感，短续航BEV降低推荐"
    },
    {
        "id":  "D004",
        "destinationId":  "D004",
        "key":  "grassland-gobi",
        "name":  "草原戈壁大长线",
        "shortName":  "草原戈壁",
        "destinationName":  "草原戈壁",
        "routeName":  "草原戈壁大长线",
        "startCity":  "乌鲁木齐/西宁/呼和浩特/兰州/海拉尔",
        "mainRoute":  "乌鲁木齐→赛里木湖→伊宁→那拉提(伊犁) / 西宁→青海湖→茶卡→敦煌→张掖(青甘) / 海拉尔→额尔古纳→满洲里(呼伦贝尔)",
        "totalMileage":  "约2000-3500km",
        "recommendedDays":  "7-14",
        "roadType":  "高速+国道+草原公路+戈壁公路+部分非铺装",
        "highwayRatio":  "50%",
        "mountainRoadRatio":  "20%",
        "unpavedRoadRatio":  "15%",
        "parkingPressure":  "低",
        "chargingCondition":  "差",
        "fuelCondition":  "一般",
        "weatherRisk":  "高",
        "altitudeRisk":  "中",
        "comfortImportance":  "高",
        "vehicleSizeSensitivity":  "低",
        "beginnerDifficulty":  "中高",
        "suitableEnergy":  [
                               "汽油",
                               "插电混动",
                               "增程式"
                           ],
        "notRecommendedEnergy":  [
                                     "纯电动"
                                 ],
        "routeSummary":  "景点极度分散单日驾驶300-500km，服务区和补能点间隔大，续航冗余+长途舒适+可靠性是第一优先级，首选稳妥省心续航充足满载舒服的车",
        "drivingWarning":  "戈壁横风危险；夏季备足饮用水；部分路段数百公里无加油站/充电桩；独库公路限行时间(6-9月)；山区天气多变",
        "scoreWeights":  [
                             "0.25",
                             "0.22",
                             "0.15",
                             "0.15",
                             "0.05",
                             "0.08",
                             "0.10"
                         ],
        "preferredBodyTypes":  [
                                   "SUV",
                                   "MPV"
                               ],
        "preferredVehicleLevels":  [
                                       "中型",
                                       "中大型"
                                   ],
        "notPreferredBodyTypes":  [
                                      "两厢轿车",
                                      "小型SUV"
                                  ],
        "notPreferredVehicleLevels":  [
                                          "小型",
                                          "微型"
                                      ],
        "dataSource":  "公开资料",
        "updateDate":  "2026-05-22",
        "remark":  "草原戈壁(合并旧草原边疆+戈壁大环线)：续航可靠性为王，长途舒适优先，短续航BEV/城市小车显著降权"
    }
];

export default optimizedDestinationTypes;

