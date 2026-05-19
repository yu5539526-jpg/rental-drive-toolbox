/**
 * 车身验车避坑图 — 图片版热点数据（百分比定位，中心点）
 *
 * position.left / position.top → 热区中心点在图片中的百分比位置
 * position.width / position.height → 热区宽高的百分比
 * 组件内通过 transform: translate(-50%, -50%) 居中于该点
 *
 * name       → 部位全称（说明卡片标题）
 * label      → 2-3 字短标签（热区中心显示）
 * shortLabel → 选中态弹泡标签
 */

const imageHotspots = [
  /* ==================== 正面 front → /images/su7-front.png ==================== */

  {
    id: 'front-windshield',
    view: 'front',
    name: '前挡风玻璃',
    label: '前挡',
    shortLabel: '前挡风',
    riskLevel: '重点留证',
    checkPoints: ['是否有裂纹、小坑、星状破损', '雨刮区域是否有划痕'],
    photoTips: ['正面拍整体', '对小坑或裂纹补近照'],
    warning: '玻璃小裂纹容易被忽略，取车前要单独检查。',
    position: { left: 50, top: 24, width: 50, height: 18 },
  },

  {
    id: 'front-hood',
    view: 'front',
    name: '引擎盖',
    label: '引擎盖',
    shortLabel: '引擎盖',
    riskLevel: '容易忽略',
    checkPoints: ['是否有凹陷、划痕、石子崩点', '漆面是否有明显色差'],
    photoTips: ['从正前方拍整体', '斜侧角度补拍反光位置'],
    warning: '浅色车小凹陷不明显，建议换角度看反光。',
    position: { left: 50, top: 43, width: 52, height: 18 },
  },

  {
    id: 'front-headlight-left',
    view: 'front',
    name: '左前大灯',
    label: '大灯',
    shortLabel: '左大灯',
    riskLevel: '高频争议',
    checkPoints: ['灯罩是否有裂纹、破损、起雾', '灯组边缘是否松动'],
    photoTips: ['分别拍左右大灯近照', '有破损时拍清楚位置'],
    warning: '灯组维修成本较高，破损一定要提前留证。',
    position: { left: 22, top: 53, width: 18, height: 12 },
  },

  {
    id: 'front-headlight-right',
    view: 'front',
    name: '右前大灯',
    label: '大灯',
    shortLabel: '右大灯',
    riskLevel: '高频争议',
    checkPoints: ['灯罩是否有裂纹、破损、起雾', '灯组边缘是否松动'],
    photoTips: ['分别拍左右大灯近照', '有破损时拍清楚位置'],
    warning: '左右大灯都要检查，不能只看一侧就跳过另一侧。',
    position: { left: 78, top: 53, width: 18, height: 12 },
  },

  {
    id: 'front-bumper',
    view: 'front',
    name: '前保险杠',
    label: '前杠',
    shortLabel: '保险杠',
    riskLevel: '高频争议',
    checkPoints: ['是否有划痕、裂纹、掉漆', '下沿是否有托底或剐蹭痕迹'],
    photoTips: ['先拍车头完整照片', '再拍前杠下沿和两侧边角'],
    warning: '前保险杠是剐蹭高发区域，尤其要拍清楚边角和下沿。',
    position: { left: 50, top: 72, width: 58, height: 16 },
  },

  {
    id: 'front-wheel-left',
    view: 'front',
    name: '左前轮毂/轮胎',
    label: '轮毂',
    shortLabel: '左前轮',
    riskLevel: '高频争议',
    checkPoints: ['是否有擦伤、掉漆、磕碰', '轮胎侧壁是否有鼓包、裂口'],
    photoTips: ['每个轮毂单独拍近照', '轮胎侧壁也要带到'],
    warning: '轮毂剐蹭是高频争议点，不要只拍车身不拍轮毂。',
    position: { left: 15, top: 82, width: 15, height: 18 },
  },

  {
    id: 'front-wheel-right',
    view: 'front',
    name: '右前轮毂/轮胎',
    label: '轮毂',
    shortLabel: '右前轮',
    riskLevel: '高频争议',
    checkPoints: ['是否有擦伤、掉漆、磕碰', '轮胎侧壁是否有鼓包、裂口'],
    photoTips: ['每个轮毂单独拍近照', '轮胎侧壁也要带到'],
    warning: '左右轮毂都要单独拍到，不能只拍一侧。',
    position: { left: 85, top: 82, width: 15, height: 18 },
  },

  /* ==================== 侧面 side → /images/su7-side.png ==================== */

  {
    id: 'side-bumper-front',
    view: 'side',
    name: '前保险杠侧边',
    label: '前杠',
    shortLabel: '前杠侧边',
    riskLevel: '高频争议',
    checkPoints: ['是否有划痕、裂纹、掉漆', '下沿是否有托底或剐蹭痕迹'],
    photoTips: ['从侧面拍前杠边角', '对剐蹭部位补近照'],
    warning: '前保险杠侧面边角同样容易剐蹭。',
    position: { left: 8, top: 62, width: 12, height: 18 },
  },

  {
    id: 'side-wheel-front',
    view: 'side',
    name: '前轮毂/轮胎',
    label: '轮毂',
    shortLabel: '前轮',
    riskLevel: '高频争议',
    checkPoints: ['是否有马路牙子擦伤', '轮胎是否有鼓包、裂纹'],
    photoTips: ['四个轮毂建议全部单独拍', '拍照时把轮胎侧壁也带上'],
    warning: '轮毂和轮胎建议作为独立检查项，不要只拍远景。',
    position: { left: 21, top: 68, width: 15, height: 24 },
  },

  {
    id: 'side-wheel-rear',
    view: 'side',
    name: '后轮毂/轮胎',
    label: '轮毂',
    shortLabel: '后轮',
    riskLevel: '高频争议',
    checkPoints: ['是否有马路牙子擦伤', '轮胎是否有鼓包、裂纹'],
    photoTips: ['四个轮毂建议全部单独拍', '拍照时把轮胎侧壁也带上'],
    warning: '后轮同样需要单独留证，不要因为看不见就跳过。',
    position: { left: 76, top: 68, width: 15, height: 24 },
  },

  {
    id: 'side-door-front',
    view: 'side',
    name: '前车门',
    label: '前门',
    shortLabel: '前车门',
    riskLevel: '高频争议',
    checkPoints: ['是否有划痕、凹陷、掉漆', '门边角是否有磕碰'],
    photoTips: ['侧面拍整车', '对每扇门边角补拍细节'],
    warning: '门边角容易被忽略，还车时常被单独指出。',
    position: { left: 43, top: 50, width: 23, height: 28 },
  },

  {
    id: 'side-door-rear',
    view: 'side',
    name: '后车门',
    label: '后门',
    shortLabel: '后车门',
    riskLevel: '容易忽略',
    checkPoints: ['是否有划痕、凹陷、掉漆', '门边角是否有磕碰'],
    photoTips: ['侧面拍整车', '对每扇门边角补拍细节'],
    warning: '后排门边角同样容易被忽略，建议打开后门确认。',
    position: { left: 61, top: 50, width: 23, height: 28 },
  },

  {
    id: 'side-mirror',
    view: 'side',
    name: '后视镜',
    label: '后视镜',
    shortLabel: '后视镜',
    riskLevel: '高频争议',
    checkPoints: ['外壳是否有划痕、裂纹', '镜片是否破损或松动'],
    photoTips: ['左右后视镜各拍一张', '对外壳边角补近照'],
    warning: '后视镜突出车身，停车或会车时容易剐蹭。',
    position: { left: 36, top: 38, width: 10, height: 12 },
  },

  {
    id: 'side-door-handles',
    view: 'side',
    name: '门把手',
    label: '把手',
    shortLabel: '门把手',
    riskLevel: '容易忽略',
    checkPoints: ['把手附近是否有指甲划痕', '把手是否松动或破损'],
    photoTips: ['拍每侧门把手区域', '有明显划痕时补近照'],
    warning: '门把手附近细小划痕较多，提前拍清楚更稳妥。',
    position: { left: 54, top: 49, width: 28, height: 10 },
  },

  {
    id: 'side-skirt',
    view: 'side',
    name: '侧裙',
    label: '侧裙',
    shortLabel: '侧裙',
    riskLevel: '容易忽略',
    checkPoints: ['是否有托底、剐蹭、变形', '下沿是否有掉漆'],
    photoTips: ['蹲低从侧面拍下沿', '对明显剐蹭补细节'],
    warning: '低趴车型侧裙更容易擦到马路牙子。',
    position: { left: 50, top: 75, width: 55, height: 10 },
  },

  {
    id: 'side-windows',
    view: 'side',
    name: '车窗玻璃',
    label: '车窗',
    shortLabel: '车窗',
    riskLevel: '重点留证',
    checkPoints: ['玻璃是否有裂纹、小坑', '贴膜是否有明显破损'],
    photoTips: ['从侧面拍整块玻璃', '有瑕疵时补近照'],
    warning: '玻璃反光强，建议换角度确认。',
    position: { left: 58, top: 34, width: 48, height: 18 },
  },

  {
    id: 'side-charge-port',
    view: 'side',
    name: '充电口/油箱盖区域',
    label: '充电口',
    shortLabel: '充电口',
    riskLevel: '容易忽略',
    checkPoints: ['盖板是否松动、变形', '周围漆面是否有划痕'],
    photoTips: ['拍关闭状态', '如果平台允许，也可拍打开状态'],
    warning: '新能源车尤其要确认充电口盖板和充电接口状态。',
    position: { left: 87, top: 47, width: 10, height: 12 },
  },

  {
    id: 'side-bumper-rear',
    view: 'side',
    name: '后保险杠侧边',
    label: '后杠',
    shortLabel: '后杠侧边',
    riskLevel: '高频争议',
    checkPoints: ['是否有划痕、掉漆', '边角是否有剐蹭'],
    photoTips: ['从侧面拍后杠边角', '对剐蹭部位补近照'],
    warning: '后保险杠侧面边角倒车时容易碰到。',
    position: { left: 93, top: 63, width: 10, height: 18 },
  },

  /* ==================== 背面 rear → /images/su7-rear.png ==================== */

  {
    id: 'rear-window',
    view: 'rear',
    name: '后挡风玻璃',
    label: '后挡',
    shortLabel: '后挡风',
    riskLevel: '重点留证',
    checkPoints: ['是否有裂纹、小坑', '加热丝区域是否异常'],
    photoTips: ['正后方拍整体', '发现小坑时补近照'],
    warning: '后挡玻璃也要单独检查，不要只看前挡。',
    position: { left: 50, top: 26, width: 44, height: 18 },
  },

  {
    id: 'rear-trunk-lid',
    view: 'rear',
    name: '后备箱门',
    label: '尾门',
    shortLabel: '后备箱',
    riskLevel: '容易忽略',
    checkPoints: ['是否有凹陷、划痕、色差', '开合是否顺畅'],
    photoTips: ['拍车尾整体', '对后备箱门边缘补拍'],
    warning: '尾门边缘和牌照上方位置容易被忽略。',
    position: { left: 50, top: 49, width: 52, height: 22 },
  },

  {
    id: 'rear-taillight-left',
    view: 'rear',
    name: '左尾灯',
    label: '尾灯',
    shortLabel: '左尾灯',
    riskLevel: '高频争议',
    checkPoints: ['灯罩是否开裂、破损、进水', '灯组边缘是否松动'],
    photoTips: ['左右尾灯分别拍近照', '有裂纹时补细节'],
    warning: '贯穿式尾灯或大尺寸尾灯维修成本可能较高。',
    position: { left: 28, top: 47, width: 24, height: 10 },
  },

  {
    id: 'rear-taillight-right',
    view: 'rear',
    name: '右尾灯',
    label: '尾灯',
    shortLabel: '右尾灯',
    riskLevel: '高频争议',
    checkPoints: ['灯罩是否开裂、破损、进水', '灯组边缘是否松动'],
    photoTips: ['左右尾灯分别拍近照', '有裂纹时补细节'],
    warning: '左右尾灯都要单独检查，不能只看一侧。',
    position: { left: 72, top: 47, width: 24, height: 10 },
  },

  {
    id: 'rear-bumper',
    view: 'rear',
    name: '后保险杠',
    label: '后杠',
    shortLabel: '后保险杠',
    riskLevel: '高频争议',
    checkPoints: ['是否有划痕、裂纹、掉漆', '下沿是否有剐蹭'],
    photoTips: ['拍车尾完整照片', '对后杠边角和下沿补拍'],
    warning: '倒车剐蹭常见，后杠一定要重点留证。',
    position: { left: 50, top: 73, width: 62, height: 18 },
  },

  {
    id: 'rear-license',
    view: 'rear',
    name: '牌照框周边',
    label: '牌照',
    shortLabel: '牌照框',
    riskLevel: '容易忽略',
    checkPoints: ['牌照框是否松动', '周边是否有划痕或凹陷'],
    photoTips: ['拍车尾中部区域', '对牌照框边缘补拍'],
    warning: '牌照周围容易有装卸或轻微碰撞痕迹。',
    position: { left: 50, top: 65, width: 26, height: 12 },
  },

  {
    id: 'rear-camera',
    view: 'rear',
    name: '倒车影像/摄像头区域',
    label: '摄像头',
    shortLabel: '后摄像头',
    riskLevel: '容易忽略',
    checkPoints: ['摄像头是否破损、松动', '周围饰板是否有划痕'],
    photoTips: ['近距离拍摄摄像头区域', '有脏污时先不要自行判断为损坏'],
    warning: '倒车影像相关部件，取车前建议确认是否正常。',
    position: { left: 50, top: 59, width: 18, height: 8 },
  },

  {
    id: 'rear-diffuser',
    view: 'rear',
    name: '后杠底部区域',
    label: '扩散器',
    shortLabel: '后杠底部',
    riskLevel: '容易忽略',
    checkPoints: ['是否有托底、剐蹭、裂纹', '底部饰板是否松动'],
    photoTips: ['蹲低拍后杠下沿', '有剐蹭时补细节'],
    warning: '底部剐蹭不容易第一眼看到，还车时可能被重点检查。',
    position: { left: 50, top: 84, width: 56, height: 12 },
  },

  {
    id: 'rear-wheel-left',
    view: 'rear',
    name: '左后轮胎',
    label: '轮毂',
    shortLabel: '左后轮',
    riskLevel: '高频争议',
    checkPoints: ['是否有擦伤、掉漆、磕碰', '轮胎侧壁是否有鼓包、裂口'],
    photoTips: ['每个轮毂单独拍近照', '轮胎侧壁也要带到'],
    warning: '后轮轮毂同样需要单独留证。',
    position: { left: 15, top: 82, width: 14, height: 18 },
  },

  {
    id: 'rear-wheel-right',
    view: 'rear',
    name: '右后轮胎',
    label: '轮毂',
    shortLabel: '右后轮',
    riskLevel: '高频争议',
    checkPoints: ['是否有擦伤、掉漆、磕碰', '轮胎侧壁是否有鼓包、裂口'],
    photoTips: ['每个轮毂单独拍近照', '轮胎侧壁也要带到'],
    warning: '左右后轮都要单独留证，不能只拍一侧。',
    position: { left: 85, top: 82, width: 14, height: 18 },
  },
];

/* ==================== 按视角分组 ==================== */

export const imageHotspotsByView = {
  front: imageHotspots.filter((h) => h.view === 'front'),
  side: imageHotspots.filter((h) => h.view === 'side'),
  rear: imageHotspots.filter((h) => h.view === 'rear'),
};

/* ==================== 默认选中 ==================== */

export const imageDefaultSelections = {
  front: 'front-bumper',
  side: 'side-door-front',
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
  front: { label: '正面', src: '/images/su7-front.png' },
  side: { label: '侧面', src: '/images/su7-side.png' },
  rear: { label: '背面', src: '/images/su7-rear.png' },
};

export default imageHotspots;
