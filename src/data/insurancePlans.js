/**
 * 三大租车平台保险/保障方案结构化数据
 *
 * 数据来源：《三大热门租车平台租车服务与保险保障汇总.md》
 * 整理日期：2026-05-19
 *
 * 重要提示：所有保险内容仅供出行前参考，具体权益、免责条件、理赔流程
 * 以下单页展示的合同、保障说明和保险条款为准。
 */

// ============================================================================
// 统一免责声明
// ============================================================================

export const INSURANCE_DISCLAIMER =
  '以上保障内容整理自平台公开页面与用户截图，仅供出行前参考。具体权益、免责条件、理赔流程和费用以下单页展示的合同、保障说明和保险条款为准。';

// ============================================================================
// 一、平台信息
// ============================================================================

export const INSURANCE_PLATFORMS = [
  {
    id: 'ctrip',
    name: '携程租车',
    aliases: ['携程', '携程租车', 'ctrip', '携程旅行'],
    type: 'OTA 聚合型租车平台',
    summary:
      '覆盖国内外租车供应商，强调交通枢纽取还、免押、无忧租、一口价等标准化服务。下单页需核对供应商资质、适用保障包名称、停运费/折旧费、三者额度、车损是否全免。',
    serviceFeatures: [
      '覆盖全球 200+ 国家和地区、15 万+ 门店',
      'App/微信/支付宝入口，下单后由具体供应商履约',
      '多国提供租车免押金服务',
      '部分商户/无忧租产品支持送取车上门',
      '平台客服 + 商户履约，事故涉及多方协同',
    ],
  },
  {
    id: '1hai',
    name: '一嗨租车',
    aliases: ['一嗨', '一嗨租车', '1hai', '一嗨出行'],
    type: '直营租车平台',
    summary:
      '全国直营服务网络，支持 APP/官网订车、异地还车、全城送车、自助取还、0 元车辆押金。官方帮助中心清楚列出基本保障服务费；补充保障含尊享保障、尊享守护、百万守护、全程无忧、乘客守护等。',
    serviceFeatures: [
      '直营服务网点遍布全国 500+ 城市',
      '官网/App 预订，直营门店、全城送车、自助取还',
      '车辆押金 0 元（部分渠道以页面为准）',
      '支持同城异门店/异地还车',
      '官方客服 400-888-6608',
    ],
  },
  {
    id: 'shenzhou',
    name: '神州租车',
    aliases: ['神州', '神州租车', 'shenzhou', '神州出行'],
    type: '直营租车平台',
    summary:
      '全国直营网点、APP 取还、自助取还、异地还车、送取车上门、芝麻免押等。手机端截图显示七类出行保障。重点核对三者额度、司乘额度、轮胎单独损失、医保外医疗费用、保险拒赔和不予赔偿条款。',
    serviceFeatures: [
      '全国约 6500 网点、19 万+ 车辆',
      'App 预订、门店取还、自助取还',
      '芝麻分满足条件可享双重免押',
      '支持同城异店、异地还车',
      '客服热线 400 616 6666',
    ],
  },
];

// ============================================================================
// 二、保险方案信息
// ============================================================================

/**
 * 保障层级
 *   basic      — 基础保障（通常随订单必选）
 *   standard   — 中等保障（基础上升级部分维度）
 *   premium    — 高保障（接近全险，多维度客户承担 0）
 *   special    — 特殊标签产品（如无忧租一口价）
 */

/**
 * 方案类型
 *   required          — 随订单必选/基础保障
 *   optional          — 可选保障，需单独购买
 *   labeledProduct    — 标签产品（非独立方案，是平台标准化标签）
 */

