# 车型推荐数据说明

车型推荐运行数据来源于 `E:\ClaudeCode_project\CheXingKu`，当前网页项目通过本目录下的 `optimized*.js` 文件使用同步后的车型库。

后续 CheXingKu 更新时，需要同步这些文件：

- `optimizedCarModels.js`：车型基础信息、能源、马力、空间、驾驶难度等。
- `optimizedDestinationTypes.js`：目的地类型与路线画像。
- `optimizedCarDestinationScores.js`：车型与目的地的适配评分。
- `optimizedCarRecommendationRules.js`：推荐打分规则和权重。

`index.js` 是页面和工具函数的唯一推荐数据入口。不要在页面组件中硬编码车型库数据；旧的 `car_recommend_data.json` 仅作为历史留档，不参与实际推荐。
