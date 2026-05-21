export const STATUS_OPTIONS = [
  { value: 'unchecked', label: '还没确认' },
  { value: 'ok', label: '已确认没问题' },
  { value: 'issue', label: '需拍照留证' },
  { value: 'na', label: '本项不用看' },
];

export const checklistModules = [
  {
    id: 'beforePickup',
    title: '取车前确认',
    items: [
      {
        id: 'pickupPoint',
        title: '确认取还车门店与营业时间',
        advice: '核对取车点、还车点、机场/高铁站接驳方式，避免到店后找不到柜台。',
        risk: '中',
      },
      {
        id: 'driverLicense',
        title: '证件与驾驶人资格',
        advice: '带好身份证、驾驶证、信用卡或免押授权账号，确认是否允许多人驾驶。',
        risk: '高',
      },
      {
        id: 'carModel',
        title: '车型、座位数和行李空间',
        advice: '确认实际车型级别、座位数、后备厢空间，人数多时不要只看低价车型。',
        risk: '中',
      },
      {
        id: 'pickupContract',
        title: '订单总价与加购项目',
        advice: '核对日租金、保险、服务费、异地还车费、手续费是否和下单页一致。',
        risk: '高',
      },
      {
        id: 'fuelPolicy',
        title: '油量/电量还车规则',
        advice: '确认满油满还、同电量还，还是按门店规则结算，拍下取车仪表。',
        risk: '高',
      },
    ],
  },
  {
    id: 'exterior',
    title: '车身外观留证',
    items: [
      {
        id: 'bodyVideo',
        title: '车身一圈视频',
        advice: '从车头开始绕车一圈，拍清车身四面和整体车况。',
        risk: '高',
      },
      {
        id: 'bumper',
        title: '前后保险杠与车身四角',
        advice: '重点拍边角、底部和已有划痕，方便还车时核对。',
        risk: '高',
      },
      {
        id: 'doors',
        title: '车门边缘与门把手',
        advice: '门边、门槛、把手附近容易有小划痕，建议拍近景照片留证。',
        risk: '中',
      },
      {
        id: 'mirrorsLights',
        title: '后视镜、车灯和玻璃',
        advice: '拍清灯罩裂纹、前挡石子坑、后视镜外壳和玻璃贴膜气泡。',
        risk: '高',
      },
      {
        id: 'roofBottom',
        title: '车顶、底边和前唇',
        advice: 'SUV、MPV 也要看车顶；低底盘车重点看前唇和侧裙。',
        risk: '中',
      },
    ],
  },
  {
    id: 'tires',
    title: '轮胎轮毂留证',
    items: [
      {
        id: 'tirePressure',
        title: '胎压和仪表胎压报警',
        advice: '启动后看胎压报警灯，长线自驾前如有异常，建议现场确认处理方式。',
        risk: '高',
      },
      {
        id: 'tirePattern',
        title: '胎纹深度和磨损程度',
        advice: '拍四条轮胎的胎纹和磨损情况，雨雪路面出行前建议多确认一遍。',
        risk: '高',
      },
      {
        id: 'tireDamage',
        title: '鼓包、裂纹和扎钉',
        advice: '轮胎侧壁鼓包、裂纹、扎钉建议拍清楚，并和门店确认是否需要换车或处理。',
        risk: '高',
      },
      {
        id: 'wheelRim',
        title: '轮毂剐蹭和变形',
        advice: '轮毂剐蹭比较常见，建议四个轮毂都单独拍清楚。',
        risk: '中',
      },
      {
        id: 'spareTire',
        title: '备胎或补胎工具',
        advice: '确认是否有备胎、补胎液、充气泵，新能源车尤其要问清救援方式。',
        risk: '中',
      },
    ],
  },
  {
    id: 'interior',
    title: '车内功能确认',
    items: [
      {
        id: 'dashboard',
        title: '仪表盘报警灯',
        advice: '启动后确认发动机、电池、刹车、胎压等报警灯是否熄灭。',
        risk: '高',
      },
      {
        id: 'brakeSteer',
        title: '刹车、方向和异响',
        advice: '低速试一下刹车和方向盘，如有明显异响或跑偏，建议及时反馈门店。',
        risk: '高',
      },
      {
        id: 'acLights',
        title: '空调、灯光、雨刷',
        advice: '确认空调冷热风、远近光、转向灯、雨刷和除雾功能能正常使用。',
        risk: '中',
      },
      {
        id: 'seatInterior',
        title: '座椅、内饰污损和异味',
        advice: '拍下座椅污渍、破损、烟味或宠物毛，减少还车时反复沟通。',
        risk: '低',
      },
      {
        id: 'cameraPorts',
        title: '倒车影像、车机和充电口',
        advice: '确认导航、蓝牙、倒车影像、USB/Type-C 充电口能正常使用。',
        risk: '中',
      },
    ],
  },
  {
    id: 'docsTools',
    title: '随车证件与工具',
    items: [
      {
        id: 'vehicleLicense',
        title: '行驶证和车辆信息',
        advice: '确认行驶证、车牌、合同车辆信息一致，拍下合同中的车牌页。',
        risk: '高',
      },
      {
        id: 'insuranceCopy',
        title: '保险凭证或保险说明',
        advice: '确认基础险、补充险、免赔范围和特殊情况报案方式。',
        risk: '高',
      },
      {
        id: 'warningTriangle',
        title: '三角警示牌',
        advice: '确认车内是否有三角警示牌，长途高速出行建议提前看一眼。',
        risk: '中',
      },
      {
        id: 'reflectiveVest',
        title: '反光背心与救援电话',
        advice: '确认反光背心位置，保存门店和道路救援电话。',
        risk: '中',
      },
      {
        id: 'chargingCable',
        title: '新能源充电线或转换说明',
        advice: '租新能源时问清充电方式、补能 App、还车电量规则。',
        risk: '中',
      },
    ],
  },
  {
    id: 'insuranceFees',
    title: '保险与费用确认',
    items: [
      {
        id: 'deposit',
        title: '车辆押金和违章押金',
        advice: '确认冻结金额、解冻时间、违章押金退还周期，截图保存。',
        risk: '高',
      },
      {
        id: 'deductible',
        title: '免赔额和不赔范围',
        advice: '建议确认轮胎、玻璃、底盘、涉水、单方情况等是否覆盖。',
        risk: '高',
      },
      {
        id: 'extraDriver',
        title: '额外驾驶人费用',
        advice: '多人换开时确认是否需要登记额外驾驶人，未登记可能影响理赔。',
        risk: '中',
      },
      {
        id: 'overTime',
        title: '超时还车和超里程规则',
        advice: '确认超时计费、免费宽限时间、是否限制里程。',
        risk: '中',
      },
      {
        id: 'rescueFee',
        title: '救援、拖车和特殊情况费用',
        advice: '问清报案流程、救援是否免费、拖车费用谁承担，方便需要时快速处理。',
        risk: '高',
      },
    ],
  },
  {
    id: 'returnCar',
    title: '还车前确认',
    items: [
      {
        id: 'returnFuel',
        title: '还车油量/电量',
        advice: '按合同规则补足油电，拍还车仪表和加油/充电记录。',
        risk: '高',
      },
      {
        id: 'returnVideo',
        title: '还车绕车视频',
        advice: '按取车同样角度拍车头、右侧、车尾、左侧、轮胎和内饰。',
        risk: '高',
      },
      {
        id: 'parkingLocation',
        title: '还车位置和到店时间',
        advice: '拍下车辆停放位置、门店招牌、到店时间，尤其是自助还车。',
        risk: '中',
      },
      {
        id: 'belongings',
        title: '个人物品和车内清洁',
        advice: '确认后备厢、座椅缝、充电线、证件，顺手清理明显垃圾。',
        risk: '低',
      },
      {
        id: 'settlement',
        title: '结算单和押金退还记录',
        advice: '确认结算信息后再离店，保存结算单、退押金说明和客服记录。',
        risk: '高',
      },
    ],
  },
];

