export const STATUS_OPTIONS = [
  { value: 'unchecked', label: '未检查' },
  { value: 'ok', label: '正常' },
  { value: 'issue', label: '有问题' },
  { value: 'na', label: '不适用' },
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
        advice: '检查日租金、保险、服务费、异地还车费、手续费是否和下单页一致。',
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
    title: '车身外观检查',
    items: [
      {
        id: 'bodyVideo',
        title: '绕车一圈视频留证',
        advice: '从车头开始顺时针拍完整视频，车牌、门店环境和车身四面都入镜。',
        risk: '高',
      },
      {
        id: 'bumper',
        title: '前后保险杠与车身四角',
        advice: '重点看剐蹭、凹陷、补漆、底边刮痕，发现后让门店写进验车单。',
        risk: '高',
      },
      {
        id: 'doors',
        title: '车门边缘与门把手',
        advice: '门边、门槛、把手附近容易有小划痕，拍近景照片留证。',
        risk: '中',
      },
      {
        id: 'mirrorsLights',
        title: '后视镜、车灯和玻璃',
        advice: '检查灯罩裂纹、前挡石子坑、后视镜外壳破损和玻璃贴膜气泡。',
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
    title: '轮胎轮毂检查',
    items: [
      {
        id: 'tirePressure',
        title: '胎压和仪表胎压报警',
        advice: '启动后看胎压报警灯，长线自驾前胎压异常要现场处理。',
        risk: '高',
      },
      {
        id: 'tirePattern',
        title: '胎纹深度和磨损程度',
        advice: '看四条轮胎磨损是否严重、是否偏磨，雨雪路面尤其重要。',
        risk: '高',
      },
      {
        id: 'tireDamage',
        title: '鼓包、裂纹和扎钉',
        advice: '轮胎侧壁鼓包、裂纹、扎钉都要拍照并要求换车或处理。',
        risk: '高',
      },
      {
        id: 'wheelRim',
        title: '轮毂剐蹭和变形',
        advice: '轮毂边缘常被追责，四个轮毂都拍近景。',
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
    title: '车内功能检查',
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
        advice: '低速试一下刹车和方向盘，明显异响或跑偏要立刻反馈。',
        risk: '高',
      },
      {
        id: 'acLights',
        title: '空调、灯光、雨刷',
        advice: '检查空调冷热风、远近光、转向灯、雨刷和除雾功能。',
        risk: '中',
      },
      {
        id: 'seatInterior',
        title: '座椅、内饰污损和异味',
        advice: '拍下座椅污渍、破损、烟味或宠物毛，避免还车纠纷。',
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
        advice: '确认基础险、补充险、免赔范围和事故报案方式。',
        risk: '高',
      },
      {
        id: 'warningTriangle',
        title: '三角警示牌',
        advice: '检查车内是否有三角警示牌，长途高速必备。',
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
        advice: '重点看轮胎、玻璃、底盘、涉水、单方事故是否覆盖。',
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
        title: '救援、拖车和事故处理费用',
        advice: '问清事故报案流程、救援是否免费、拖车费用谁承担。',
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
        advice: '检查后备厢、座椅缝、充电线、证件，简单清理明显垃圾。',
        risk: '低',
      },
      {
        id: 'settlement',
        title: '结算单和押金退还记录',
        advice: '确认无新增费用后再离店，保存结算单、退押金说明和客服记录。',
        risk: '高',
      },
    ],
  },
];

export const quickChecklistModules = [
  {
    id: 'quickScene',
    title: '3 分钟快速验车',
    items: [
      {
        id: 'bodyVideo',
        title: '车身一圈视频',
        advice: '从车头开始顺时针拍完整视频，车牌、四面车身和门店环境都入镜。',
        risk: '高',
      },
      {
        id: 'quickFrontBumper',
        title: '前保险杠',
        advice: '拍清前杠、前唇、左右边角，有刮痕要让门店写进验车单。',
        risk: '高',
      },
      {
        id: 'quickRearBumper',
        title: '后保险杠',
        advice: '拍清后杠、尾门下沿和倒车雷达周围，避免还车被追责。',
        risk: '高',
      },
      {
        id: 'quickTires',
        title: '四个轮胎',
        advice: '看胎面、胎侧、鼓包、裂纹和扎钉，四条轮胎都拍近景。',
        risk: '高',
      },
      {
        id: 'quickWheelRims',
        title: '四个轮毂',
        advice: '轮毂外圈剐蹭最容易扯皮，四个轮毂都拍清楚。',
        risk: '高',
      },
      {
        id: 'quickWindshield',
        title: '前挡风玻璃',
        advice: '重点看石子坑、裂纹和明显划痕，拍近景留证。',
        risk: '高',
      },
      {
        id: 'quickMirrors',
        title: '后视镜',
        advice: '检查外壳、镜片、折叠功能，破损要现场确认。',
        risk: '高',
      },
      {
        id: 'quickBottom',
        title: '底盘可见区域',
        advice: '蹲下拍前唇、侧裙和后杠下沿，低底盘车尤其要看。',
        risk: '高',
      },
      {
        id: 'quickEnergyLevel',
        title: '仪表盘油量/电量',
        advice: '取车前拍仪表盘，确认油量/电量和合同还车规则一致。',
        risk: '高',
      },
      {
        id: 'quickMileage',
        title: '当前里程',
        advice: '拍下当前总里程，确认是否限制里程和超里程费用。',
        risk: '高',
      },
      {
        id: 'dashboard',
        title: '仪表盘故障灯',
        advice: '启动后确认发动机、电池、刹车、胎压等报警灯是否熄灭。',
        risk: '高',
      },
      {
        id: 'quickDepositAmount',
        title: '押金金额',
        advice: '确认车辆押金和违章押金分别是多少，截图保存。',
        risk: '高',
      },
      {
        id: 'quickDepositReturn',
        title: '押金退还时间',
        advice: '问清冻结多久、什么时候退、违章押金多久解冻。',
        risk: '高',
      },
      {
        id: 'insuranceCopy',
        title: '保险责任',
        advice: '确认基础险、补充险、免赔范围和事故报案方式。',
        risk: '高',
      },
      {
        id: 'quickTireWheelCoverage',
        title: '轮胎轮毂是否赔付',
        advice: '轮胎轮毂常被排除在保险外，一定要问清是否覆盖。',
        risk: '高',
      },
      {
        id: 'quickGlassCoverage',
        title: '玻璃是否赔付',
        advice: '确认前挡、侧窗、天窗玻璃单独破损是否赔付。',
        risk: '高',
      },
      {
        id: 'returnFuel',
        title: '还车油量/电量要求',
        advice: '确认满油满还、同电量还，还是按门店规则结算。',
        risk: '高',
      },
      {
        id: 'settlement',
        title: '还车凭证',
        advice: '还车时拿到结算单或还车记录，保存费用确认和押金说明。',
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
