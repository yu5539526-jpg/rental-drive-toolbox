/**
 * 车身验车点位结构化数据
 *
 * 基于原 carInspectionImageHotspots.js 重构，新增：
 *   - category      → 部位类别，用于保险联动分组
 *   - basePriority  → 基础优先级（不依赖保险方案）
 *   - baseTags      → 基础标签
 *   - insuranceKeys → 关联的保险风险维度
 *   - primary       → 是否在车图上默认展示
 *
 * 坐标 x / y 为热点中心在图片上的百分比位置，
 * 与原有 position.left / position.top 保持一致。
 */

const ALL_ZONES = [
  /* ===================================================================
     正面 front — 共 7 个点位，全部为 primary
     =================================================================== */

  {
    id: 'front-bumper',
    view: 'front',
    label: '前保险杠',
    category: 'bumper',
    x: 50,
    y: 72,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage', 'downtime', 'depreciation'],
    primary: true,
    whatToCheck: [
      '是否有划痕、破损、凹陷、掉漆',
      '左右边角和下沿是否有旧伤或托底痕迹',
    ],
    howToShoot: [
      '先拍一张正面整体',
      '再拍左右边角近景',
      '最好带到车牌或相邻部位作为参照',
    ],
    note: '前保险杠是剐蹭高发区域，尤其边角和下沿。',
  },

  {
    id: 'front-headlight-left',
    view: 'front',
    label: '左前大灯',
    category: 'light',
    x: 22,
    y: 53,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage', 'downtime'],
    primary: true,
    whatToCheck: [
      '灯罩是否有裂纹、破损、起雾、进水',
      '灯组边缘是否松动',
    ],
    howToShoot: [
      '左右大灯分别拍近照',
      '有破损时拍清楚位置和大小',
    ],
    note: '灯组维修成本较高，破损一定要提前留证。',
  },

  {
    id: 'front-headlight-right',
    view: 'front',
    label: '右前大灯',
    category: 'light',
    x: 78,
    y: 53,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage', 'downtime'],
    primary: true,
    whatToCheck: [
      '灯罩是否有裂纹、破损、起雾、进水',
      '灯组边缘是否松动',
    ],
    howToShoot: [
      '左右大灯分别拍近照',
      '有破损时拍清楚位置和大小',
    ],
    note: '左右大灯都要单独检查，不能只看一侧就跳过另一侧。',
  },

  {
    id: 'front-hood',
    view: 'front',
    label: '前机盖',
    category: 'hood',
    x: 50,
    y: 43,
    basePriority: 'warning',
    baseTags: ['易遗漏'],
    insuranceKeys: ['vehicleDamage', 'depreciation'],
    primary: true,
    whatToCheck: [
      '是否有凹陷、划痕、石子崩点',
      '漆面是否有明显色差',
    ],
    howToShoot: [
      '从正前方拍整体',
      '斜侧角度补拍反光位置',
    ],
    note: '浅色车小凹陷不明显，建议换角度看反光。',
  },

  {
    id: 'front-windshield',
    view: 'front',
    label: '前挡风玻璃',
    category: 'glass',
    x: 50,
    y: 24,
    basePriority: 'must',
    baseTags: ['必拍'],
    insuranceKeys: ['glass', 'vehicleDamage'],
    primary: true,
    whatToCheck: [
      '是否有裂纹、小坑、星状破损',
      '雨刮区域是否有划痕',
    ],
    howToShoot: [
      '正面拍整体',
      '对小坑或裂纹补近照',
    ],
    note: '玻璃小裂纹容易被忽略，取车前要单独检查。',
  },

  {
    id: 'front-wheel-left',
    view: 'front',
    label: '左前轮胎/轮毂',
    category: 'wheel',
    x: 15,
    y: 82,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['tireWheel'],
    primary: true,
    whatToCheck: [
      '轮毂是否有擦伤、掉漆、磕碰',
      '轮胎侧壁是否有鼓包、裂口',
    ],
    howToShoot: [
      '每个轮毂单独拍近照',
      '轮胎侧壁也要带到',
    ],
    note: '轮毂剐蹭是高频争议点，不要只拍车身不拍轮毂。',
  },

  {
    id: 'front-wheel-right',
    view: 'front',
    label: '右前轮胎/轮毂',
    category: 'wheel',
    x: 85,
    y: 82,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['tireWheel'],
    primary: true,
    whatToCheck: [
      '轮毂是否有擦伤、掉漆、磕碰',
      '轮胎侧壁是否有鼓包、裂口',
    ],
    howToShoot: [
      '每个轮毂单独拍近照',
      '轮胎侧壁也要带到',
    ],
    note: '左右轮毂都要单独拍到，不能只拍一侧。',
  },

  /* ===================================================================
     侧面 side — 共 11 个点位，7 个 primary + 4 个 secondary
     =================================================================== */

  {
    id: 'side-wheel-front',
    view: 'side',
    label: '前轮胎/轮毂',
    category: 'wheel',
    x: 21,
    y: 68,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['tireWheel'],
    primary: true,
    whatToCheck: [
      '轮毂边缘是否有马路牙子擦伤',
      '轮胎侧壁是否有鼓包、裂纹',
      '胎面是否有异常磨损或异物',
    ],
    howToShoot: [
      '四个轮毂建议全部单独拍',
      '拍照时把轮胎侧壁也带上',
    ],
    note: '轮毂和轮胎建议作为独立检查项，不要只拍远景。',
  },

  {
    id: 'side-wheel-rear',
    view: 'side',
    label: '后轮胎/轮毂',
    category: 'wheel',
    x: 76,
    y: 68,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['tireWheel'],
    primary: true,
    whatToCheck: [
      '轮毂边缘是否有马路牙子擦伤',
      '轮胎侧壁是否有鼓包、裂纹',
    ],
    howToShoot: [
      '四个轮毂建议全部单独拍',
      '拍照时把轮胎侧壁也带上',
    ],
    note: '后轮同样需要单独留证，不要因为看不见就跳过。',
  },

  {
    id: 'side-door-front',
    view: 'side',
    label: '前车门',
    category: 'door',
    x: 43,
    y: 50,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage', 'downtime', 'depreciation'],
    primary: true,
    whatToCheck: [
      '是否有划痕、凹陷、掉漆',
      '门边角是否有磕碰',
    ],
    howToShoot: [
      '侧面拍整车',
      '对每扇门边角补拍细节',
    ],
    note: '门边角很容易被忽略，还车时却容易被单独指出。',
  },

  {
    id: 'side-door-rear',
    view: 'side',
    label: '后车门',
    category: 'door',
    x: 61,
    y: 50,
    basePriority: 'warning',
    baseTags: ['易遗漏'],
    insuranceKeys: ['vehicleDamage', 'downtime', 'depreciation'],
    primary: true,
    whatToCheck: [
      '是否有划痕、凹陷、掉漆',
      '门边角是否有磕碰',
    ],
    howToShoot: [
      '侧面拍整车',
      '对每扇门边角补拍细节',
    ],
    note: '后排门边角同样容易被忽略，建议打开后门单独确认。',
  },

  {
    id: 'side-mirror',
    view: 'side',
    label: '外后视镜',
    category: 'mirror',
    x: 36,
    y: 38,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage'],
    primary: true,
    whatToCheck: [
      '外壳是否有划痕、裂纹',
      '镜片是否破损或松动',
    ],
    howToShoot: [
      '左右后视镜各拍一张',
      '对外壳边角补近照',
    ],
    note: '后视镜突出车身，停车或会车时容易剐蹭。',
  },

  {
    id: 'side-skirt',
    view: 'side',
    label: '侧裙与底边',
    category: 'sideSkirt',
    x: 50,
    y: 75,
    basePriority: 'warning',
    baseTags: ['易遗漏'],
    insuranceKeys: ['vehicleDamage'],
    primary: true,
    whatToCheck: [
      '是否有托底、剐蹭、变形',
      '下沿是否有掉漆',
    ],
    howToShoot: [
      '蹲低从侧面拍下沿',
      '对明显剐蹭补细节',
    ],
    note: '低趴车型侧裙更容易擦到马路牙子。',
  },

  {
    id: 'side-windows',
    view: 'side',
    label: '车窗玻璃',
    category: 'glass',
    x: 58,
    y: 34,
    basePriority: 'warning',
    baseTags: ['必拍'],
    insuranceKeys: ['glass', 'vehicleDamage'],
    primary: true,
    whatToCheck: [
      '玻璃是否有裂纹、小坑',
      '贴膜是否有明显破损',
    ],
    howToShoot: [
      '从侧面拍整块玻璃',
      '有瑕疵时补近照',
    ],
    note: '玻璃反光强，建议换角度确认。',
  },

  // ── 侧面次要点位 ──

  {
    id: 'side-bumper-front',
    view: 'side',
    label: '前保险杠侧边',
    category: 'bumper',
    x: 8,
    y: 62,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage', 'downtime', 'depreciation'],
    primary: false,
    whatToCheck: [
      '是否有划痕、裂纹、掉漆',
      '下沿是否有托底或剐蹭痕迹',
    ],
    howToShoot: [
      '从侧面拍前杠边角',
      '对剐蹭部位补近照',
    ],
    note: '前保险杠侧面边角同样容易剐蹭。',
  },

  {
    id: 'side-bumper-rear',
    view: 'side',
    label: '后保险杠侧边',
    category: 'bumper',
    x: 93,
    y: 63,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage', 'downtime', 'depreciation'],
    primary: false,
    whatToCheck: [
      '是否有划痕、掉漆',
      '边角是否有剐蹭',
    ],
    howToShoot: [
      '从侧面拍后杠边角',
      '对剐蹭部位补近照',
    ],
    note: '后保险杠侧面边角倒车时容易碰到。',
  },

  {
    id: 'side-door-handles',
    view: 'side',
    label: '门把手',
    category: 'door',
    x: 54,
    y: 49,
    basePriority: 'normal',
    baseTags: ['易遗漏'],
    insuranceKeys: ['vehicleDamage'],
    primary: false,
    whatToCheck: [
      '把手附近是否有指甲划痕',
      '把手是否松动或破损',
    ],
    howToShoot: [
      '拍每侧门把手区域',
      '有明显划痕时补近照',
    ],
    note: '门把手附近细小划痕较多，提前拍清楚更稳妥。',
  },

  {
    id: 'side-charge-port',
    view: 'side',
    label: '充电口/油箱盖区域',
    category: 'other',
    x: 87,
    y: 47,
    basePriority: 'normal',
    baseTags: ['易遗漏'],
    insuranceKeys: ['vehicleDamage'],
    primary: false,
    whatToCheck: [
      '盖板是否松动、变形',
      '周围漆面是否有划痕',
    ],
    howToShoot: [
      '拍关闭状态',
      '如果平台允许，也可拍打开状态',
    ],
    note: '新能源车尤其要确认充电口盖板和充电接口状态。',
  },

  /* ===================================================================
     背面 rear — 共 10 个点位，7 个 primary + 3 个 secondary
     =================================================================== */

  {
    id: 'rear-bumper',
    view: 'rear',
    label: '后保险杠',
    category: 'bumper',
    x: 50,
    y: 71,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage', 'downtime', 'depreciation'],
    primary: true,
    whatToCheck: [
      '是否有划痕、裂纹、掉漆',
      '下沿是否有剐蹭',
    ],
    howToShoot: [
      '拍车尾完整照片',
      '对后杠边角和下沿补拍',
    ],
    note: '倒车剐蹭常见，后杠一定要重点留证。',
  },

  {
    id: 'rear-taillight-left',
    view: 'rear',
    label: '左尾灯',
    category: 'light',
    x: 28,
    y: 45,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage', 'downtime'],
    primary: true,
    whatToCheck: [
      '灯罩是否开裂、破损、进水',
      '灯组边缘是否松动',
    ],
    howToShoot: [
      '左右尾灯分别拍近照',
      '有裂纹时补细节',
    ],
    note: '贯穿式尾灯或大尺寸尾灯维修成本可能较高。',
  },

  {
    id: 'rear-taillight-right',
    view: 'rear',
    label: '右尾灯',
    category: 'light',
    x: 72,
    y: 45,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['vehicleDamage', 'downtime'],
    primary: true,
    whatToCheck: [
      '灯罩是否开裂、破损、进水',
      '灯组边缘是否松动',
    ],
    howToShoot: [
      '左右尾灯分别拍近照',
      '有裂纹时补细节',
    ],
    note: '左右尾灯都要单独检查，不能只看一侧。',
  },

  {
    id: 'rear-trunk-lid',
    view: 'rear',
    label: '后备厢盖',
    category: 'trunk',
    x: 50,
    y: 45,
    basePriority: 'warning',
    baseTags: ['易遗漏'],
    insuranceKeys: ['vehicleDamage', 'downtime', 'depreciation'],
    primary: true,
    whatToCheck: [
      '是否有凹陷、划痕、色差',
      '开合是否顺畅',
    ],
    howToShoot: [
      '拍车尾整体',
      '对后备箱门边缘补拍',
    ],
    note: '尾门边缘和牌照上方位置容易被忽略。',
  },

  {
    id: 'rear-window',
    view: 'rear',
    label: '后挡风玻璃',
    category: 'glass',
    x: 50,
    y: 26,
    basePriority: 'warning',
    baseTags: ['必拍'],
    insuranceKeys: ['glass', 'vehicleDamage'],
    primary: true,
    whatToCheck: [
      '是否有裂纹、小坑',
      '加热丝区域是否异常',
    ],
    howToShoot: [
      '正后方拍整体',
      '发现小坑时补近照',
    ],
    note: '后挡玻璃也要单独检查，不要只看前挡。',
  },

  {
    id: 'rear-wheel-left',
    view: 'rear',
    label: '左后轮胎/轮毂',
    category: 'wheel',
    x: 15,
    y: 82,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['tireWheel'],
    primary: true,
    whatToCheck: [
      '轮毂是否有擦伤、掉漆、磕碰',
      '轮胎侧壁是否有鼓包、裂口',
    ],
    howToShoot: [
      '每个轮毂单独拍近照',
      '轮胎侧壁也要带到',
    ],
    note: '后轮轮毂同样需要单独留证。',
  },

  {
    id: 'rear-wheel-right',
    view: 'rear',
    label: '右后轮胎/轮毂',
    category: 'wheel',
    x: 85,
    y: 82,
    basePriority: 'must',
    baseTags: ['必拍', '易争议'],
    insuranceKeys: ['tireWheel'],
    primary: true,
    whatToCheck: [
      '轮毂是否有擦伤、掉漆、磕碰',
      '轮胎侧壁是否有鼓包、裂口',
    ],
    howToShoot: [
      '每个轮毂单独拍近照',
      '轮胎侧壁也要带到',
    ],
    note: '左右后轮都要单独留证，不能只拍一侧。',
  },

  // ── 背面次要点位 ──

  {
    id: 'rear-camera',
    view: 'rear',
    label: '倒车影像/后摄像头',
    category: 'other',
    x: 50,
    y: 54,
    basePriority: 'normal',
    baseTags: ['易遗漏'],
    insuranceKeys: ['vehicleDamage'],
    primary: false,
    whatToCheck: [
      '摄像头是否破损、松动',
      '周围饰板是否有划痕',
    ],
    howToShoot: [
      '近距离拍摄摄像头区域',
      '有脏污时先不要自行判断为损坏',
    ],
    note: '辅助驾驶和倒车影像相关部位，取车前建议确认是否正常。',
  },

  {
    id: 'rear-license',
    view: 'rear',
    label: '牌照框周边',
    category: 'other',
    x: 50,
    y: 62,
    basePriority: 'normal',
    baseTags: ['易遗漏'],
    insuranceKeys: ['vehicleDamage'],
    primary: false,
    whatToCheck: [
      '牌照框是否松动',
      '周边是否有划痕或凹陷',
    ],
    howToShoot: [
      '拍车尾中部区域',
      '对牌照框边缘补拍',
    ],
    note: '牌照周围容易有装卸或轻微碰撞痕迹。',
  },

  {
    id: 'rear-diffuser',
    view: 'rear',
    label: '后杠底部/扩散器区域',
    category: 'bumper',
    x: 50,
    y: 80,
    basePriority: 'normal',
    baseTags: ['易遗漏'],
    insuranceKeys: ['vehicleDamage', 'depreciation'],
    primary: false,
    whatToCheck: [
      '是否有托底、剐蹭、裂纹',
      '底部饰板是否松动',
    ],
    howToShoot: [
      '蹲低拍后杠下沿',
      '有剐蹭时补细节',
    ],
    note: '底部剐蹭不容易第一眼看到，但还车时可能被重点检查。',
  },
];