export const quickChecklistModules = [
  {
    id: 'quickScene',
    title: '省心版：8 项必拍',
    items: [
      {
        id: 'bodyVideo',
        title: '车身一圈视频',
        advice: '从车头开始绕车一圈，拍清车身四面和整体车况。',
        risk: '高',
      },
      {
        id: 'quickBumpers',
        title: '前后保险杠',
        advice: '重点拍边角、底部和已有划痕，方便还车时核对。',
        risk: '高',
      },
      {
        id: 'quickWheelRims',
        title: '四个轮毂',
        advice: '轮毂剐蹭很常见，建议单独拍清楚。',
        risk: '高',
      },
      {
        id: 'quickTires',
        title: '四条轮胎',
        advice: '拍胎壁、胎纹、鼓包、破损和明显磨损。',
        risk: '高',
      },
      {
        id: 'quickWindshield',
        title: '前挡玻璃和车窗',
        advice: '拍裂纹、石子坑和明显划痕。',
        risk: '高',
      },
      {
        id: 'quickMirrorsLights',
        title: '后视镜和车灯',
        advice: '拍后视镜外壳、灯罩裂纹和灯光状态。',
        risk: '高',
      },
      {
        id: 'quickInteriorSeats',
        title: '内饰与座椅',
        advice: '拍座椅污渍、破损、中控区域和后排情况。',
        risk: '高',
      },
      {
        id: 'quickEnergyMileage',
        title: '油量/电量 + 里程',
        advice: '拍仪表盘，记录取车时油量或电量和当前里程。',
        risk: '高',
      },
    ],
  },
];

export const flatChecklistItems = checklistModules.flatMap((module) =>
  module.items.map((item) => ({ ...item, moduleId: module.id, moduleTitle: module.title })),
);

export const flatQuickChecklistItems = quickChecklistModules.flatMap((module) =>
  module.items.map((item) => ({ ...item, moduleId: module.id, moduleTitle: module.title })),
);

export const allChecklistItems = Array.from(
  new Map([...flatChecklistItems, ...flatQuickChecklistItems].map((item) => [item.id, item])).values(),
);
