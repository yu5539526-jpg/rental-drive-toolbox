const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "输出");
const htmlDir = path.join(outDir, "可编辑排版源文件");

const PAGE_W = 1242;
const PAGE_H = 1660;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function xmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const groups = [
  {
    title: "西北 / 草原边境",
    subtitle: "长线环线、高海拔、草原公路为主，优先看通过性和续航补给。",
    tag: "长线环线",
    destinations: [
      {
        name: "新疆伊犁环线",
        scene: "草原、峡谷、雪山、长距离环线",
        road: "高速+省道+山区盘山，旺季车流大",
        car: "中型 SUV / SUV",
        people: "2-4 人；行李多选中型 SUV",
        ev: "谨慎",
        tip: "景点间距离长，提前确认油站、住宿和异地还车规则",
        anchor: "赛里木湖、那拉提、独库沿线、烤包子/手抓饭",
      },
      {
        name: "甘南环线",
        scene: "草原、寺院、峡谷、县城跳点",
        road: "国道+山路+高原路段，雨季注意塌方绕行",
        car: "SUV / 中型 SUV",
        people: "2-4 人；老人孩子注意高反节奏",
        ev: "谨慎",
        tip: "高原温差大，满载别选小排量低配车",
        anchor: "扎尕那、郎木寺、拉卜楞寺、藏餐牦牛肉",
      },
      {
        name: "敦煌/河西走廊",
        scene: "沙漠、戈壁、古城、长途串联",
        road: "高速+国道，日晒强、服务区间隔长",
        car: "舒适轿车 / SUV",
        people: "2-4 人；长线建议后备厢大",
        ev: "谨慎",
        tip: "别把车开进非铺装沙地，取车看胎压和备胎",
        anchor: "莫高窟、鸣沙山、嘉峪关、驴肉黄面",
      },
      {
        name: "呼伦贝尔",
        scene: "草原、边境公路、湿地、牧场",
        road: "省道+草原路，部分路段补给稀疏",
        car: "SUV / 中型 SUV",
        people: "2-5 人；亲子家庭优先 SUV",
        ev: "谨慎",
        tip: "草原路不要随意离开硬化道路，提前规划加油",
        anchor: "莫日格勒河、额尔古纳、满洲里、俄餐/羊肉",
      },
      {
        name: "阿尔山",
        scene: "森林、火山地貌、温泉、秋色",
        road: "山路+林区公路，早晚温差和雾气明显",
        car: "SUV",
        people: "2-4 人；摄影装备多选大后备厢",
        ev: "谨慎",
        tip: "冬春路面易结冰，租车确认雪地胎或防滑链政策",
        anchor: "阿尔山森林公园、不冻河、柴河月亮小镇",
      },
      {
        name: "延吉",
        scene: "城市美食、边境小城、短途周边",
        road: "城市路+高速，停车比山地路线更关键",
        car: "舒适轿车 / 紧凑 SUV",
        people: "2-4 人；美食短途选轿车也够",
        ev: "可考虑",
        tip: "市区停车紧张，旺季酒店最好带停车位",
        anchor: "延边大学墙、图们、朝鲜族烤肉/冷面",
      },
    ],
  },
  {
    title: "西南高原山地",
    subtitle: "山路、海拔和弯道更多，车况、动力、刹车和保险要优先确认。",
    tag: "高原山地",
    destinations: [
      {
        name: "丽江到香格里拉",
        scene: "雪山、峡谷、古城、高原短线",
        road: "国道+山路，海拔逐步上升",
        car: "SUV / 中型 SUV",
        people: "2-4 人；高反敏感人群放慢行程",
        ev: "谨慎",
        tip: "不要把行程排太满，夜间山路尽量不跑",
        anchor: "虎跳峡、独克宗、纳帕海、牦牛火锅",
      },
      {
        name: "川西小环线",
        scene: "雪山、草甸、藏寨、摄影路线",
        road: "高原山路+隧道+盘山，天气变化快",
        car: "中型 SUV / SUV",
        people: "2-4 人；满载优先中型 SUV",
        ev: "谨慎",
        tip: "确认轮胎、刹车和玻璃险，冬季关注路况管制",
        anchor: "四姑娘山、塔公、新都桥、牦牛肉汤锅",
      },
      {
        name: "成都周边",
        scene: "古镇、雪山近郊、亲子短途",
        road: "城市+高速+景区山路，周末堵车明显",
        car: "舒适轿车 / SUV",
        people: "2-5 人；家庭选 SUV 或 MPV",
        ev: "可考虑",
        tip: "周末早出城，景区停车费和堵车时间要预留",
        anchor: "都江堰、青城山、峨眉山、火锅/甜水面",
      },
      {
        name: "重庆周边",
        scene: "峡谷、武隆、山城周边短线",
        road: "高速+山路+立体城市道路",
        car: "SUV / 舒适轿车",
        people: "2-4 人；山路多选 SUV 更稳",
        ev: "可考虑",
        tip: "市区停车和导航绕路多，酒店停车先问清",
        anchor: "武隆、仙女山、龚滩古镇、江湖菜/小面",
      },
      {
        name: "大理环洱海",
        scene: "湖景、古镇、轻松旅拍",
        road: "环湖公路+城镇道路，限速和电动车多",
        car: "舒适轿车 / 小型 SUV",
        people: "2-4 人；旅拍轻装选轿车即可",
        ev: "可考虑",
        tip: "环海西路部分区域限行，别压线乱停拍照",
        anchor: "双廊、喜洲、海西稻田、乳扇/菌菇",
      },
      {
        name: "贵阳/黔东南",
        scene: "苗寨、侗寨、瀑布、县城串联",
        road: "高速+山路+村寨窄路，雨雾多",
        car: "SUV / 舒适轿车",
        people: "2-4 人；多人行李多选 SUV",
        ev: "谨慎",
        tip: "雨季谨慎夜驾，村寨停车场位置提前查",
        anchor: "西江千户苗寨、肇兴侗寨、酸汤鱼",
      },
      {
        name: "腾冲",
        scene: "火山、热海、古镇、边城慢游",
        road: "山路+县道，部分景点间车程不短",
        car: "SUV / 舒适轿车",
        people: "2-4 人；慢游可选舒适轿车",
        ev: "谨慎",
        tip: "景点分散，别只按直线距离估时间",
        anchor: "和顺古镇、热海、银杏村、土锅子/饵丝",
      },
    ],
  },
  {
    title: "华东沿海海岛",
    subtitle: "海边城市、环岛路和亲子度假多，重点看停车、后备厢和防晒雨具。",
    tag: "沿海海岛",
    destinations: [
      {
        name: "青岛/胶东半岛",
        scene: "海岸线、城市街区、半岛串联",
        road: "城市路+高速+海边停车，旺季拥堵",
        car: "舒适轿车 / SUV",
        people: "2-4 人；家庭行李多选 SUV",
        ev: "可考虑",
        tip: "老城停车难，海边景点尽量错峰",
        anchor: "八大关、崂山、威海烟台串线、海鲜/啤酒",
      },
      {
        name: "威海",
        scene: "海岸公路、亲子、慢节奏旅拍",
        road: "城市+环海路，景点停车需求高",
        car: "舒适轿车 / 小型 SUV",
        people: "2-4 人；情侣亲子都适合",
        ev: "可考虑",
        tip: "热门海滩停车紧张，早晚拍照更顺",
        anchor: "火炬八街、那香海、刘公岛、韩餐/海鲜",
      },
      {
        name: "烟台",
        scene: "海岸、葡萄酒庄、蓬莱长岛",
        road: "城市路+高速，港口/码头需看时间",
        car: "舒适轿车 / SUV",
        people: "2-4 人；长岛段注意车辆上岛规则",
        ev: "可考虑",
        tip: "涉及船票时不要把还车时间卡太死",
        anchor: "养马岛、蓬莱阁、长岛、鲅鱼饺子/海肠饭",
      },
      {
        name: "大连",
        scene: "滨海路、广场、海岛近郊",
        road: "城市坡路+滨海弯道，停车点分散",
        car: "舒适轿车 / SUV",
        people: "2-4 人；亲子行李多选 SUV",
        ev: "可考虑",
        tip: "滨海路拍照别临停影响交通",
        anchor: "星海广场、金石滩、旅顺、海胆/焖子",
      },
      {
        name: "秦皇岛/阿那亚",
        scene: "海边度假、社区、亲子周末",
        road: "高速+度假区道路，节假日进出慢",
        car: "舒适轿车 / SUV",
        people: "2-5 人；家庭可选 SUV 或 MPV",
        ev: "可考虑",
        tip: "确认住宿停车权益，旺季提前预约园区",
        anchor: "阿那亚礼堂、鸽子窝、山海关、海鲜烧烤",
      },
      {
        name: "日照",
        scene: "海滨、森林公园、亲子露营",
        road: "城市+海边景区路，停车场较集中",
        car: "舒适轿车 / 小型 SUV",
        people: "2-4 人；轻装周末选轿车",
        ev: "可考虑",
        tip: "赶海装备多时留后备厢空间",
        anchor: "万平口、海滨森林公园、赶海、海鲜蒸汽锅",
      },
      {
        name: "平潭岛",
        scene: "海岛环线、风车海、蓝眼泪",
        road: "环岛路+村镇窄路，风大日晒强",
        car: "小型 SUV / 舒适轿车",
        people: "2-4 人；旅拍轻装足够",
        ev: "可考虑",
        tip: "追蓝眼泪别疲劳夜驾，海边风沙注意车门",
        anchor: "北部湾、长江澳、猴研岛、海蛎煎",
      },
      {
        name: "厦门/漳州",
        scene: "城市海岸、土楼、火山岛",
        road: "城市停车+高速+县道，景点分散",
        car: "舒适轿车 / SUV",
        people: "2-4 人；土楼一日线选 SUV 更稳",
        ev: "可考虑",
        tip: "厦门岛内停车贵，土楼线别当天排太满",
        anchor: "环岛路、云水谣、火山岛、沙茶面/姜母鸭",
      },
      {
        name: "海南环岛",
        scene: "海岛环线、亲子、冲浪、雨林",
        road: "高速免费+环岛路，景点间距离长",
        car: "SUV / 舒适轿车 / MPV",
        people: "2-5 人；亲子多人选 MPV 或 SUV",
        ev: "可考虑",
        tip: "异地还车和机场取还车费用提前算进预算",
        anchor: "万宁、陵水、三亚、文昌鸡/清补凉",
      },
    ],
  },
  {
    title: "江南 / 中部山水",
    subtitle: "城市周边、湖区、山水景区和古村落密集，停车与山路强度差异大。",
    tag: "山水短途",
    destinations: [
      {
        name: "杭州/千岛湖",
        scene: "城市+湖区+亲子短途",
        road: "城市拥堵+高速+湖边弯道",
        car: "舒适轿车 / SUV",
        people: "2-4 人；亲子行李多选 SUV",
        ev: "可考虑",
        tip: "杭州限行和酒店停车先确认",
        anchor: "西湖、千岛湖环湖、富阳桐庐、鱼头汤",
      },
      {
        name: "南京/皖南川藏线",
        scene: "城市历史、古村、山路自驾",
        road: "城市+高速+皖南山路，弯道多",
        car: "SUV / 舒适轿车",
        people: "2-4 人；山路新手选车身别太大",
        ev: "谨慎",
        tip: "皖南山路雨后谨慎，避开夜间穿越",
        anchor: "南京城墙、宏村、月亮湾、徽菜/鸭血粉丝",
      },
      {
        name: "苏州/太湖",
        scene: "园林、古镇、湖边周末游",
        road: "城市停车+湖边道路，短途密集",
        car: "紧凑车 / 舒适轿车",
        people: "2-4 人；停车优先选小车",
        ev: "可考虑",
        tip: "古镇停车步行距离要预留",
        anchor: "西山岛、东山、同里、苏帮菜/碧螺虾仁",
      },
      {
        name: "长沙及周边",
        scene: "城市美食、岳麓山、周边短途",
        road: "城市拥堵+高速，夜生活停车紧张",
        car: "舒适轿车 / 小型 SUV",
        people: "2-4 人；短途选轿车性价比高",
        ev: "可考虑",
        tip: "市区尽量选带停车酒店，别在夜市周边硬找车位",
        anchor: "橘子洲、岳麓山、靖港古镇、臭豆腐/茶颜",
      },
      {
        name: "桂林阳朔",
        scene: "喀斯特山水、骑行、亲子慢游",
        road: "高速+县道+景区窄路，电动车多",
        car: "舒适轿车 / SUV",
        people: "2-4 人；多人行李多选 SUV",
        ev: "可考虑",
        tip: "阳朔景区停车分散，民宿停车提前问",
        anchor: "遇龙河、十里画廊、兴坪、啤酒鱼/桂林米粉",
      },
      {
        name: "张家界",
        scene: "山地景区、玻璃桥、森林公园",
        road: "高速+山路，景区换乘多",
        car: "SUV / 舒适轿车",
        people: "2-4 人；山路多选 SUV 更舒服",
        ev: "谨慎",
        tip: "景区内不用车时间多，租车天数别浪费",
        anchor: "武陵源、天门山、大峡谷、三下锅",
      },
      {
        name: "恩施",
        scene: "峡谷、土司城、山地避暑",
        road: "高速+山路+隧道，雨雾多",
        car: "SUV / 中型 SUV",
        people: "2-4 人；满载优先 SUV",
        ev: "谨慎",
        tip: "山路和天气对时间影响大，留出机动日",
        anchor: "恩施大峡谷、鹿院坪、土家菜/合渣",
      },
      {
        name: "武功山",
        scene: "徒步、草甸、云海、周末短线",
        road: "高速+景区山路，停车集中",
        car: "舒适轿车 / 小型 SUV",
        people: "2-4 人；装备多选 SUV",
        ev: "可考虑",
        tip: "徒步后疲劳，返程别安排长时间夜驾",
        anchor: "金顶、发云界、萍乡小炒、露营装备",
      },
    ],
  },
];