export const INSURANCE_PLANS = [
  // ==========================================================================
  // 携程租车 — 第一组：基础保障 / 优享保障 / 尊享保障
  // 来源：用户提供携程 App 保障详情截图（文档 3A）
  // ==========================================================================

  {
    id: 'ctrip-basic-1',
    platform: '携程租车',
    platformId: 'ctrip',
    name: '基础保障',
    groupName: '第一组（基础/优享/尊享）',
    tier: 'basic',
    requiredType: 'optional',
    purchaseNote: '仅支持取车前购买；续租时只能购买与原订单相同的服务',
    vehicleDamage: {
      summary: '保额为车辆实际价值；保司及车行承担 1500 元以上部分；客户承担 1500 元及以下部分',
      customerPay: '1500 元及以下',
      covered: '1500 元以上',
      includesGlass: true,
      includesScratch: false,
    },
    thirdParty: {
      amount: 50,
      unit: '万元',
      note: '客户承担 50 万以上部分',
    },
    tireWheel: {
      covered: false,
      note: '无车轮损失保额，客户承担全部损失',
    },
    glass: {
      covered: true,
      note: '车辆损失保障含单独玻璃破损损失',
    },
    downtime: {
      covered: false,
      note: '无保额，客户承担全部停运损失',
    },
    depreciation: {
      covered: '部分',
      note: '车损不超过 5000 元时客户承担 0 元；车损超过 5000 元时客户承担车损总额的 20%',
    },
    driverPassenger: {
      driver: null,
      passenger: null,
      note: '该组方案截图中未显示司乘保障',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: true,
      note: '需垫付',
    },
    theft: {
      covered: false,
      note: '未显示车辆盗抢险',
    },
    scrapLoss: {
      covered: '部分',
      note: '保司核定理赔金额由保司及车行承担；客户承担核定车辆价值（事故前）减保司核定理赔金额',
    },
    sourceConfidence: '用户截图',
    confidenceNote: '手机端截图显示，不同城市/车型/供应商可能存在差异',
  },
  {
    id: 'ctrip-medium-1',
    platform: '携程租车',
    platformId: 'ctrip',
    name: '优享保障',
    groupName: '第一组（基础/优享/尊享）',
    tier: 'standard',
    requiredType: 'optional',
    purchaseNote: '仅支持取车前购买；续租时只能购买与原订单相同的服务',
    vehicleDamage: {
      summary: '保额为车辆实际价值；保司及车行承担全部损失；客户承担 0 元',
      customerPay: '0 元',
      covered: '全部',
      includesGlass: true,
      includesScratch: false,
    },
    thirdParty: {
      amount: 100,
      unit: '万元',
      note: '客户承担 100 万以上部分',
    },
    tireWheel: {
      covered: false,
      note: '无车轮损失保额，客户承担全部损失',
    },
    glass: {
      covered: true,
      note: '车辆损失保障含单独玻璃破损损失',
    },
    downtime: {
      covered: false,
      note: '无保额，客户承担全部停运损失',
    },
    depreciation: {
      covered: '部分',
      note: '车损不超过 5000 元时客户承担 0 元；车损超过 5000 元时客户承担车损总额的 20%',
    },
    driverPassenger: {
      driver: null,
      passenger: null,
      note: '该组方案截图中未显示司乘保障',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: true,
      note: '需垫付',
    },
    theft: {
      covered: false,
      note: '未显示车辆盗抢险',
    },
    scrapLoss: {
      covered: '部分',
      note: '同基础保障',
    },
    sourceConfidence: '用户截图',
    confidenceNote: '手机端截图显示，不同城市/车型/供应商可能存在差异',
  },
  {
    id: 'ctrip-premium-1',
    platform: '携程租车',
    platformId: 'ctrip',
    name: '尊享保障',
    groupName: '第一组（基础/优享/尊享）',
    tier: 'premium',
    requiredType: 'optional',
    purchaseNote: '仅支持取车前购买；续租时只能购买与原订单相同的服务',
    vehicleDamage: {
      summary: '保额为车辆实际价值；保司及车行承担全部损失；客户承担 0 元',
      customerPay: '0 元',
      covered: '全部',
      includesGlass: true,
      includesScratch: false,
    },
    thirdParty: {
      amount: 150,
      unit: '万元',
      note: '客户承担 150 万以上部分',
    },
    tireWheel: {
      covered: true,
      note: '保额为车轮损失；保司及车行承担全部损失；客户承担 0 元',
    },
    glass: {
      covered: true,
      note: '车辆损失保障含单独玻璃破损损失',
    },
    downtime: {
      covered: '部分',
      note: '保额 1 万；车行承担 1 万；客户承担 1 万以上部分',
    },
    depreciation: {
      covered: '部分',
      note: '车损不超过 3 万元时客户承担 0 元；车损超过 3 万元时客户承担车损总额的 20%',
    },
    driverPassenger: {
      driver: null,
      passenger: null,
      note: '该组方案截图中未显示司乘保障',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: false,
      note: '无需垫付',
    },
    theft: {
      covered: false,
      note: '未显示车辆盗抢险',
    },
    scrapLoss: {
      covered: '部分',
      note: '同基础保障',
    },
    sourceConfidence: '用户截图',
    confidenceNote: '手机端截图显示，不同城市/车型/供应商可能存在差异',
  },

  // ==========================================================================
  // 携程租车 — 第二组：基础安心 / 剐蹭无忧 / 全程无忧
  // 来源：用户提供携程 App 保障详情截图（文档 3B）
  // ==========================================================================

  {
    id: 'ctrip-basic-2',
    platform: '携程租车',
    platformId: 'ctrip',
    name: '基础安心',
    groupName: '第二组（基础安心/剐蹭无忧/全程无忧）',
    tier: 'basic',
    requiredType: 'optional',
    purchaseNote: '仅支持取车前购买；续租时只能购买与原订单相同的服务',
    vehicleDamage: {
      summary: '保额为车辆实际价值；保司及车行承担 1500 元以上部分；客户承担 1500 元及以下部分',
      customerPay: '1500 元及以下',
      covered: '1500 元以上',
      includesGlass: true,
      includesScratch: false,
    },
    thirdParty: {
      amount: 50,
      unit: '万元',
      note: '客户承担 50 万以上部分',
    },
    tireWheel: {
      covered: false,
      note: '无车轮损失保额，客户承担全部损失',
    },
    glass: {
      covered: true,
      note: '车辆损失保障含单独玻璃破损损失',
    },
    downtime: {
      covered: '部分',
      note: '保额 500 元；车行承担 500 元；客户承担 500 元以上部分',
    },
    depreciation: {
      covered: '部分',
      note: '车损不超过 5000 元时客户承担 0 元；车损超过 5000 元时客户承担车损总额的 10%',
    },
    driverPassenger: {
      driver: null,
      passenger: null,
      note: '截图中司机和乘客保障均显示无保额',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: true,
      note: '需垫付',
    },
    theft: {
      covered: false,
      note: '无保额，客户承担全部损失',
    },
    scrapLoss: {
      covered: '部分',
      note: '保额为车辆实际价值；保司及车行承担保司核定理赔金额；客户承担差额',
    },
    sourceConfidence: '用户截图',
    confidenceNote: '手机端截图显示，不同城市/车型/供应商可能存在差异',
  },
  {
    id: 'ctrip-standard-2',
    platform: '携程租车',
    platformId: 'ctrip',
    name: '剐蹭无忧',
    groupName: '第二组（基础安心/剐蹭无忧/全程无忧）',
    tier: 'standard',
    requiredType: 'optional',
    purchaseNote: '仅支持取车前购买；续租时只能购买与原订单相同的服务',
    vehicleDamage: {
      summary: '保额为实际损失；保司及车行承担全部损失，含划痕；客户承担 0 元',
      customerPay: '0 元',
      covered: '全部（含划痕）',
      includesGlass: true,
      includesScratch: true,
    },
    thirdParty: {
      amount: 100,
      unit: '万元',
      note: '客户承担 100 万以上部分',
    },
    tireWheel: {
      covered: true,
      note: '保额为车轮损失；保司及车行承担全部损失；客户承担 0 元',
    },
    glass: {
      covered: true,
      note: '车辆损失保障含单独玻璃破损损失',
    },
    downtime: {
      covered: true,
      note: '保额为停运实际损失；车行承担全部损失；客户承担 0 元',
    },
    depreciation: {
      covered: true,
      note: '客户承担 0 元',
    },
    driverPassenger: {
      driver: '5 万/座',
      passenger: null,
      note: '司机保障 5 万/座，乘客保障截图中显示无保额',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: false,
      note: '无需垫付',
    },
    theft: {
      covered: true,
      note: '保额为车辆实际价值；保司及车行承担全部损失；客户承担 0 元',
    },
    scrapLoss: {
      covered: '部分',
      note: '同基础安心',
    },
    sourceConfidence: '用户截图',
    confidenceNote: '手机端截图显示，不同城市/车型/供应商可能存在差异',
  },
  {
    id: 'ctrip-premium-2',
    platform: '携程租车',
    platformId: 'ctrip',
    name: '全程无忧',
    groupName: '第二组（基础安心/剐蹭无忧/全程无忧）',
    tier: 'premium',
    requiredType: 'optional',
    purchaseNote: '仅支持取车前购买；续租时只能购买与原订单相同的服务',
    vehicleDamage: {
      summary: '保额为实际损失；保司及车行承担全部损失，含划痕；客户承担 0 元',
      customerPay: '0 元',
      covered: '全部（含划痕）',
      includesGlass: true,
      includesScratch: true,
    },
    thirdParty: {
      amount: 150,
      unit: '万元',
      note: '客户承担 150 万以上部分',
    },
    tireWheel: {
      covered: true,
      note: '保额为车轮损失；保司及车行承担全部损失；客户承担 0 元',
    },
    glass: {
      covered: true,
      note: '车辆损失保障含单独玻璃破损损失',
    },
    downtime: {
      covered: true,
      note: '保额为停运实际损失；车行承担全部损失；客户承担 0 元',
    },
    depreciation: {
      covered: true,
      note: '客户承担 0 元',
    },
    driverPassenger: {
      driver: '10 万/座',
      passenger: '10 万/座',
      note: '司机 10 万/座，乘客 10 万/座',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: false,
      note: '无需垫付',
    },
    theft: {
      covered: true,
      note: '保额为车辆实际价值；保司及车行承担全部损失；客户承担 0 元',
    },
    scrapLoss: {
      covered: '部分',
      note: '同基础安心',
    },
    sourceConfidence: '用户截图',
    confidenceNote: '手机端截图显示，不同城市/车型/供应商可能存在差异',
  },

  // ==========================================================================
  // 携程租车 — 无忧租一口价（标签产品）
  // 来源：媒体报道（文档 2, 4.3）
  // ==========================================================================

  {
    id: 'ctrip-wuyou',
    platform: '携程租车',
    platformId: 'ctrip',
    name: '无忧租一口价',
    groupName: '标签产品',
    tier: 'special',
    requiredType: 'labeledProduct',
    purchaseNote: '需确认城市、车型、商户是否有"一口价"标签；2024 年报道称已在成都、海口、昆明、上海、北京、广州、西安、深圳、杭州等 18 城上线',
    vehicleDamage: {
      summary: '媒体报道称车损全免赔、车损全面保障',
      customerPay: '0 元（媒体报道）',
      covered: '全部（媒体报道）',
      includesGlass: true,
      includesScratch: '媒体报道称全面保障，具体以下单页为准',
    },
    thirdParty: {
      amount: 200,
      unit: '万元',
      note: '媒体报道称升级至 200 万，以下单页为准',
    },
    tireWheel: {
      covered: '媒体报道称全面保障，具体以下单页为准',
      note: '下单页待复核',
    },
    glass: {
      covered: true,
      note: '媒体报道称全面保障',
    },
    downtime: {
      covered: true,
      note: '媒体报道称涵盖因车损维修产生的停运费',
    },
    depreciation: {
      covered: true,
      note: '媒体报道称涵盖折旧费',
    },
    driverPassenger: {
      driver: '含司乘险（媒体报道）',
      passenger: '含司乘险（媒体报道）',
      note: '具体额度以下单页为准',
    },
    medicalOutsideInsurance: {
      covered: '下单页待复核',
      note: '未在媒体报道中明确提及',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '媒体报道未详细说明',
    },
    theft: {
      covered: '下单页待复核',
      note: '未在媒体报道中明确提及',
    },
    scrapLoss: {
      covered: '下单页待复核',
      note: '媒体报道未详细说明',
    },
    sourceConfidence: '媒体第三方辅助',
    confidenceNote: '媒体报道，不等同于所有携程租车订单；实际以下单页为准',
  },

  // ==========================================================================
  // 一嗨租车
  // 来源：官方帮助中心 + 用户提供一嗨 App 截图（文档 5, 5.2）
  // ==========================================================================

  {
    id: '1hai-basic',
    platform: '一嗨租车',
    platformId: '1hai',
    name: '基本保障服务费',
    groupName: '基础保障',
    tier: 'basic',
    requiredType: 'required',
    purchaseNote: '通常为订单基础费用之一，随订单必选',
    vehicleDamage: {
      summary: '车辆损失中 1500 元以上部分由一嗨分担，用户承担 1500 元及以下部分；最高以新车购置价为限',
      customerPay: '1500 元及以下',
      covered: '1500 元以上',
      includesGlass: true,
      includesScratch: false,
    },
    thirdParty: {
      amount: 20,
      unit: '万元',
      note: '官方口径',
    },
    tireWheel: {
      covered: false,
      note: '不赔偿轮胎、轮毂单独损失，相关费用由用户承担',
    },
    glass: {
      covered: true,
      note: '玻璃单独破损 100% 分担',
    },
    downtime: {
      covered: false,
      note: '特别提示仍需按合同承担经营损失；超期租赁不享受基本/补充保障',
    },
    depreciation: {
      covered: false,
      note: '损失总额达到或超过 5000 元时，承租方另按损失总额 20% 赔偿车辆贬值损失',
    },
    driverPassenger: {
      driver: '5 万元',
      passenger: '2 万元/人',
      note: '官方口径',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未在官方帮助中心明确显示',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '官方帮助中心未明确说明',
    },
    theft: {
      covered: '下单页待复核',
      note: '官方帮助中心未明确列明盗抢险',
    },
    keyWarnings: [
      '涉水后二次启动造成发动机损害不赔',
      '酒驾毒驾、无证/准驾不符不赔',
      '违法活动、逃逸、故意行为不赔',
      '保险责任外间接损失不赔',
      '超期租赁不享受基本/补充保障',
    ],
    sourceConfidence: '官方公开',
    confidenceNote: '一嗨帮助中心公开信息，实际以下单页为准',
  },
  {
    id: '1hai-zunxiang',
    platform: '一嗨租车',
    platformId: '1hai',
    name: '尊享保障',
    groupName: '补充保障',
    tier: 'standard',
    requiredType: 'optional',
    purchaseNote: '已购买补充保障的订单续租时必须继续原价购买；未购买不可在取车后追加；同城有未完成订单不可继续购买',
    vehicleDamage: {
      summary: '客户承担 0；一嗨承担 100%',
      customerPay: '0 元',
      covered: '100%',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 30,
      unit: '万元',
      note: '从基本保障 20 万提升至 30 万',
    },
    tireWheel: {
      covered: '以条款为准',
      note: '请以下单页保障条款为准',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '停运损失费客户承担 0；一嗨承担 100%',
    },
    depreciation: {
      covered: true,
      note: '贬值损失费客户承担 0；一嗨承担 100%。但另有提示：车辆发生事故导致不适合继续租赁时，承租方须支付事故前实际价值 20% 的损失费',
    },
    driverPassenger: {
      driver: '继承基本保障 5 万',
      passenger: '无增加',
      note: '截图显示乘客保障无增加',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: '下单页待复核',
      note: '截图未列明盗抢险',
    },
    keyWarnings: [
      '发生免予赔偿事由时所有费用由承租方自行承担',
      '车辆不适合继续提供租赁服务时须支付事故前实际价值 20% 的损失费',
      '事故需第一时间拨打 110 报案并联系一嗨',
      '还车时发现新损伤需提供事故证明等材料方可享受补充保障',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '一嗨 App 截图，不同城市/车型/订单可能存在差异',
  },
  {
    id: '1hai-zunxiang-shouhu',
    platform: '一嗨租车',
    platformId: '1hai',
    name: '尊享守护',
    groupName: '补充保障',
    tier: 'standard',
    requiredType: 'optional',
    purchaseNote: '同尊享保障购买规则',
    vehicleDamage: {
      summary: '客户承担 0；一嗨承担 100%',
      customerPay: '0 元',
      covered: '100%',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 30,
      unit: '万元',
      note: '从基本保障 20 万提升至 30 万',
    },
    tireWheel: {
      covered: '以条款为准',
      note: '请以下单页保障条款为准',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '停运损失费客户承担 0；一嗨承担 100%',
    },
    depreciation: {
      covered: true,
      note: '贬值损失费客户承担 0；一嗨承担 100%。另有 20% 事故损失费提示',
    },
    driverPassenger: {
      driver: '继承基本保障 5 万',
      passenger: '5 万',
      note: '乘客保障增至 5 万',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: '下单页待复核',
      note: '截图未列明盗抢险',
    },
    keyWarnings: [
      '发生免予赔偿事由时所有费用由承租方自行承担',
      '车辆不适合继续提供租赁服务时须支付事故前实际价值 20% 的损失费',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '一嗨 App 截图，不同城市/车型/订单可能存在差异',
  },
  {
    id: '1hai-baiwan',
    platform: '一嗨租车',
    platformId: '1hai',
    name: '百万守护',
    groupName: '补充保障',
    tier: 'premium',
    requiredType: 'optional',
    purchaseNote: '同尊享保障购买规则',
    vehicleDamage: {
      summary: '客户承担 0；一嗨承担 100%',
      customerPay: '0 元',
      covered: '100%',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 100,
      unit: '万元',
      note: '从基本保障 20 万提升至 100 万',
    },
    tireWheel: {
      covered: '以条款为准',
      note: '请以下单页保障条款为准',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '停运损失费客户承担 0；一嗨承担 100%',
    },
    depreciation: {
      covered: true,
      note: '贬值损失费客户承担 0；一嗨承担 100%。另有 20% 事故损失费提示',
    },
    driverPassenger: {
      driver: '继承基本保障 5 万',
      passenger: '无增加',
      note: '截图显示乘客保障无增加',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: '下单页待复核',
      note: '截图未列明盗抢险',
    },
    keyWarnings: [
      '发生免予赔偿事由时所有费用由承租方自行承担',
      '车辆不适合继续提供租赁服务时须支付事故前实际价值 20% 的损失费',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '一嗨 App 截图，不同城市/车型/订单可能存在差异',
  },
  {
    id: '1hai-quancheng',
    platform: '一嗨租车',
    platformId: '1hai',
    name: '全程无忧',
    groupName: '补充保障',
    tier: 'premium',
    requiredType: 'optional',
    purchaseNote: '同尊享保障购买规则',
    vehicleDamage: {
      summary: '客户承担 0；一嗨承担 100%',
      customerPay: '0 元',
      covered: '100%',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 120,
      unit: '万元',
      note: '从基本保障 20 万提升至 120 万',
    },
    tireWheel: {
      covered: '以条款为准',
      note: '请以下单页保障条款为准',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '停运损失费客户承担 0；一嗨承担 100%',
    },
    depreciation: {
      covered: true,
      note: '贬值损失费客户承担 0；一嗨承担 100%。另有 20% 事故损失费提示',
    },
    driverPassenger: {
      driver: '继承基本保障 5 万',
      passenger: '5 万',
      note: '乘客保障增至 5 万',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: '下单页待复核',
      note: '截图未列明盗抢险',
    },
    keyWarnings: [
      '发生免予赔偿事由时所有费用由承租方自行承担',
      '车辆不适合继续提供租赁服务时须支付事故前实际价值 20% 的损失费',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '一嗨 App 截图，不同城市/车型/订单可能存在差异',
  },
  {
    id: '1hai-chengke',
    platform: '一嗨租车',
    platformId: '1hai',
    name: '乘客守护',
    groupName: '补充保障',
    tier: 'standard',
    requiredType: 'optional',
    purchaseNote: '同尊享保障购买规则',
    vehicleDamage: {
      summary: '客户承担不超过 1500 元部分；一嗨承担超过 1500 元部分',
      customerPay: '1500 元及以下',
      covered: '1500 元以上',
      includesGlass: true,
      includesScratch: false,
    },
    thirdParty: {
      amount: 20,
      unit: '万元',
      note: '无增加，同基本保障',
    },
    tireWheel: {
      covered: false,
      note: '不赔偿轮胎、轮毂单独损失，相关费用由用户承担',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '停运损失费客户承担 0；一嗨承担 100%',
    },
    depreciation: {
      covered: true,
      note: '贬值损失费客户承担 0；一嗨承担 100%。另有 20% 事故损失费提示',
    },
    driverPassenger: {
      driver: '继承基本保障 5 万',
      passenger: '5 万',
      note: '更偏乘客保障方向；本车车损责任仍保留 1500 元以内客户承担',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: '下单页待复核',
      note: '截图未列明盗抢险',
    },
    keyWarnings: [
      '发生免予赔偿事由时所有费用由承租方自行承担',
      '本车车损仍有 1500 元以内客户承担，与尊享保障/百万守护/全程无忧不同',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '一嗨 App 截图，不同城市/车型/订单可能存在差异',
  },

  // ==========================================================================
  // 神州租车 — 七类出行保障
  // 来源：用户提供神州 App 出行保障说明截图（文档 6, 6.2）
  // ==========================================================================

  {
    id: 'shenzhou-basic',
    platform: '神州租车',
    platformId: 'shenzhou',
    name: '基础保障服务',
    groupName: '基础保障',
    tier: 'basic',
    requiredType: 'required',
    purchaseNote: '基础保障，随订单基础服务',
    vehicleDamage: {
      summary: '车辆直接损失：神州承担 1500 元以上部分，承租人承担 1500 元及以下部分（据实承担）',
      customerPay: '1500 元及以下',
      covered: '1500 元以上',
      includesGlass: true,
      includesScratch: false,
    },
    thirdParty: {
      amount: 20,
      unit: '万元',
      note: '交强险 + 20 万元三者险，保险公司承担 100%',
    },
    tireWheel: {
      covered: false,
      note: '基础保障不赔车轮单独损失',
    },
    glass: {
      covered: '下单页待复核',
      note: '第三方规则页称玻璃单独爆裂险承租方 0、保险/神州 100%，但截图未在基础保障单独列明',
    },
    downtime: {
      covered: true,
      note: '停运费保障：神州承担 100%，承租人承担 0',
    },
    depreciation: {
      covered: false,
      note: '车辆退运损失：神州承担车辆实际价值（损坏前）80%，承租人承担 20%',
    },
    driverPassenger: {
      driver: '5 万元',
      passenger: '未显示',
      note: '截图仅显示驾驶员损失 5 万元，未显示乘客损失保障',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '超出《道路交通事故受伤人员临床诊疗指南》和国家基本医疗保险同类医疗费用标准的医疗费由承租人承担',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明垫付规则',
    },
    theft: {
      covered: true,
      note: '全车盗抢损失：神州承担车辆实际价值（盗抢前）100%。非全车盗抢、零部件或附属设备被盗不在保障范围内',
    },
    keyWarnings: [
      '保险公司拒赔或不属理赔范围的费用/损失不赔',
      '驾驶人违法、酒驾毒驾、无证/证件异常、肇事逃逸、故意破坏、未及时报案等不赔',
      '车轮单独损失不赔',
      '无明显碰撞痕迹的车身划痕不赔',
      '车辆涉水后再次启动造成扩大损失不赔',
      '事故后未及时报案、无法提供责任认定书等材料不赔',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '神州 App 截图，不同城市/车型/租期/订单版本可能存在差异',
  },
  {
    id: 'shenzhou-zunxiang',
    platform: '神州租车',
    platformId: 'shenzhou',
    name: '尊享服务',
    groupName: '可选保障',
    tier: 'standard',
    requiredType: 'optional',
    purchaseNote: '可选，需单独购买',
    vehicleDamage: {
      summary: '车辆实际价值范围内神州承担 100%，承租人承担 0',
      customerPay: '0 元',
      covered: '100%（车辆实际价值范围内）',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 30,
      unit: '万元',
      note: '从基础保障 20 万提升至 30 万',
    },
    tireWheel: {
      covered: true,
      note: '单独轮胎实际损失神州承担 100%，承租人承担 0',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未在尊享服务中单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '继承基础保障停运费保障口径',
    },
    depreciation: {
      covered: false,
      note: '继承基础保障车辆退运损失口径（承租人承担 20%）',
    },
    driverPassenger: {
      driver: '5 万元',
      passenger: '未显示新增',
      note: '继承基础保障驾驶员 5 万；截图未显示新增乘客保障',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示新增医保外医疗费用保障',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: true,
      note: '继承基础保障已列盗抢口径',
    },
    keyWarnings: [
      '适用基础保障服务的不予赔偿说明',
      '单方事故本车损失低于 5000 元时，本车车辆损失部分无需提供理赔材料',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '神州 App 截图，不同城市/车型/租期/订单版本可能存在差异',
  },
  {
    id: 'shenzhou-zunxiang-million',
    platform: '神州租车',
    platformId: 'shenzhou',
    name: '尊享百万升级版服务',
    groupName: '可选保障',
    tier: 'premium',
    requiredType: 'optional',
    purchaseNote: '可选，需单独购买',
    vehicleDamage: {
      summary: '车辆实际价值范围内神州承担 100%，承租人承担 0',
      customerPay: '0 元',
      covered: '100%（车辆实际价值范围内）',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 100,
      unit: '万元',
      note: '从基础保障 20 万提升至 100 万',
    },
    tireWheel: {
      covered: true,
      note: '单独轮胎实际损失神州承担 100%，承租人承担 0',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '继承基础保障停运费保障口径',
    },
    depreciation: {
      covered: false,
      note: '继承基础保障车辆退运损失口径（承租人承担 20%）',
    },
    driverPassenger: {
      driver: '10 万元',
      passenger: '未显示',
      note: '驾驶员损失 10 万元；截图未显示乘客损失保障',
    },
    medicalOutsideInsurance: {
      covered: true,
      note: '第三者责任医保外医疗费用保障 10 万元，保险公司承担 100%，承租人承担 0。不赔范围：三者险赔偿范围内的部分、与事故无关的医疗/医药费用、特需医疗类费用、无法提供合规票据的费用',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: true,
      note: '继承基础保障已列盗抢口径',
    },
    keyWarnings: [
      '医保外医疗费用不赔范围包括三者险赔偿范围内部分、与事故无关的医疗费用、特需医疗类费用',
      '保险公司认定存在免赔拒赔或不属理赔范围的费用/损失不赔',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '神州 App 截图，不同城市/车型/租期/订单版本可能存在差异',
  },
  {
    id: 'shenzhou-driver-protect',
    platform: '神州租车',
    platformId: 'shenzhou',
    name: '驾乘守护服务',
    groupName: '可选保障',
    tier: 'standard',
    requiredType: 'optional',
    purchaseNote: '可选，需单独购买',
    vehicleDamage: {
      summary: '车辆实际价值范围内神州承担 100%，承租人承担 0',
      customerPay: '0 元',
      covered: '100%（车辆实际价值范围内）',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 30,
      unit: '万元',
      note: '从基础保障 20 万提升至 30 万',
    },
    tireWheel: {
      covered: true,
      note: '单独轮胎实际损失神州承担 100%，承租人承担 0',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '继承基础保障停运费保障口径',
    },
    depreciation: {
      covered: false,
      note: '继承基础保障车辆退运损失口径（承租人承担 20%）',
    },
    driverPassenger: {
      driver: '10 万元',
      passenger: '10 万元/人（最大人数为车辆核载人数 - 1）',
      note: '强调司机+乘客保障',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示新增医保外医疗费用保障',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: true,
      note: '继承基础保障已列盗抢口径',
    },
    keyWarnings: [
      '适用基础保障服务的不予赔偿说明',
      '保险公司认定存在免赔拒赔或不属理赔范围的费用/损失不赔',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '神州 App 截图，不同城市/车型/租期/订单版本可能存在差异',
  },
  {
    id: 'shenzhou-driver-protect-up',
    platform: '神州租车',
    platformId: 'shenzhou',
    name: '驾乘守护升级版服务',
    groupName: '可选保障',
    tier: 'premium',
    requiredType: 'optional',
    purchaseNote: '可选，需单独购买',
    vehicleDamage: {
      summary: '车辆实际价值范围内神州承担 100%，承租人承担 0',
      customerPay: '0 元',
      covered: '100%（车辆实际价值范围内）',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 30,
      unit: '万元',
      note: '从基础保障 20 万提升至 30 万',
    },
    tireWheel: {
      covered: true,
      note: '单独轮胎实际损失神州承担 100%，承租人承担 0',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '继承基础保障停运费保障口径',
    },
    depreciation: {
      covered: false,
      note: '继承基础保障车辆退运损失口径（承租人承担 20%）',
    },
    driverPassenger: {
      driver: '20 万元',
      passenger: '20 万元/人（最大人数为车辆核载人数 - 1）',
      note: '高额司乘保障',
    },
    medicalOutsideInsurance: {
      covered: true,
      note: '第三者责任医保外医疗费用保障 10 万元。仍有票据、医疗机构资质、事故关联性等限制',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: true,
      note: '继承基础保障已列盗抢口径',
    },
    keyWarnings: [
      '医保外医疗费用保障仍有票据、医疗机构资质、事故关联性等限制',
      '适用基础保障服务的不予赔偿说明',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '神州 App 截图，不同城市/车型/租期/订单版本可能存在差异',
  },
  {
    id: 'shenzhou-quancheng',
    platform: '神州租车',
    platformId: 'shenzhou',
    name: '全程无忧服务',
    groupName: '可选保障',
    tier: 'premium',
    requiredType: 'optional',
    purchaseNote: '可选，需单独购买',
    vehicleDamage: {
      summary: '车辆实际价值范围内神州承担 100%，承租人承担 0',
      customerPay: '0 元',
      covered: '100%（车辆实际价值范围内）',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 150,
      unit: '万元',
      note: '从基础保障 20 万提升至 150 万',
    },
    tireWheel: {
      covered: true,
      note: '单独轮胎实际损失神州承担 100%，承租人承担 0',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '继承基础保障停运费保障口径',
    },
    depreciation: {
      covered: false,
      note: '继承基础保障车辆退运损失口径（承租人承担 20%）',
    },
    driverPassenger: {
      driver: '10 万元',
      passenger: '10 万元/人（最大人数为车辆核载人数 - 1）',
      note: '司机+乘客保障',
    },
    medicalOutsideInsurance: {
      covered: false,
      note: '未显示新增医保外医疗费用保障',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: true,
      note: '继承基础保障已列盗抢口径',
    },
    keyWarnings: [
      '适用基础保障服务的不予赔偿说明',
      '保险公司认定拒赔或超出保障范围的部分仍由承租人承担',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '神州 App 截图，不同城市/车型/租期/订单版本可能存在差异',
  },
  {
    id: 'shenzhou-quancheng-up',
    platform: '神州租车',
    platformId: 'shenzhou',
    name: '全程无忧升级版服务',
    groupName: '可选保障',
    tier: 'premium',
    requiredType: 'optional',
    purchaseNote: '可选，需单独购买',
    vehicleDamage: {
      summary: '车辆实际价值范围内神州承担 100%，承租人承担 0',
      customerPay: '0 元',
      covered: '100%（车辆实际价值范围内）',
      includesGlass: true,
      includesScratch: '下单页待复核',
    },
    thirdParty: {
      amount: 300,
      unit: '万元',
      note: '从基础保障 20 万提升至 300 万',
    },
    tireWheel: {
      covered: true,
      note: '单独轮胎实际损失神州承担 100%，承租人承担 0',
    },
    glass: {
      covered: '下单页待复核',
      note: '截图未单独列明玻璃',
    },
    downtime: {
      covered: true,
      note: '继承基础保障停运费保障口径',
    },
    depreciation: {
      covered: false,
      note: '继承基础保障车辆退运损失口径（承租人承担 20%）',
    },
    driverPassenger: {
      driver: '50 万元',
      passenger: '50 万元/人（最大人数为车辆核载人数 - 1）',
      note: '当前最高司乘保障额度',
    },
    medicalOutsideInsurance: {
      covered: true,
      note: '第三者责任医保外医疗费用保障 10 万元。高额度不代表覆盖保险拒赔、违法使用、未及时报案、非事故关联费用等情形',
    },
    advancePayment: {
      required: '下单页待复核',
      note: '截图未明确说明',
    },
    theft: {
      covered: true,
      note: '继承基础保障已列盗抢口径',
    },
    keyWarnings: [
      '高额度不代表覆盖保险拒赔、违法使用、未及时报案、非事故关联费用等情形',
      '适用基础保障服务的不予赔偿说明',
    ],
    sourceConfidence: '用户截图',
    confidenceNote: '神州 App 截图，不同城市/车型/租期/订单版本可能存在差异',
  },
];

// ============================================================================
// 三、保险术语解释
// ============================================================================

export const INSURANCE_TERMS = [
  {
    term: '车损自付额',
    shortLabel: '车损自付',
    explanation:
      '发生车损事故后，需要由租车人自己承担的那部分维修费用。例如"1500 元及以下客户承担"，意思是 1500 元以内的小额车损由你自掏腰包，超出部分由保险公司或平台承担。升级到高保障方案通常可以将自付额降为 0 元。',
    riskNote: '基础保障通常有 1500 元自付门槛，小额剐蹭可能全部由你承担。',
  },
  {
    term: '三者险（第三者责任险）',
    shortLabel: '三者额度',
    explanation:
      '因租车发生意外事故导致第三方（对方车辆、行人、路边设施等）人身伤亡或财产损失时，保险能赔付的最高金额。三大平台基础保障通常为 20-50 万元，高保障方案可提升至 100-300 万元。',
    riskNote: '三者额度不够时，超出部分由租车人自行承担。长途、山路或人多车多的路线建议选择更高的三者额度。',
  },
  {
    term: '轮胎/轮毂损失',
    shortLabel: '轮胎轮毂',
    explanation:
      '指仅轮胎、轮辋或轮毂罩单独发生损失，而车身其他部位未受损的情况。很多基础保障方案不覆盖轮胎单独损失。',
    riskNote: '山路、非铺装路面或路边停车较多的场景，轮胎轮毂损伤风险高，建议确认是否覆盖。',
  },
  {
    term: '玻璃单独破损',
    shortLabel: '玻璃破损',
    explanation:
      '仅挡风玻璃或车窗玻璃破裂，车身其他部位未受损的情况。部分方案涵盖此类损失，但并非所有方案都默认覆盖。',
    riskNote: '高速行驶石子飞溅是常见原因，长途/高速路线建议确认玻璃覆盖。',
  },
  {
    term: '停运费',
    shortLabel: '停运费',
    explanation:
      '车辆因事故维修期间，你仍需支付的车辆租金和基础保障费。通常按维修天数乘以日租费用计算。如果事故是第三方全责，一般不向租车人收取停运费。',
    riskNote: '基础保障通常不覆盖或仅少量覆盖停运费。如果维修周期长（等配件等），停运费可能是一笔不小支出。',
  },
  {
    term: '折旧/贬值损失',
    shortLabel: '折旧费',
    explanation:
      '车辆发生较严重事故后，即使修好，车辆本身的市场价值也会降低。租车平台可能会向租车人追偿这部分"贬值损失"。通常事故损失越大，折旧费用比例越高。',
    riskNote: '这是容易被忽略的一项费用。基础保障下重大事故可能面临车辆价值 20% 的贬值赔偿。',
  },
  {
    term: '司乘保障（车上人员责任险）',
    shortLabel: '司乘险',
    explanation:
      '租车期间发生意外事故，导致车内驾驶员和乘客人身伤亡的赔偿。注意：驾驶员通常要求是租车人本人（承租人）；部分方案不包含乘客保障。',
    riskNote: '多人出行时，确认乘客保障是否充足。神州驾乘守护升级版提供司机 50 万/乘客 50 万的最高额度。',
  },
  {
    term: '医保外医疗费用',
    shortLabel: '医保外费用',
    explanation:
      '交通事故伤者治疗中，超出国家基本医疗保险目录范围的药品、检查和治疗费用。这部分费用商业三者险通常不赔，需要额外购买"医保外医疗费用责任险"才可能覆盖。',
    riskNote: '神州仅在尊享百万升级版、驾乘守护升级版、全程无忧升级版中明确显示 10 万医保外医疗费用保障。',
  },
  {
    term: '免责条款（不予赔偿事项）',
    shortLabel: '免责条款',
    explanation:
      '保险合同或保障说明中明确列出的不赔偿情形。常见的包括：酒驾毒驾、无证驾驶、肇事逃逸、故意破坏、车辆涉水后二次启动、未及时报案、未保留事故现场证据、驾驶人非租车人本人、将车辆用于竞赛/营运等非约定用途等。',
    riskNote: '即使购买了最高级别的保障方案，发生免责条款所列情形时，所有费用仍需自行承担。',
  },
];

// ============================================================================
// 四、场景化保险建议规则
// ============================================================================

/**
 * 场景规则用于 getInsuranceAdviceByScenario 函数
 *
 * 每个规则包含：
 *   id               — 唯一标识
 *   match            — 匹配条件函数，接收 context 对象
 *   priorityTags     — 建议优先关注的保障维度
 *   riskTags         — 需要特别注意的风险点
 *   tierAdvice       — 建议的保障层级
 *   reason           — 建议理由
 *   disclaimerNote   — 特殊免责提醒
 */

export const INSURANCE_SCENARIO_RULES = [
  {
    id: 'mountain-plateau',
    match: (ctx) => {
      const dest = (ctx.destinationType || '').toLowerCase();
      const destName = (ctx.destination || '').toLowerCase();
      const keywords = [
        'mountain', 'plateau', '山路', '高原', '川西', '西藏', '新疆', '伊犁',
        '独库', '赛里木湖', '那拉提', '甘南', '云南山区', '云南', '香格里拉', '昆大丽香', '青甘',
        'mountain-plateau', 'yunnan-mountain', 'grassland-long',
      ];
      return keywords.some((kw) => dest.includes(kw) || destName.includes(kw));
    },
    priorityTags: ['tireWheel', 'thirdParty', 'vehicleDamage', 'driverPassenger'],
    riskTags: ['山路多弯、海拔变化大，轮胎和制动系统负担重', '高原含氧量低，小排量动力可能不足'],
    tierAdvice: 'premium',
    reason:
      '山路和高原路线对车辆和保障要求较高。建议至少选择覆盖轮胎单独损失、三者额度不低于 100 万、车损 0 自付的方案。神州全程无忧升级版（三者 300 万、司乘 50 万）或携程全程无忧（三者 150 万、司乘各 10 万）都是值得考虑的方向。',
    disclaimerNote: '具体保障以下单页和合同为准。即使购买高保障方案，也不覆盖酒驾、涉水二次启动、未及时报案等情形。',
  },
  {
    id: 'long-distance-loop',
    match: (ctx) => {
      const dest = (ctx.destinationType || '').toLowerCase();
      const intensity = (ctx.tripIntensity || '').toLowerCase();
      return (
        dest.includes('loop-long') ||
        dest.includes('grassland-long') ||
        dest.includes('yunnan-mountain') ||
        intensity === 'high' ||
        (Number(ctx.tripDays) > 5)
      );
    },
    priorityTags: ['downtime', 'depreciation', 'vehicleDamage', 'thirdParty'],
    riskTags: ['长途/环线出险概率累加', '偏远地区维修周期可能较长', '停运费可能随维修天数增加而累积'],
    tierAdvice: 'premium',
    reason:
      '长途或跨城路线建议优先选择覆盖停运费和折旧费的方案，万一中途出险修车，停运费不会持续累积。携程剐蹭无忧/全程无忧、一嗨补充保障（除乘客守护外）、神州基础保障已含停运费覆盖。',
    disclaimerNote: '神州基础保障的退运损失承租人仍承担 20%，一嗨补充保障另有 20% 事故损失费提示。具体以下单页为准。',
  },
  {
    id: 'beginner',
    match: (ctx) => {
      return ctx.isBeginner === true || (ctx.experience || '').includes('新手') || (ctx.experience || '').includes('第一次');
    },
    priorityTags: ['vehicleDamage', 'advancePayment', 'tireWheel', 'glass'],
    riskTags: ['新手小刮擦概率较高', '不熟悉租车流程和保险报案规则'],
    tierAdvice: 'premium',
    reason:
      '如果是第一次租车，建议优先选择车损 0 自付的方案（如携程剐蹭无忧/全程无忧、神州可选保障、一嗨百万守护/全程无忧），减少还车时因小刮擦产生的沟通成本和自付费用。无需垫付的方案在处理事故时也更省心。',
    disclaimerNote: '即使购买高保障，出发前仍然建议按取车留证清单拍好车身照片和视频，方便还车核对。',
  },
  {
    id: 'family-multi-people',
    match: (ctx) => {
      const people = Number(ctx.peopleCount) || Number(ctx.people) || 0;
      return people >= 3;
    },
    priorityTags: ['driverPassenger', 'thirdParty', 'medicalOutsideInsurance'],
    riskTags: ['多人出行，车上人员保障是否充足需关注', '乘客保障额度可能按座位计算'],
    tierAdvice: 'premium',
    reason:
      '多人出行（3 人及以上）建议关注司乘险额度。神州驾乘守护升级版（司机 50 万、乘客 50 万/人）和全程无忧升级版（同额度）的司乘保障最充足。携程全程无忧（司机 10 万/座、乘客 10 万/座）也覆盖全车人员。',
    disclaimerNote: '一嗨基本保障乘客仅 2 万/人；神州基础保障未显示乘客保障。带家人出行建议确认乘客保障。',
  },
  {
    id: 'city-short',
    match: (ctx) => {
      const dest = (ctx.destinationType || '').toLowerCase();
      return dest.includes('city-short') || dest.includes('island-leisure');
    },
    priorityTags: ['vehicleDamage', 'glass', 'tireWheel'],
    riskTags: ['城市停车刮擦风险', '看似简单但小额车损仍需注意'],
    tierAdvice: 'standard',
    reason:
      '城市周边短途和轻松游对保障要求整体较低。如果预算有限，基础保障配合认真验车留证也可以接受；如果不想操心小刮擦，升级到车损 0 自付的中等保障通常性价比更高。',
    disclaimerNote: '城市停车刮擦和石子飞溅是最常见的出险场景，建议至少确认玻璃和轮胎是否覆盖。',
  },
  {
    id: 'budget-sensitive',
    match: (ctx) => {
      const pref = (ctx.preference || '').toLowerCase();
      return pref === 'budget' || pref.includes('省钱') || ctx.budgetConscious === true;
    },
    priorityTags: ['vehicleDamage', 'downtime', 'depreciation'],
    riskTags: ['省钱方案通常车损自付额较高', '可能需要自行承担停运费和折旧费'],
    tierAdvice: 'basic',
    reason:
      '如果预算有限，基础保障方案也可以接受，但建议出发前先了解清楚自付范围（通常是 1500 元以内车损自付、轮胎不覆盖、停运费不覆盖）。取车时认真完成验车留证，还车时可以减少很多沟通成本。',
    disclaimerNote: '省钱意味着承担更多风险。长途、山路、新手驾驶或多人出行场景下，不建议为了省保险费而选最低保障。',
  },
];

// ============================================================================
// 五、验车拍照提醒（基于保险条款）
// ============================================================================

/**
 * 根据平台和保险方案的保障缺口，生成差异化的验车拍照提醒
 */
export const INSURANCE_CHECKLIST_TIPS = {
  // 通用提醒（所有平台基础保障共有风险）
  default: {
    title: '取车验车通用提醒',
    items: [
      '基础保障通常有 1500 元车损自付，建议完整拍摄车身一圈视频',
      '轮胎和轮毂单独损伤在很多基础保障中不覆盖，建议四轮逐一拍清楚',
      '玻璃单独破损的理赔通常需要证明是取车后新增的，建议拍下前挡和车窗现状',
      '仪表盘报警灯、油量/电量、当前里程建议启动后立即拍照',
    ],
  },
  // 按平台差异化的提醒
  byPlatform: {
    ctrip: {
      basicNotice: '携程基础保障/基础安心中轮胎单独损失不覆盖、停运费不覆盖（基础安心仅有 500 元停运保额）。建议重点拍摄四条轮胎、轮毂和已有划痕。',
      premiumNotice: '携程剐蹭无忧/全程无忧已覆盖轮胎和停运费，验车重点可以放在车身已有损伤的清晰留证上。',
    },
    '1hai': {
      basicNotice: '一嗨基本保障服务费不赔偿轮胎、轮毂单独损失，停运费按合同承担，车损达 5000 元另收 20% 贬值费。建议四轮逐一拍清楚，车身已有划痕拍近景。',
      premiumNotice: '一嗨乘客守护不赔偿轮胎、轮毂单独损失；其他补充保障请以下单页条款为准。还车时发现新损伤需提供事故证明等材料。',
    },
    shenzhou: {
      basicNotice: '神州基础保障不赔车轮单独损失和无明显碰撞痕迹的车身划痕。但基础保障已含停运费覆盖和全车盗抢险。建议重点拍摄轮胎轮毂。',
      premiumNotice: '神州可选保障均覆盖单独轮胎损失。尊享百万升级版、驾乘守护升级版、全程无忧升级版含 10 万医保外医疗费用保障。',
    },
  },
};
