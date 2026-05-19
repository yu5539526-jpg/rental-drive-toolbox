/**
 * 车身验车避坑图 — 所有可点击部位数据
 *
 * 新增部位只需在此文件追加对象即可，无需改动组件。
 *
 * 字段说明：
 *   id          — 唯一标识，建议 {view}-{part} 格式
 *   view        — 所属视角："front" | "side" | "rear"
 *   name        — 部位全称
 *   shortLabel  — 简短标签（用于 SVG 图内标注，须简短）
 *   riskLevel   — 风险等级："高频争议" | "容易忽略" | "重点留证"
 *   checkPoints — 看什么（2-3 条字符串数组）
 *   photoTips   — 怎么拍（1-2 条字符串数组）
 *   warning     — 注意点（1 句话）
 *   rect        — SVG 热区坐标 { x, y, w, h }，单位与对应 viewBox 一致
 */

const hotspots = [
  /* ==================== 正面 (front) ==================== */

  {
    id: 'front-bumper',
    view: 'front',
    name: '前保险杠',
    shortLabel: '保险杠',
    riskLevel: '高频争议',
    checkPoints: [
      '是否有划痕、裂纹、掉漆',
      '下沿是否有托底或剐蹭痕迹',
    ],
    photoTips: [
      '先拍车头完整照片',
      '再拍前杠下沿和两侧边角',
    ],
    warning: '前保险杠是剐蹭高发区域，尤其要拍清楚边角和下沿。',
    rect: { x: 108, y: 244, w: 384, h: 52 },
  },

  {
    id: 'front-hood',
    view: 'front',
    name: '引擎盖',
    shortLabel: '引擎盖',
    riskLevel: '容易忽略',
    checkPoints: [
      '是否有凹陷、划痕、石子崩点',
      '漆面是否有明显色差',
    ],
    photoTips: [
      '从正前方拍整体',
      '斜侧角度补拍反光位置',
    ],
    warning: '浅色车小凹陷不明显，建议换角度看反光。',
    rect: { x: 170, y: 118, w: 260, h: 34 },
  },

  {
    id: 'front-windshield',
    view: 'front',
    name: '前挡风玻璃',
    shortLabel: '前挡风',
    riskLevel: '重点留证',
    checkPoints: [
      '是否有裂纹、小坑、星状破损',
      '雨刮区域是否有划痕',
    ],
    photoTips: [
      '正面拍整体',
      '对小坑或裂纹补近照',
    ],
    warning: '玻璃小裂纹容易被忽略，取车前要单独检查。',
    rect: { x: 188, y: 55, w: 224, h: 72 },
  },

  {
    id: 'front-headlight-left',
    view: 'front',
    name: '左前大灯',
    shortLabel: '左大灯',
    riskLevel: '高频争议',
    checkPoints: [
      '灯罩是否有裂纹、破损、起雾',
      '灯组边缘是否松动',
    ],
    photoTips: [
      '分别拍左右大灯近照',
      '有破损时拍清楚位置',
    ],
    warning: '灯组维修成本较高，破损一定要提前留证。',
    rect: { x: 118, y: 158, w: 80, h: 56 },
  },

  {
    id: 'front-headlight-right',
    view: 'front',
    name: '右前大灯',
    shortLabel: '右大灯',
    riskLevel: '高频争议',
    checkPoints: [
      '灯罩是否有裂纹、破损、起雾',
      '灯组边缘是否松动',
    ],
    photoTips: [
      '分别拍左右大灯近照',
      '有破损时拍清楚位置',
    ],
    warning: '左右大灯都要单独检查，不能只看一侧就跳过另一侧。',
    rect: { x: 402, y: 158, w: 80, h: 56 },
  },

  {
    id: 'front-wheel-left',
    view: 'front',
    name: '左前轮毂',
    shortLabel: '左前轮',
    riskLevel: '高频争议',
    checkPoints: [
      '是否有擦伤、掉漆、磕碰',
      '轮胎侧壁是否有鼓包、裂口',
    ],
    photoTips: [
      '每个轮毂单独拍近照',
      '轮胎侧壁也要带到',
    ],
    warning: '轮毂剐蹭是高频争议点，不要只拍车身不拍轮毂。',
    rect: { x: 125, y: 278, w: 90, h: 70 },
  },

  {
    id: 'front-wheel-right',
    view: 'front',
    name: '右前轮毂',
    shortLabel: '右前轮',
    riskLevel: '高频争议',
    checkPoints: [
      '是否有擦伤、掉漆、磕碰',
      '轮胎侧壁是否有鼓包、裂口',
    ],
    photoTips: [
      '每个轮毂单独拍近照',
      '轮胎侧壁也要带到',
    ],
    warning: '左右轮毂都要单独拍到，不能只拍一侧。',
    rect: { x: 385, y: 278, w: 90, h: 70 },
  },

  /* ==================== 侧面 (side) ==================== */

  {
    id: 'side-door-front',
    view: 'side',
    name: '左侧前车门',
    shortLabel: '左前门',
    riskLevel: '高频争议',
    checkPoints: [
      '是否有划痕、凹陷、掉漆',
      '门边角是否有磕碰',
    ],
    photoTips: [
      '侧面拍整车',
      '对每扇门边角补拍细节',
    ],
    warning: '门边角很容易被忽略，还车时却容易被单独指出。',
    rect: { x: 290, y: 160, w: 162, h: 80 },
  },

  {
    id: 'side-door-rear',
    view: 'side',
    name: '左侧后车门',
    shortLabel: '左后门',
    riskLevel: '容易忽略',
    checkPoints: [
      '是否有划痕、凹陷、掉漆',
      '门边角是否有磕碰',
    ],
    photoTips: [
      '侧面拍整车',
      '对每扇门边角补拍细节',
    ],
    warning: '后排门边角同样容易被忽略，建议打开后门单独确认。',
    rect: { x: 454, y: 160, w: 138, h: 80 },
  },

  {
    id: 'side-mirror',
    view: 'side',
    name: '外后视镜',
    shortLabel: '后视镜',
    riskLevel: '高频争议',
    checkPoints: [
      '外壳是否有划痕、裂纹',
      '镜片是否破损或松动',
    ],
    photoTips: [
      '左右后视镜各拍一张',
      '对外壳边角补近照',
    ],
    warning: '后视镜突出车身，停车或会车时容易剐蹭。',
    rect: { x: 268, y: 120, w: 50, h: 48 },
  },

  {
    id: 'side-door-handles',
    view: 'side',
    name: '门把手',
    shortLabel: '门把手',
    riskLevel: '容易忽略',
    checkPoints: [
      '把手附近是否有指甲划痕',
      '把手是否松动或破损',
    ],
    photoTips: [
      '拍每侧门把手区域',
      '有明显划痕时补近照',
    ],
    warning: '门把手附近细小划痕较多，提前拍清楚更稳妥。',
    rect: { x: 366, y: 158, w: 38, h: 30 },
  },

  {
    id: 'side-skirt',
    view: 'side',
    name: '侧裙与底边',
    shortLabel: '侧裙',
    riskLevel: '容易忽略',
    checkPoints: [
      '是否有托底、剐蹭、变形',
      '下沿是否有掉漆',
    ],
    photoTips: [
      '蹲低从侧面拍下沿',
      '对明显剐蹭补细节',
    ],
    warning: '低趴车型侧裙更容易擦到马路牙子。',
    rect: { x: 238, y: 236, w: 396, h: 22 },
  },

  {
    id: 'side-wheel-front',
    view: 'side',
    name: '前轮毂与轮胎',
    shortLabel: '前轮',
    riskLevel: '高频争议',
    checkPoints: [
      '是否有马路牙子擦伤',
      '轮胎是否有鼓包、裂纹',
    ],
    photoTips: [
      '四个轮毂建议全部单独拍',
      '拍照时把轮胎侧壁也带上',
    ],
    warning: '轮毂和轮胎建议作为独立检查项，不要只拍远景。',
    rect: { x: 158, y: 208, w: 128, h: 72 },
  },

  {
    id: 'side-wheel-rear',
    view: 'side',
    name: '后轮毂与轮胎',
    shortLabel: '后轮',
    riskLevel: '高频争议',
    checkPoints: [
      '是否有马路牙子擦伤',
      '轮胎是否有鼓包、裂纹',
    ],
    photoTips: [
      '四个轮毂建议全部单独拍',
      '拍照时把轮胎侧壁也带上',
    ],
    warning: '后轮同样需要单独留证，不要因为看不见就跳过。',
    rect: { x: 566, y: 208, w: 128, h: 72 },
  },

  {
    id: 'side-windows',
    view: 'side',
    name: '车窗玻璃',
    shortLabel: '车窗',
    riskLevel: '重点留证',
    checkPoints: [
      '玻璃是否有裂纹、小坑',
      '贴膜是否有明显破损',
    ],
    photoTips: [
      '从侧面拍整块玻璃',
      '有瑕疵时补近照',
    ],
    warning: '玻璃反光强，建议换角度确认。',
    rect: { x: 348, y: 46, w: 228, h: 70 },
  },

  {
    id: 'side-charge-port',
    view: 'side',
    name: '充电口 / 油箱盖区域',
    shortLabel: '充电口/油箱盖',
    riskLevel: '容易忽略',
    checkPoints: [
      '盖板是否松动、变形',
      '周围漆面是否有划痕',
    ],
    photoTips: [
      '拍关闭状态',
      '如果平台允许，也可拍打开状态',
    ],
    warning: '新能源车尤其要确认充电口盖板和充电接口状态。',
    rect: { x: 606, y: 170, w: 44, h: 44 },
  },

  /* ==================== 背面 (rear) ==================== */

  {
    id: 'rear-bumper',
    view: 'rear',
    name: '后保险杠',
    shortLabel: '后保险杠',
    riskLevel: '高频争议',
    checkPoints: [
      '是否有划痕、裂纹、掉漆',
      '下沿是否有剐蹭',
    ],
    photoTips: [
      '拍车尾完整照片',
      '对后杠边角和下沿补拍',
    ],
    warning: '倒车剐蹭常见，后杠一定要重点留证。',
    rect: { x: 108, y: 250, w: 384, h: 52 },
  },

  {
    id: 'rear-taillights',
    view: 'rear',
    name: '尾灯',
    shortLabel: '尾灯',
    riskLevel: '高频争议',
    checkPoints: [
      '灯罩是否开裂、破损、进水',
      '灯组边缘是否松动',
    ],
    photoTips: [
      '左右尾灯分别拍近照',
      '有裂纹时补细节',
    ],
    warning: '贯穿式尾灯或大尺寸尾灯维修成本可能较高。',
    rect: { x: 116, y: 158, w: 368, h: 50 },
  },

  {
    id: 'rear-trunk-lid',
    view: 'rear',
    name: '后备箱门',
    shortLabel: '后备箱',
    riskLevel: '容易忽略',
    checkPoints: [
      '是否有凹陷、划痕、色差',
      '开合是否顺畅',
    ],
    photoTips: [
      '拍车尾整体',
      '对后备箱门边缘补拍',
    ],
    warning: '尾门边缘和牌照上方位置容易被忽略。',
    rect: { x: 210, y: 130, w: 180, h: 72 },
  },

  {
    id: 'rear-window',
    view: 'rear',
    name: '后挡风玻璃',
    shortLabel: '后挡风',
    riskLevel: '重点留证',
    checkPoints: [
      '是否有裂纹、小坑',
      '加热丝区域是否异常',
    ],
    photoTips: [
      '正后方拍整体',
      '发现小坑时补近照',
    ],
    warning: '后挡玻璃也要单独检查，不要只看前挡。',
    rect: { x: 194, y: 56, w: 212, h: 68 },
  },

  {
    id: 'rear-camera',
    view: 'rear',
    name: '倒车影像 / 后摄像头',
    shortLabel: '后摄像头',
    riskLevel: '容易忽略',
    checkPoints: [
      '摄像头是否破损、松动',
      '周围饰板是否有划痕',
    ],
    photoTips: [
      '近距离拍摄摄像头区域',
      '有脏污时先不要自行判断为损坏',
    ],
    warning: '辅助驾驶和倒车影像相关部位，取车前建议确认是否正常。',
    rect: { x: 276, y: 195, w: 48, h: 30 },
  },

  {
    id: 'rear-license',
    view: 'rear',
    name: '牌照框周边',
    shortLabel: '牌照框',
    riskLevel: '容易忽略',
    checkPoints: [
      '牌照框是否松动',
      '周边是否有划痕或凹陷',
    ],
    photoTips: [
      '拍车尾中部区域',
      '对牌照框边缘补拍',
    ],
    warning: '牌照周围容易有装卸或轻微碰撞痕迹。',
    rect: { x: 232, y: 208, w: 136, h: 36 },
  },

  {
    id: 'rear-diffuser',
    view: 'rear',
    name: '后杠底部 / 扩散器区域',
    shortLabel: '后杠底部',
    riskLevel: '容易忽略',
    checkPoints: [
      '是否有托底、剐蹭、裂纹',
      '底部饰板是否松动',
    ],
    photoTips: [
      '蹲低拍后杠下沿',
      '有剐蹭时补细节',
    ],
    warning: '底部剐蹭不容易第一眼看到，但还车时可能被重点检查。',
    rect: { x: 240, y: 264, w: 120, h: 34 },
  },
];

/* ==================== 按视角分组 ==================== */

export const hotspotsByView = {
  front: hotspots.filter((h) => h.view === 'front'),
  side: hotspots.filter((h) => h.view === 'side'),
  rear: hotspots.filter((h) => h.view === 'rear'),
};

/* ==================== 默认选中 ==================== */

export const defaultSelections = {
  front: 'front-bumper',
  side: 'side-wheel-front',
  rear: 'rear-bumper',
};

/* ==================== 风险等级 → 样式映射 ==================== */

export const riskLevelStyles = {
  '高频争议': 'bg-coral/10 text-coral ring-coral/20',
  '容易忽略': 'bg-amberSoft/45 text-amberDark ring-warning/20',
  '重点留证': 'bg-mint text-pine ring-pine/20',
};

/* ==================== 视角元信息 ==================== */

export const viewMeta = {
  front: { label: '正面', viewBox: '0 0 600 380' },
  side: { label: '侧面', viewBox: '0 0 920 320' },
  rear: { label: '背面', viewBox: '0 0 600 380' },
};

export default hotspots;