const expectedDestinations = [
  "新疆伊犁环线",
  "青岛/胶东半岛",
  "丽江到香格里拉",
  "长沙及周边",
  "川西小环线",
  "成都周边",
  "重庆周边",
  "甘南环线",
  "大理环洱海",
  "海南环岛",
  "威海",
  "烟台",
  "大连",
  "秦皇岛/阿那亚",
  "杭州/千岛湖",
  "南京/皖南川藏线",
  "苏州/太湖",
  "厦门/漳州",
  "桂林阳朔",
  "贵阳/黔东南",
  "张家界",
  "恩施",
  "武功山",
  "呼伦贝尔",
  "阿尔山",
  "敦煌/河西走廊",
  "平潭岛",
  "日照",
  "延吉",
  "腾冲",
];

const budgetRows = [
  ["大交通", "机票/高铁往返；按人计算", "", "", "", "", "", "", "必选", "节假日建议先锁大交通，再定租车和酒店"],
  ["租车基础租金", "平台总价或日租价×天数×车辆数", "", "", "", "", "", "", "必选", "用最终支付页总价，不只看首页低价"],
  ["基础保险/补充保障", "基础保障+不计免赔/补充险；按天或订单", "", "", "", "", "", "", "建议", "山路、长线、海边旺季建议买足保障"],
  ["异地还车/手续费", "如机场取还、跨城还车、夜间服务费", "", "", "", "", "", "", "可选", "海南、新疆、河西等长线尤其要提前看"],
  ["油费/电费", "预估里程×油耗/电耗；也可直接填总额", "", "", "", "", "", "", "必选", "长线按 10%-15% 预留冗余"],
  ["过路费", "高速/桥隧费用；按路线估算", "", "", "", "", "", "", "必选", "海南高速免费但油价通常更高"],
  ["停车费", "酒店、景区、城市停车；按天或点位", "", "", "", "", "", "", "必选", "热门海边和古城停车费不要漏算"],
  ["酒店住宿", "房价×晚数×房间数", "", "", "", "", "", "", "必选", "带停车位的酒店优先级更高"],
  ["门票", "景区门票×人数", "", "", "", "", "", "", "可选", "免费景区也可能有摆渡车或预约成本"],
  ["景区项目/索道", "索道、船票、观光车、冲浪、骑马等", "", "", "", "", "", "", "可选", "把可玩可不玩的项目单独列出来"],
  ["饮食", "人均餐费×天数×人数", "", "", "", "", "", "", "必选", "特色餐可单独加一笔预算"],
  ["其他", "装备、洗车、儿童座椅、行李寄存等", "", "", "", "", "", "", "可选", "海岛/徒步/高原路线容易多出装备费"],
  ["预备金", "总预算 5%-10%，用于临时改线或补票", "", "", "", "", "", "", "建议", "新手第一趟建议一定留"],
];

