# 车型推荐数据说明

车型推荐运行数据来源于 `E:\ClaudeCode_project\CheXingKu\car-rental-database\curated`，当前网页项目通过本目录下的 `car_recommend_data.json` 使用同步后的 curated 车型库。

后续车型库更新时，需要同步这个文件：

- `car_recommend_data.json`：curated 车型基础信息、目的地画像、目的地适配评分、手动标注价位段。

`index.js` 是页面和工具函数的唯一推荐数据入口。不要在页面组件中硬编码车型库数据；`optimized*.js` 为历史同步文件，不参与实际推荐 import 或 fallback。