/* ===================================================================
   导出
   =================================================================== */

/** 所有点位（29 个） */
export const allInspectionZones = ALL_ZONES;

/** 按视角分组 */
export const inspectionZonesByView = {
  front: ALL_ZONES.filter((z) => z.view === 'front'),
  side: ALL_ZONES.filter((z) => z.view === 'side'),
  rear: ALL_ZONES.filter((z) => z.view === 'rear'),
};

/** 按视角分组 — 仅 primary */
export const primaryZonesByView = {
  front: ALL_ZONES.filter((z) => z.view === 'front' && z.primary),
  side: ALL_ZONES.filter((z) => z.view === 'side' && z.primary),
  rear: ALL_ZONES.filter((z) => z.view === 'rear' && z.primary),
};

/** 所有点位 ID 列表 */
export const allZoneIds = ALL_ZONES.map((z) => z.id);

/** 默认选中（每个视角第一个 primary 点位） */
export const defaultZoneSelections = {
  front: 'front-bumper',
  side: 'side-door-front',
  rear: 'rear-bumper',
};

/** 视角元信息 */
export const viewMeta = {
  front: { label: '正面', src: '/images/su7-front.png' },
  side: { label: '侧面', src: '/images/su7-side.png' },
  rear: { label: '背面', src: '/images/su7-rear.png' },
};

/** 基础优先级 → 显示权重（用于排序） */
export const PRIORITY_WEIGHT = {
  must: 3,
  warning: 2,
  normal: 1,
};

/** 风险等级样式映射（兼容原有 HotspotDetailCard 的 consumption） */
export const riskLevelStyles = {
  '高频争议': { bg: 'rgba(226,136,128,0.08)', text: '#E28880', ring: 'rgba(226,136,128,0.16)', dot: '#E28880' },
  '容易忽略': { bg: 'rgba(205,159,76,0.08)', text: '#CD9F4C', ring: 'rgba(205,159,76,0.16)', dot: '#CD9F4C' },
  '重点留证': { bg: 'rgba(75,132,147,0.08)', text: '#4B8493', ring: 'rgba(75,132,147,0.16)', dot: '#4B8493' },
};

export default ALL_ZONES;