const checklistRows = [
  ["预订前", "核对取还车点", "确认机场/高铁站/门店位置、营业时间、是否接驳", "截屏订单和门店地址", "取车点偏远会影响第一天行程", "", ""],
  ["预订前", "看清押金和违章押金", "区分车辆押金、违章押金、冻结/预授权", "保存平台规则页", "还车后资金解冻周期不同", "", ""],
  ["预订前", "确认保险范围", "看是否含基础险、免赔额、玻璃/轮胎/底盘保障", "保存保险说明", "山路和长线别只买最低保障", "", ""],
  ["柜台签约", "核对合同总价", "对比订单价、保险、服务费、异地还车费", "拍合同关键页", "现场加购项目容易漏看", "", ""],
  ["柜台签约", "核对车型和车牌", "车型级别、燃油/新能源、车牌与合同一致", "拍车牌和行驶证", "拿错车会影响后续理赔", "", ""],
  ["外观", "绕车一圈录视频", "从车头开始顺时针拍完整车身", "连续视频+重点照片", "旧划痕没记录可能被误算", "", ""],
  ["外观", "重点拍四角和底边", "保险杠、车门下沿、轮眉、后视镜、门把手", "近景照片", "这些位置最容易有小剐蹭", "", ""],
  ["轮胎玻璃", "检查轮胎胎面和鼓包", "看胎压、胎纹、侧壁鼓包、备胎/补胎工具", "拍四条轮胎", "爆胎和鼓包风险高", "", ""],
  ["轮胎玻璃", "检查玻璃和灯罩", "前挡、天窗、后挡、车灯是否有裂纹石子坑", "近景照片", "小裂纹很容易还车争议", "", ""],
  ["内饰功能", "检查座椅和内饰污损", "座椅、地毯、后备厢、儿童座椅是否完好", "拍内饰和后备厢", "污渍破损需提前备注", "", ""],
  ["内饰功能", "测试灯光雨刷空调", "远近光、转向灯、刹车灯、雨刷、空调冷暖", "录短视频", "雨天和夜路前必须确认", "", ""],
  ["内饰功能", "检查车机和充电口", "导航、蓝牙、USB/Type-C、手机支架位置", "拍仪表/车机", "长线导航和充电会高频使用", "", ""],
  ["油电里程", "拍油量/电量/里程", "记录取车时油表或电量、总里程、续航", "拍仪表盘", "还车油电标准要一致", "", ""],
  ["油电里程", "问清加油/充电规则", "满油满还、同电量归还、是否指定油品", "保存门店说明", "归还标准不清会产生补费", "", ""],
  ["试驾", "低速试刹车和方向", "起步、刹车、方向盘、异响、倒车影像", "异常立即录视频", "开出门店后再说更被动", "", ""],
  ["试驾", "确认导航和证件齐全", "行驶证、保险标、联系电话、救援电话", "拍证件存档", "路上遇检查或事故要用", "", ""],
  ["还车留证", "按约定时间还车", "预留加油、洗车、排队验车时间", "拍到店时间", "超时可能按小时/半天计费", "", ""],
  ["还车留证", "还车再拍一圈视频", "同取车角度拍车身、轮胎、玻璃、仪表", "连续视频+仪表照片", "避免离店后产生争议", "", ""],
  ["还车留证", "拿到结算凭证", "确认无新增损伤、费用明细、押金退还规则", "保存结算单", "离店前把疑问问清", "", ""],
];

function validateDestinations() {
  const actual = groups.flatMap((group) => group.destinations.map((item) => item.name));
  const missing = expectedDestinations.filter((name) => !actual.includes(name));
  const extra = actual.filter((name) => !expectedDestinations.includes(name));
  const duplicates = actual.filter((name, index) => actual.indexOf(name) !== index);
  if (actual.length !== 30 || missing.length || extra.length || duplicates.length) {
    throw new Error(
      `目的地校验失败：count=${actual.length}, missing=${missing.join(",")}, extra=${extra.join(",")}, duplicates=${duplicates.join(",")}`
    );
  }
}

function colName(index) {
  let name = "";
  let n = index;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function cellXml(cell, rowIndex, colIndex, defaultStyle) {
  const ref = `${colName(colIndex)}${rowIndex}`;
  const style = typeof cell === "object" && cell !== null && cell.s != null ? cell.s : defaultStyle;
  const styleAttr = style != null ? ` s="${style}"` : "";

  if (typeof cell === "object" && cell !== null && cell.f) {
    return `<c r="${ref}"${styleAttr}><f>${xmlEscape(cell.f)}</f></c>`;
  }

  const value = typeof cell === "object" && cell !== null && Object.prototype.hasOwnProperty.call(cell, "v") ? cell.v : cell;
  if (value === "" || value == null) {
    return `<c r="${ref}"${styleAttr}/>`;
  }
  if (typeof value === "number") {
    return `<c r="${ref}"${styleAttr}><v>${value}</v></c>`;
  }
  return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;
}

function worksheetXml(rows, options) {
  const colCount = Math.max(...rows.map((row) => row.length));
  const ref = `A1:${colName(colCount)}${rows.length}`;
  const cols = options.widths
    .map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
    .join("");
  const sheetRows = rows
    .map((row, rowIndex) => {
      const r = rowIndex + 1;
      const defaultStyle = r === 1 ? 1 : 2;
      const height = r === 1 ? 30 : options.rowHeight || 58;
      const cells = row.map((cell, colIndex) => cellXml(cell, r, colIndex + 1, defaultStyle)).join("");
      return `<row r="${r}" ht="${height}" customHeight="1">${cells}</row>`;
    })
    .join("");
  const freeze = options.freeze
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : "";
  const autoFilter = options.autoFilter ? `<autoFilter ref="${ref}"/>` : "";
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="${ref}"/>
  ${freeze}
  <cols>${cols}</cols>
  <sheetData>${sheetRows}</sheetData>
  ${autoFilter}
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><color rgb="FF24333A"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FF1B4B5A"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FF8A4B14"/><name val="Microsoft YaHei"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E6F67"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEAF5F2"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF2DA"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD6E1DF"/></left>
      <right style="thin"><color rgb="FFD6E1DF"/></right>
      <top style="thin"><color rgb="FFD6E1DF"/></top>
      <bottom style="thin"><color rgb="FFD6E1DF"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="5">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
}

function crc32(buffer) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    crc32.table = table;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function writeZip(files, dest) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, day } = dosDateTime();

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, "utf8");
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuffer, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuffer);
    offset += local.length + nameBuffer.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  fs.writeFileSync(dest, Buffer.concat([...localParts, ...centralParts, end]));
}

function buildWorkbook() {
  const destinationRows = [
    ["目的地", "主要场景", "路况关键词", "推荐车型", "适合人数", "新能源适配", "避坑提醒", "拍照/美食/游玩锚点"],
    ...groups.flatMap((group) =>
      group.destinations.map((item) => [
        item.name,
        item.scene,
        item.road,
        item.car,
        item.people,
        item.ev,
        item.tip,
        item.anchor,
      ])
    ),
  ];

  const budgetSheetRows = [
    ["费用项", "估算逻辑", "单价/总价", "数量/天数", "人数/车数", "预算金额", "实际金额", "差额", "是否必选", "备注"],
    ...budgetRows.map((row, index) => {
      const r = index + 2;
      return [
        row[0],
        row[1],
        { v: row[2], s: 4 },
        { v: row[3], s: 4 },
        { v: row[4], s: 4 },
        { f: `IF(OR(C${r}="",D${r}="",E${r}=""),"",C${r}*D${r}*E${r})`, s: 4 },
        { v: row[6], s: 4 },
        { f: `IF(OR(F${r}="",G${r}=""),"",G${r}-F${r})`, s: 4 },
        row[8],
        row[9],
      ];
    }),
  ];
  const totalRow = budgetSheetRows.length + 1;
  budgetSheetRows.push([
    { v: "合计", s: 3 },
    { v: "自动汇总；填入单价、数量、人数/车数后计算", s: 3 },
    { v: "", s: 3 },
    { v: "", s: 3 },
    { v: "", s: 3 },
    { f: `SUM(F2:F${totalRow - 1})`, s: 3 },
    { f: `SUM(G2:G${totalRow - 1})`, s: 3 },
    { f: `G${totalRow}-F${totalRow}`, s: 3 },
    { v: "", s: 3 },
    { v: "人均费用 = 合计金额 ÷ 出行人数；可在旁边自行添加人数格", s: 3 },
  ]);

  const checklistSheetRows = [
    ["阶段", "检查项", "怎么验", "拍照/视频留证", "风险点", "完成", "备注"],
    ...checklistRows,
  ];

  const files = [
    {
      name: "[Content_Types].xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="目的地选车参考表" sheetId="1" r:id="rId1"/>
    <sheet name="自驾旅行预算表" sheetId="2" r:id="rId2"/>
    <sheet name="租车取车验车清单" sheetId="3" r:id="rId3"/>
  </sheets>
  <calcPr calcId="0" fullCalcOnLoad="1"/>
</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { name: "xl/styles.xml", data: stylesXml() },
    {
      name: "xl/worksheets/sheet1.xml",
      data: worksheetXml(destinationRows, {
        widths: [22, 28, 30, 18, 24, 14, 36, 38],
        rowHeight: 66,
        freeze: true,
        autoFilter: true,
      }),
    },
    {
      name: "xl/worksheets/sheet2.xml",
      data: worksheetXml(budgetSheetRows, {
        widths: [18, 36, 15, 15, 15, 15, 15, 15, 12, 42],
        rowHeight: 58,
        freeze: true,
        autoFilter: true,
      }),
    },
    {
      name: "xl/worksheets/sheet3.xml",
      data: worksheetXml(checklistSheetRows, {
        widths: [14, 22, 42, 24, 32, 10, 24],
        rowHeight: 60,
        freeze: true,
        autoFilter: true,
      }),
    },
    {
      name: "docProps/core.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>小红书自驾工具包</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-05-12T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-05-12T00:00:00Z</dcterms:modified>
</cp:coreProperties>`,
    },
    {
      name: "docProps/app.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>3</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="3" baseType="lpstr"><vt:lpstr>目的地选车参考表</vt:lpstr><vt:lpstr>自驾旅行预算表</vt:lpstr><vt:lpstr>租车取车验车清单</vt:lpstr></vt:vector></TitlesOfParts>
  <Company/>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>`,
    },
  ];

  writeZip(files, path.join(outDir, "小红书自驾工具包.xlsx"));
}

const commonCss = `
* { box-sizing: border-box; }
html, body {
  margin: 0;
  width: ${PAGE_W}px;
  min-width: ${PAGE_W}px;
  height: ${PAGE_H}px;
  min-height: ${PAGE_H}px;
  overflow: hidden;
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif;
  color: #21343a;
  background: #f6faf7;
  letter-spacing: 0;
}
.page {
  position: relative;
  width: ${PAGE_W}px;
  height: ${PAGE_H}px;
  overflow: hidden;
  background: #f6faf7;
  border-top: 18px solid #1e6f67;
}
.brand {
  position: absolute;
  top: 45px;
  right: 64px;
  font-size: 25px;
  font-weight: 700;
  color: #1e6f67;
}
.page-number {
  position: absolute;
  top: 45px;
  left: 64px;
  font-size: 25px;
  color: #cf7831;
  font-weight: 800;
}
.kicker {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 18px;
  background: #fff2da;
  color: #9a551d;
  border: 2px solid #efc894;
  border-radius: 8px;
  font-size: 25px;
  font-weight: 800;
}
.header {
  padding: 100px 64px 24px;
}
h1 {
  margin: 22px 0 12px;
  font-size: 58px;
  line-height: 1.08;
  color: #183e4d;
  font-weight: 900;
  letter-spacing: 0;
}
.subtitle {
  width: 950px;
  font-size: 28px;
  line-height: 1.45;
  color: #51666b;
}
.table-wrap {
  margin: 22px 52px 0;
  background: #ffffff;
  border: 2px solid #d7e6e2;
  border-radius: 8px;
  overflow: hidden;
}
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
th {
  background: #1e6f67;
  color: #ffffff;
  font-size: 24px;
  line-height: 1.2;
  padding: 16px 12px;
  text-align: left;
  font-weight: 900;
}
td {
  border-top: 2px solid #e2ece9;
  border-right: 2px solid #e2ece9;
  vertical-align: top;
  padding: 14px 12px;
  font-size: 24px;
  line-height: 1.28;
  color: #263b40;
  word-break: break-word;
}
td:last-child, th:last-child { border-right: 0; }
tr:nth-child(even) td { background: #fbfdfb; }
.name-cell {
  font-weight: 900;
  color: #183e4d;
  font-size: 25px;
}
.pill {
  display: inline-block;
  border-radius: 8px;
  padding: 5px 8px;
  background: #eaf5f2;
  color: #1e6f67;
  font-weight: 900;
  font-size: 21px;
  margin-top: 6px;
}
.warn {
  color: #b05f1d;
  font-weight: 900;
}
.ok {
  color: #1e6f67;
  font-weight: 900;
}
.footer {
  position: absolute;
  left: 64px;
  right: 64px;
  bottom: 42px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  font-size: 24px;
  color: #5b6c70;
}
.footer strong {
  color: #183e4d;
}
`;

function pageHtml(inner, title) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8"/>
  <title>${htmlEscape(title)}</title>
  <style>${commonCss}</style>
</head>
<body>${inner}</body>
</html>`;
}

function writeHtml(name, html) {
  const file = path.join(htmlDir, name);
  fs.writeFileSync(file, html, "utf8");
  return file;
}

function destinationPage(group, index) {
  const rows = group.destinations
    .map((item) => {
      const evClass = item.ev === "可考虑" ? "ok" : "warn";
      return `<tr>
        <td class="name-cell">${htmlEscape(item.name)}<br><span class="pill">${htmlEscape(group.tag)}</span></td>
        <td>${htmlEscape(item.scene)}<br><span class="pill">${htmlEscape(item.road.split("，")[0])}</span></td>
        <td><strong>${htmlEscape(item.car)}</strong><br>${htmlEscape(item.people)}</td>
        <td class="${evClass}">${htmlEscape(item.ev)}</td>
        <td>${htmlEscape(item.tip)}<br><span class="pill">${htmlEscape(item.anchor.split("、").slice(0, 2).join(" / "))}</span></td>
      </tr>`;
    })
    .join("");
  return pageHtml(
    `<main class="page">
      <div class="page-number">0${index + 2}/07</div>
      <div class="brand">目的地自驾攻略</div>
      <section class="header">
        <div class="kicker">目的地选车参考表</div>
        <h1>${htmlEscape(group.title)}</h1>
        <div class="subtitle">${htmlEscape(group.subtitle)}</div>
      </section>
      <section class="table-wrap">
        <table class="dest-table">
          <colgroup>
            <col style="width: 18%">
            <col style="width: 25%">
            <col style="width: 22%">
            <col style="width: 10%">
            <col style="width: 25%">
          </colgroup>
          <thead>
            <tr><th>目的地</th><th>主要场景</th><th>推荐车型</th><th>新能源</th><th>避坑 + 锚点</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
      <div class="footer"><span>车型只给级别，不绑定品牌；实际按人数、行李、路况和天气微调。</span><strong>收藏前先看路况</strong></div>
    </main>`,
    `目的地选车参考表-${group.title}`
  );
}

function coverPage() {
  const chips = ["目的地选车", "预算拆分", "取车验车", "新手可直接照着用"];
  return pageHtml(
    `<main class="page cover">
      <style>
        .cover .hero { padding: 150px 78px 0; }
        .cover h1 { font-size: 84px; line-height: 1.08; width: 950px; margin-top: 28px; }
        .cover .subtitle { font-size: 34px; width: 950px; color: #3f565c; }
        .chips { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 42px; }
        .chip { border: 2px solid #d7e6e2; background: #fff; border-radius: 8px; padding: 15px 20px; font-size: 28px; font-weight: 900; color: #1e6f67; }
        .cover-grid { position: absolute; left: 78px; right: 78px; bottom: 150px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .mini { background: #ffffff; border: 2px solid #d7e6e2; border-radius: 8px; overflow: hidden; min-height: 330px; }
        .mini-title { background: #1e6f67; color: white; font-size: 28px; font-weight: 900; padding: 18px; }
        .mini-line { padding: 16px 18px; border-top: 2px solid #e2ece9; font-size: 25px; line-height: 1.25; color: #30474d; }
        .mini-line strong { color: #cf7831; }
      </style>
      <div class="page-number">01/07</div>
      <div class="brand">目的地自驾攻略</div>
      <section class="hero">
        <div class="kicker">首帖收藏版工具包</div>
        <h1>租车自驾出发前，先看这3张表</h1>
        <div class="subtitle">选什么车、预算怎么拆、取车怎么验，一次整理成可编辑表格和发布图。</div>
        <div class="chips">${chips.map((chip) => `<span class="chip">${htmlEscape(chip)}</span>`).join("")}</div>
      </section>
      <section class="cover-grid">
        <div class="mini"><div class="mini-title">01 目的地选车</div><div class="mini-line"><strong>30 个</strong>热门自驾目的地</div><div class="mini-line">SUV / 轿车 / MPV 怎么选</div><div class="mini-line">新能源适不适合一眼看</div></div>
        <div class="mini"><div class="mini-title">02 旅行预算</div><div class="mini-line">机票高铁 + 租车保险</div><div class="mini-line">油电费 / 过路费 / 停车费</div><div class="mini-line">酒店门票饮食不漏项</div></div>
        <div class="mini"><div class="mini-title">03 取车验车</div><div class="mini-line">绕车视频怎么拍</div><div class="mini-line">轮胎玻璃仪表重点看</div><div class="mini-line">还车留证减少扯皮</div></div>
      </section>
      <div class="footer"><span>可编辑版适合反复复用。</span><strong>评论/私信：自驾表</strong></div>
    </main>`,
    "租车自驾出发前，先看这3张表"
  );
}

function budgetPage() {
  const rows = [
    ["大交通", "机票/高铁往返", "按人填；先锁大交通"],
    ["租车及保险", "租金+基础险+补充保障", "看最终支付页总价"],
    ["油电/过路/停车", "里程+高速+景区停车", "长线预留 10%-15%"],
    ["酒店", "房价×晚数×房间数", "带停车位优先"],
    ["门票及项目", "门票+索道+船票+体验", "可玩可不玩单独列"],
    ["饮食", "人均餐费×天数×人数", "特色餐单独加预算"],
    ["其他和预备金", "装备/洗车/寄存/临时改线", "建议留 5%-10%"],
  ];
  const rowHtml = rows
    .map(
      (row) => `<tr><td class="name-cell">${htmlEscape(row[0])}</td><td>${htmlEscape(row[1])}</td><td>${htmlEscape(row[2])}</td></tr>`
    )
    .join("");
  return pageHtml(
    `<main class="page">
      <style>
        .budget-formula { margin: 26px 52px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .formula-box { background: #fff2da; border: 2px solid #efc894; border-radius: 8px; padding: 22px 24px; min-height: 150px; }
        .formula-box h2 { margin: 0 0 10px; font-size: 31px; color: #8a4b14; }
        .formula-box p { margin: 0; font-size: 27px; line-height: 1.35; color: #33494f; }
        .budget-note { margin: 22px 52px 0; padding: 22px 24px; background: #eaf5f2; border: 2px solid #c8ddd8; border-radius: 8px; font-size: 27px; line-height: 1.4; color: #24464a; }
        .budget-table td { font-size: 28px; padding: 20px 18px; }
        .budget-table th { font-size: 27px; }
      </style>
      <div class="page-number">06/07</div>
      <div class="brand">目的地自驾攻略</div>
      <section class="header">
        <div class="kicker">自驾旅行预算表</div>
        <h1>先拆费用，再决定怎么玩</h1>
        <div class="subtitle">别只看租车日租价；真正影响预算的是保险、油电、停车、酒店和项目。</div>
      </section>
      <section class="table-wrap">
        <table class="budget-table">
          <colgroup><col style="width:24%"><col style="width:42%"><col style="width:34%"></colgroup>
          <thead><tr><th>费用项</th><th>怎么估</th><th>新手提醒</th></tr></thead>
          <tbody>${rowHtml}</tbody>
        </table>
      </section>
      <section class="budget-formula">
        <div class="formula-box"><h2>总预算</h2><p>大交通 + 租车保险 + 油电过路停车 + 酒店 + 门票项目 + 饮食 + 其他</p></div>
        <div class="formula-box"><h2>人均费用</h2><p>总预算 ÷ 出行人数；多人同行别忘了停车、过路费按车分摊。</p></div>
      </section>
      <div class="budget-note">Excel 版已经留好“预算 / 实际 / 差额”公式，出发前填预算，回来后填实际，下一次选目的地会更准。</div>
      <div class="footer"><span>预算不是为了省到极限，是为了路上少被临时费用打乱。</span><strong>评论/私信：自驾表</strong></div>
    </main>`,
    "自驾旅行预算表"
  );
}

function checklistPage() {
  const blocks = [
    ["预订前", "取还车点、押金、保险范围、异地还车费"],
    ["柜台签约", "合同总价、车型车牌、加购项目、救援电话"],
    ["外观", "车身四角、门边底边、后视镜、保险杠"],
    ["轮胎玻璃", "胎压胎纹、鼓包、前挡石子坑、车灯裂纹"],
    ["内饰功能", "座椅污损、空调灯光、雨刷、车机充电口"],
    ["油电里程", "油量/电量、总里程、还车油电规则"],
    ["试驾", "刹车、方向、倒车影像、异常异响"],
    ["还车留证", "到店时间、还车视频、仪表照片、结算凭证"],
  ];
  const blockHtml = blocks
    .map(
      ([title, body], index) => `<div class="check-block">
        <div class="check-index">${String(index + 1).padStart(2, "0")}</div>
        <div><h2>${htmlEscape(title)}</h2><p>${htmlEscape(body)}</p></div>
      </div>`
    )
    .join("");
  return pageHtml(
    `<main class="page">
      <style>
        .check-grid { margin: 20px 52px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .check-block { display: grid; grid-template-columns: 72px 1fr; gap: 16px; min-height: 150px; background: #fff; border: 2px solid #d7e6e2; border-radius: 8px; padding: 20px 18px; }
        .check-index { width: 58px; height: 58px; border-radius: 8px; background: #1e6f67; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; }
        .check-block h2 { margin: 0 0 8px; font-size: 31px; color: #183e4d; }
        .check-block p { margin: 0; font-size: 27px; line-height: 1.33; color: #33494f; }
        .evidence { margin: 28px 52px 0; background: #fff2da; border: 2px solid #efc894; border-radius: 8px; padding: 24px; font-size: 29px; line-height: 1.4; color: #33494f; }
        .evidence strong { color: #8a4b14; }
      </style>
      <div class="page-number">07/07</div>
      <div class="brand">目的地自驾攻略</div>
      <section class="header">
        <div class="kicker">租车取车验车清单</div>
        <h1>别急着开走，先留证</h1>
        <div class="subtitle">新手取车最重要的不是懂车，而是把车况、规则和费用记录清楚。</div>
      </section>
      <section class="check-grid">${blockHtml}</section>
      <section class="evidence"><strong>拍照顺序：</strong>车头 → 右侧 → 车尾 → 左侧 → 四条轮胎 → 前挡/车灯 → 内饰 → 仪表盘。还车时按同样角度再拍一遍。</section>
      <div class="footer"><span>现场发现问题，先让门店写进验车单，再开出门。</span><strong>评论/私信：自驾表</strong></div>
    </main>`,
    "租车取车验车清单"
  );
}

function writeHtmlPages() {
  const pages = [
    ["01_封面.html", coverPage()],
    ...groups.map((group, index) => [`0${index + 2}_目的地选车_${index + 1}.html`, destinationPage(group, index)]),
    ["06_自驾旅行预算表.html", budgetPage()],
    ["07_租车取车验车清单.html", checklistPage()],
  ];
  for (const [name, html] of pages) {
    writeHtml(name, html);
  }
  return pages.map(([name]) => path.join(htmlDir, name));
}

function buildImageData() {
  return {
    static: {
      brand: "目的地自驾攻略",
      destinationKicker: "目的地选车参考表",
      destinationHeaders: ["目的地", "主要场景", "推荐车型", "新能源", "避坑 + 锚点"],
      destinationFooterLeft: "车型只给级别，不绑定品牌；实际按人数、行李、路况和天气微调。",
      destinationFooterRight: "收藏前先看路况",
      evOk: "可考虑",
    },
    cover: {
      file: "01_封面.png",
      kicker: "首帖收藏版工具包",
      title: "租车自驾出发前，\n先看这3张表",
      subtitle: "选什么车、预算怎么拆、取车怎么验，一次整理成可编辑表格和发布图。",
      chips: ["目的地选车", "预算拆分", "取车验车", "新手可直接照着用"],
      mini: [
        { title: "01 目的地选车", lines: ["30 个热门自驾目的地", "SUV / 轿车 / MPV 怎么选", "新能源适不适合一眼看"] },
        { title: "02 旅行预算", lines: ["机票高铁 + 租车保险", "油电费 / 过路费 / 停车费", "酒店门票饮食不漏项"] },
        { title: "03 取车验车", lines: ["绕车视频怎么拍", "轮胎玻璃仪表重点看", "还车留证减少扯皮"] },
      ],
      footerLeft: "可编辑版适合反复复用。",
      footerRight: "评论/私信：自驾表",
    },
    groups: groups.map((group, index) => ({
      file: [
        "02_目的地选车_西北草原边境.png",
        "03_目的地选车_西南高原山地.png",
        "04_目的地选车_华东沿海海岛.png",
        "05_目的地选车_江南中部山水.png",
      ][index],
      title: group.title,
      subtitle: group.subtitle,
      tag: group.tag,
      destinations: group.destinations.map((item) => ({
        name: item.name,
        scene: item.scene,
        roadShort: item.road.split("，")[0],
        car: item.car,
        people: item.people,
        peopleShort: item.people.split("；")[0],
        ev: item.ev,
        tip: item.tip,
        anchorShort: item.anchor.split("、").slice(0, 2).join(" / "),
      })),
    })),
    budget: {
      file: "06_自驾旅行预算表.png",
      kicker: "自驾旅行预算表",
      title: "先拆费用，再决定怎么玩",
      subtitle: "别只看租车日租价；真正影响预算的是保险、油电、停车、酒店和项目。",
      headers: ["费用项", "怎么估", "新手提醒"],
      rows: [
        { item: "大交通", method: "机票/高铁往返", tip: "按人填；先锁大交通" },
        { item: "租车及保险", method: "租金+基础险+补充保障", tip: "看最终支付页总价" },
        { item: "油电/过路/停车", method: "里程+高速+景区停车", tip: "长线预留 10%-15%" },
        { item: "酒店", method: "房价×晚数×房间数", tip: "带停车位优先" },
        { item: "门票及项目", method: "门票+索道+船票+体验", tip: "可玩可不玩单独列" },
        { item: "饮食", method: "人均餐费×天数×人数", tip: "特色餐单独加预算" },
        { item: "其他和预备金", method: "装备/洗车/寄存/临时改线", tip: "建议留 5%-10%" },
      ],
      formulas: [
        { title: "总预算", body: "大交通+租车保险\n油电+酒店+门票+饮食" },
        { title: "人均费用", body: "总预算÷人数\n停车费按车分摊" },
      ],
      note: "Excel 版已留好“预算 / 实际 / 差额”公式，出发前填预算，回来后填实际。",
      footerLeft: "预算不是为了省到极限，是为了路上少被临时费用打乱。",
      footerRight: "评论/私信：自驾表",
    },
    checklist: {
      file: "07_租车取车验车清单.png",
      kicker: "租车取车验车清单",
      title: "别急着开走，先留证",
      subtitle: "新手取车最重要的不是懂车，而是把车况、规则和费用记录清楚。",
      blocks: [
        { title: "预订前", body: "取还点、押金、保险、异地费" },
        { title: "柜台签约", body: "合同总价、车型车牌、加购项目" },
        { title: "外观", body: "四角、门边底边、后视镜、保险杠" },
        { title: "轮胎玻璃", body: "胎压胎纹、鼓包、玻璃石子坑" },
        { title: "内饰功能", body: "座椅、空调灯光、雨刷、充电口" },
        { title: "油电里程", body: "油量/电量、总里程、还车油电规则" },
        { title: "试驾", body: "刹车、方向、倒车影像、异常异响" },
        { title: "还车留证", body: "到店时间、还车视频、仪表照片" },
      ],
      evidence: "拍照顺序：车头 → 右侧 → 车尾 → 左侧 → 四条轮胎 → 前挡/车灯 → 内饰 → 仪表盘。还车时按同样角度再拍一遍。",
      notice: "现场发现问题，先让门店写进验车单，再开出门。",
      footerLeft: "验车不是找茬，是把责任边界拍清楚。",
      footerRight: "评论/私信：自驾表",
    },
  };
}

function encodedPowerShell(command) {
  return Buffer.from(command, "utf16le").toString("base64");
}

function renderPngPages() {
  const dataPath = path.join(outDir, "image-data.json");
  fs.writeFileSync(dataPath, JSON.stringify(buildImageData(), null, 2), "utf8");
  const scriptPath = path.join(root, "tools", "draw-xhs-images.ps1");
  const command = `& '${scriptPath.replace(/'/g, "''")}' -DataPath '${dataPath.replace(/'/g, "''")}' -OutDir '${outDir.replace(/'/g, "''")}'`;
  execFileSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encodedPowerShell(command)], {
    stdio: "pipe",
  });
}

function readPngSize(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`${file} 不是 PNG 文件`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    size: buffer.length,
  };
}

function validateOutputs() {
  const workbook = path.join(outDir, "小红书自驾工具包.xlsx");
  if (!fs.existsSync(workbook) || fs.statSync(workbook).size < 10000) {
    throw new Error("Excel 文件生成失败或体积异常。");
  }

  const pngFiles = fs
    .readdirSync(outDir)
    .filter((name) => /^0[1-7]_.*\.png$/.test(name))
    .sort()
    .map((name) => path.join(outDir, name));
  if (pngFiles.length !== 7) {
    throw new Error(`图片数量异常：${pngFiles.length}`);
  }
  for (const file of pngFiles) {
    const info = readPngSize(file);
    if (info.width !== PAGE_W || info.height !== PAGE_H || info.size < 50000) {
      throw new Error(`${path.basename(file)} 尺寸或体积异常：${info.width}x${info.height}, ${info.size}`);
    }
  }
}

function main() {
  validateDestinations();
  ensureDir(outDir);
  ensureDir(htmlDir);
  const staleChromeProfile = path.join(outDir, "_chrome_profile");
  if (fs.existsSync(staleChromeProfile)) {
    fs.rmSync(staleChromeProfile, { recursive: true, force: true });
  }
  for (const file of fs.readdirSync(outDir)) {
    if (/^0[1-7]_.*\.png$/.test(file)) {
      fs.unlinkSync(path.join(outDir, file));
    }
  }
  buildWorkbook();
  writeHtmlPages();
  renderPngPages();
  validateOutputs();
  console.log("生成完成：Excel 1 个，PNG 7 张，HTML 源文件 7 个。");
}

main();
