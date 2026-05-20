import { destinations, recommendations } from '../data/car-recommendation/index.js';

/* ========================================================================
   0. sanitize — 过滤 null / undefined / "待人工确认" 等内部值
   ======================================================================== */

const INTERNAL_PLACEHOLDERS = ['待人工确认', '待确认', 'N/A', 'TBD'];

function sanitize(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || INTERNAL_PLACEHOLDERS.includes(trimmed)) return fallback;
    return trimmed;
  }
  if (typeof value === 'number' && isNaN(value)) return fallback;
  return value;
}

function sanitizeRecord(record, fieldDefaults = {}) {
  const out = {};
  for (const [key, val] of Object.entries(record)) {
    const fallback = fieldDefaults[key] !== undefined ? fieldDefaults[key] : '';
    out[key] = sanitize(val, fallback);
  }
  return out;
}

/* ========================================================================
   1. normalizeDestinationName — 用户输入 → JSON destinations.name 精确值
   ======================================================================== */

const ALIAS_MAP = {
  // 伊犁环线
  伊犁: '伊犁环线',
  新疆伊犁: '伊犁环线',
  赛里木湖: '伊犁环线',
  那拉提: '伊犁环线',
  独库公路: '伊犁环线',
  新疆: '伊犁环线',
  北疆: '伊犁环线',

  // 川西小环线
  川西: '川西小环线',
  川西大环线: '川西小环线',
  稻城亚丁: '川西小环线',
  色达: '川西小环线',
  新都桥: '川西小环线',
  '318': '川西小环线',
  川藏线: '川西小环线',
  四姑娘山: '川西小环线',
  理塘: '川西小环线',

  // 青甘大环线
  青甘: '青甘大环线',
  青甘环线: '青甘大环线',
  西北环线: '青甘大环线',
  青海湖: '青甘大环线',
  敦煌: '青甘大环线',
  大柴旦: '青甘大环线',
  青海: '青甘大环线',
  甘肃: '青甘大环线',
  河西走廊: '青甘大环线',

  // 海南环岛自驾
  三亚: '海南环岛自驾',
  海南: '海南环岛自驾',
  海南环岛: '海南环岛自驾',
  三亚环岛: '海南环岛自驾',
  海口: '海南环岛自驾',
  万宁: '海南环岛自驾',
  陵水: '海南环岛自驾',

  // 昆大丽香线
  云南: '昆大丽香线',
  滇西北: '昆大丽香线',
  大理: '昆大丽香线',
  丽江: '昆大丽香线',
  香格里拉: '昆大丽香线',
  泸沽湖: '昆大丽香线',
  昆明: '昆大丽香线',
  西双版纳: '昆大丽香线',
  腾冲: '昆大丽香线',
};

export function normalizeDestinationName(input) {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // 直接命中 JSON 中的标准名称
  const exact = destinations.find((d) => d.name === trimmed);
  if (exact) return exact.name;

  // 别名映射
  if (ALIAS_MAP[trimmed]) return ALIAS_MAP[trimmed];

  // 模糊匹配：输入包含标准名
  for (const d of destinations) {
    if (trimmed.includes(d.name) || d.name.includes(trimmed)) {
      return d.name;
    }
  }

  // 模糊匹配：输入包含别名（长别名优先，避免短别名误匹配）
  const sortedAliases = Object.entries(ALIAS_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, target] of sortedAliases) {
    if (trimmed.includes(alias) || alias.includes(trimmed)) {
      return target;
    }
  }

  return '';
}

/* ========================================================================
   2. findDestinationProfile — 根据用户输入返回 destination 对象
   ======================================================================== */

export function findDestinationProfile(destinationInput) {
  const normalized = normalizeDestinationName(destinationInput);
  if (!normalized) return null;
  return destinations.find((d) => d.name === normalized) || null;
}

/* ========================================================================
   3. getRecommendationsByDestination — 返回该目的地下所有推荐，按排名排序
   ======================================================================== */

const LEVEL_PRIORITY = {
  强烈推荐: 0,
  推荐: 1,
  可选: 2,
  不建议: 3,
};

export function getRecommendationsByDestination(destinationInput) {
  const profile = findDestinationProfile(destinationInput);
  if (!profile) return [];

  const list = recommendations.filter((r) => r.destinationId === profile.id);

  return list.sort((a, b) => {
    const pa = LEVEL_PRIORITY[a.recommendationLevel] ?? 99;
    const pb = LEVEL_PRIORITY[b.recommendationLevel] ?? 99;
    if (pa !== pb) return pa - pb;
    return (b.overallScore ?? 0) - (a.overallScore ?? 0);
  });
}

/* ========================================================================
   4. getVehicleById — 根据 vehicleId 返回车型基础信息
   ======================================================================== */

export function getVehicleById(vehicleId) {
  if (!vehicleId) return null;
  const rec = recommendations.find((r) => r.vehicleId === vehicleId);
  if (!rec) return null;

  return sanitizeRecord({
    vehicleId: rec.vehicleId,
    brand: rec.brand,
    model: rec.model,
    vehicleLevel: rec.vehicleLevel,
    bodyType: rec.bodyType,
    energyType: rec.energyType,
    driveType: rec.driveType,
    seatCount: rec.seatCount,
    suitablePeopleCount: rec.suitablePeopleCount,
    fuelConsumption: rec.fuelConsumption,
    groundClearance: rec.groundClearance,
    luggageCapacity: rec.luggageCapacity,
    trunkSpace: rec.trunkSpace,
    bestUseCase: rec.bestUseCase,
    notSuitableCase: rec.notSuitableCase,
    commonProblems: rec.commonProblems,
    summarySentence: rec.summarySentence,
  }, { brand: '', model: '', vehicleLevel: '中型' });
}

/* ========================================================================
   5. getTopVehicleExamples — 返回适合展示给用户的具体车型示例
   ======================================================================== */

function fitsPeopleCount(rec, peopleCount) {
  if (!peopleCount) return true;
  const n = parseInt(peopleCount, 10);
  if (isNaN(n)) return true;
  if (n >= 5) return rec.seatCount >= 6 || rec.bodyType === 'MPV';
  if (n >= 3) return rec.seatCount >= 5;
  return true;
}

function fitsLuggageLevel(rec, luggageLevel) {
  if (!luggageLevel) return true;
  if (luggageLevel === 'heavy' || luggageLevel === '多') {
    return rec.luggageCapacity === '好' && rec.trunkSpace === '好';
  }
  return true;
}

export function getTopVehicleExamples(destinationInput, options = {}) {
  const allRecs = getRecommendationsByDestination(destinationInput);
  if (!allRecs.length) return [];

  const profile = findDestinationProfile(destinationInput);
  const notRecommendedEnergy = profile ? (profile.notRecommendedEnergy || []) : [];
  const { peopleCount, luggageLevel, budgetPreference, energyPreference, drivingPreference } = options;

  // 从非"不建议"的推荐开始
  let candidates = allRecs.filter((r) => r.recommendationLevel !== '不建议');

  // 如果目的地不推荐纯电，将纯电排在后面（不直接排除，因为可能没得选）
  if (notRecommendedEnergy.includes('纯电动')) {
    const nonPureEV = candidates.filter((r) => r.energyType !== '纯电动');
    if (nonPureEV.length >= 3) {
      candidates = nonPureEV;
    }
  }

  // 人数筛选
  if (peopleCount) {
    const fitted = candidates.filter((r) => fitsPeopleCount(r, peopleCount));
    if (fitted.length >= 3) candidates = fitted;
  }

  // 行李筛选
  if (luggageLevel) {
    const fitted = candidates.filter((r) => fitsLuggageLevel(r, luggageLevel));
    if (fitted.length >= 2) candidates = fitted;
  }

  // 预算偏好 — 基于 JSON 实际 costScore 排序和车型级别过滤
  if (budgetPreference === 'budget' || budgetPreference === '省钱优先') {
    // 省钱：排除大型/中大型，按 costScore 降序
    const budgetFriendly = candidates.filter(
      (r) => r.vehicleLevel !== '大型' && r.vehicleLevel !== '中大型',
    );
    if (budgetFriendly.length >= 3) candidates = budgetFriendly;
    candidates.sort((a, b) => (b.costScore ?? 0) - (a.costScore ?? 0));
  } else if (budgetPreference === 'comfort' || budgetPreference === '舒适优先') {
    // 舒适：按 comfortScore 降序
    candidates.sort((a, b) => (b.comfortScore ?? 0) - (a.comfortScore ?? 0));
  } else {
    // 无偏好时保持推荐等级 + overallScore 排序
    candidates.sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0));
  }

  // 能源偏好
  if (energyPreference === 'ev' || energyPreference === '新能源优先') {
    const evRecs = candidates.filter((r) =>
      ['纯电动', '增程式', '插电混动'].includes(r.energyType),
    );
    if (evRecs.length >= 3) candidates = evRecs;
  } else if (energyPreference === 'oil' || energyPreference === '油车优先') {
    const oilRecs = candidates.filter((r) =>
      ['汽油', '油电混动'].includes(r.energyType),
    );
    if (oilRecs.length >= 3) candidates = oilRecs;
  }

  // 驾驶偏好
  if (drivingPreference === 'comfort' || drivingPreference === '舒适') {
    candidates.sort((a, b) => (b.comfortScore ?? 0) - (a.comfortScore ?? 0));
  } else if (drivingPreference === 'offroad' || drivingPreference === '越野') {
    candidates.sort((a, b) => (b.roadScore ?? 0) - (a.roadScore ?? 0));
  }

  // 返回前 5 条，去重 vehicleId
  const VEHICLE_FALLBACKS = {
    brand: '', model: '', vehicleLevel: '中型', bodyType: 'SUV', energyType: '',
    driveType: '', fuelConsumption: '', groundClearance: '', luggageCapacity: '',
    trunkSpace: '', summarySentence: '', bestUseCase: '', notSuitableCase: '',
    commonProblems: '', recommendationLevel: '可选',
  };
  const seen = new Set();
  const result = [];
  for (const rec of candidates) {
    if (seen.has(rec.vehicleId)) continue;
    seen.add(rec.vehicleId);
    result.push(sanitizeRecord({
      vehicleId: rec.vehicleId,
      brand: rec.brand,
      model: rec.model,
      vehicleLevel: rec.vehicleLevel,
      bodyType: rec.bodyType,
      energyType: rec.energyType,
      driveType: rec.driveType,
      seatCount: rec.seatCount,
      suitablePeopleCount: rec.suitablePeopleCount,
      fuelConsumption: rec.fuelConsumption,
      groundClearance: rec.groundClearance,
      luggageCapacity: rec.luggageCapacity,
      trunkSpace: rec.trunkSpace,
      summarySentence: rec.summarySentence,
      bestUseCase: rec.bestUseCase,
      notSuitableCase: rec.notSuitableCase,
      commonProblems: rec.commonProblems,
      overallScore: rec.overallScore,
      recommendationLevel: rec.recommendationLevel,
      energyRiskScore: rec.energyRiskScore,
      comfortScore: rec.comfortScore,
      spaceScore: rec.spaceScore,
      roadScore: rec.roadScore,
      costScore: rec.costScore,
    }, VEHICLE_FALLBACKS));
    if (result.length >= 5) break;
  }

  return result;
}

/* ========================================================================
   6. buildDestinationContext — 将 JSON 目的地数据转为自然语言上下文
   ======================================================================== */

const DESTINATION_SCENE_MAP = {
  伊犁环线: {
    intro: '伊犁环线从乌鲁木齐出发，全程约2000公里，建议留7-10天。草原雪山为主，路况整体不错但距离长，独库公路部分路段有限行时间，山区天气多变。',
    highlights: '景点之间距离较远，路上时间比逛景点的时间可能还长，对车辆续航和长途舒适性要求较高。',
    energyHint: '沿途加油站间隔较大，纯电车型需要仔细规划补能点，插电混动和增程式是兼顾电驱体验和补能安全的稳妥选择。',
    comfortHint: '每天在车上的时间不短，座椅支撑、隔音和辅助驾驶带来的体验差异比想象中大。',
  },
  川西小环线: {
    intro: '川西小环线从成都出发，全程约900公里，建议留5-7天。海拔变化大、山路多弯，部分垭口可能有冰雪，沿途充电设施不足。',
    highlights: '海拔变化大、山路多、部分路段窄，对车辆动力、底盘和刹车稳定性要求比城市道路高很多。',
    energyHint: '高原和山路对纯电车型的续航管理要求更高，充电设施覆盖不足，建议优先看插电混动、增程或油车。',
    comfortHint: '高海拔路段小排量自然吸气车型动力衰减明显，超车和爬坡时可能吃力。',
  },
  青甘大环线: {
    intro: '青甘大环线从西宁出发，全程约2500公里，建议留7-10天。穿越戈壁荒漠，部分路段信号差，注意横风和夏季高温。',
    highlights: '距离超长、戈壁荒漠路段充电稀缺，对车辆续航和可靠性要求极高，适合时间充裕、有一定自驾经验的用户。',
    energyHint: '偏远路段充电站覆盖还不能完全放心，油车或增程的补能确定性更高，不建议在这个场景下贸然选纯电。',
    comfortHint: '每天驾驶距离较长，座椅舒适性和续航容错率被放大，建议优先看舒适性配置到位的车型。',
  },
  海南环岛自驾: {
    intro: '海南环岛从海口出发，全程约800公里，建议留5-7天。路况好、充电设施完善、环岛高速免费，对车型的硬性要求整体不高。',
    highlights: '城市和景区之间距离可控，路况轻松、补能便利，各种能源类型都合适，注意三亚市区停车较贵、节假日可能拥堵。',
    energyHint: '充电设施完善，纯电车型使用成本优势明显，增程和混动也完全没问题。',
    comfortHint: '对底盘和动力要求不高，可以优先考虑好停车、能耗低、乘坐舒服的车型。',
  },
  昆大丽香线: {
    intro: '昆大丽香线从昆明出发，全程约1200公里，建议留7-9天。海拔逐步升高，丽江至香格里拉段山路多弯，注意高反和雨雪天气。',
    highlights: '海拔逐步升高、山路弯多，对车辆舒适性和动力有一定要求，沿途充电条件一般。',
    energyHint: '云南山区充电设施覆盖还不够密集，纯电需要提前确认沿途充电站分布，增程或混动是更稳妥的选择。',
    comfortHint: '长途山路对座椅支撑和隔音要求不低，建议在预算允许范围内适当提升舒适性配置的优先级。',
  },
};

export function buildDestinationContext(destinationInput) {
  const profile = findDestinationProfile(destinationInput);
  if (!profile) return null;

  const scene = DESTINATION_SCENE_MAP[profile.name] || null;

  return {
    name: sanitize(profile.name, '该目的地'),
    startCity: sanitize(profile.startCity),
    totalMileage: sanitize(profile.totalMileage),
    recommendedDays: sanitize(profile.recommendedDays),
    roadType: sanitize(profile.roadType),
    chargingCondition: sanitize(profile.chargingCondition),
    altitudeRisk: sanitize(profile.altitudeRisk),
    comfortImportance: sanitize(profile.comfortImportance),
    beginnerDifficulty: sanitize(profile.beginnerDifficulty),
    routeSummary: sanitize(profile.routeSummary),
    drivingWarning: sanitize(profile.drivingWarning),
    suitableEnergy: Array.isArray(profile.suitableEnergy) ? profile.suitableEnergy : [],
    notRecommendedEnergy: Array.isArray(profile.notRecommendedEnergy) ? profile.notRecommendedEnergy : [],
    // 自然语言文案
    intro: sanitize(scene ? scene.intro : profile.routeSummary, '路线信息收集中，先按通用逻辑给你建议'),
    highlights: sanitize(scene ? scene.highlights : ''),
    energyHint: sanitize(scene ? scene.energyHint : ''),
    comfortHint: sanitize(scene ? scene.comfortHint : ''),
  };
}

/* ========================================================================
   7. buildOneLinerSummary — 生成推荐结论的一句话口语总结
   ======================================================================== */

const ROUTE_SNIPPETS = {
  伊犁环线: '路线长、景点分散',
  川西小环线: '高原和山路场景比较多',
  青甘大环线: '距离超长、戈壁荒漠路段多',
  海南环岛自驾: '路况轻松、补能方便',
  昆大丽香线: '海拔逐步升高、山路弯多',
};

const ENERGY_SNIPPETS = {
  'recommend-oil-strong': '油车或增程',
  'recommend-oil': '油车、插混或增程',
  'recommend-extended': '增程或混动',
  'ev-friendly': '纯电或增程',
  both: '油车或新能源都行',
};

export function buildOneLinerSummary(destContext, result, topVehicles, form) {
  const destName = destContext ? destContext.name : '这个目的地';
  const peopleRaw = form.peopleCount || '';
  const peopleLabel = peopleRaw === '1-2' ? '1-2' : peopleRaw === '3-4' ? '3-4' : peopleRaw === '5' ? '5' : peopleRaw === '6+' ? '6+' : '';
  const luggageRaw = form.luggage || '';
  const luggageLabel = luggageRaw === 'light' ? '行李不多' : luggageRaw === 'medium' ? '行李适中' : luggageRaw === 'heavy' ? '行李较多' : '';

  // 路线特征
  const routeSnippet = destContext
    ? (ROUTE_SNIPPETS[destContext.name] || destContext.routeSummary.slice(0, 20))
    : '';

  // 车型推荐方向
  const primaryCategory = result.primary ? result.primary.category : '';
  const energyLevel = result.energyAdvice ? result.energyAdvice.level : '';
  const energyLabel = result.energyAdvice ? result.energyAdvice.recommended : '';

  // 示例车型
  const exampleNames = topVehicles && topVehicles.length
    ? topVehicles.slice(0, 3).map((v) => `${v.brand}${v.model}`).join('、')
    : '';

  // 拼接：你这次【目的地】 【人数】人自驾，【路线特征】；【推荐方向】【示例】
  const parts = [`你这次${destName}`];
  if (peopleLabel) parts.push(` ${peopleLabel}人自驾`);

  if (routeSnippet) {
    parts.push(`，${routeSnippet}`);
  }

  if (luggageLabel && luggageLabel !== '行李不多') {
    parts.push(`，${luggageLabel}`);
  }

  // 车型方向句
  if (primaryCategory) {
    const shortCategory = primaryCategory.replace(/ \/ /g, '/');
    if (energyLabel && energyLabel.length < 20) {
      parts.push(`，一辆${shortCategory}就比较合适；想省心优先看${energyLabel}`);
    } else {
      parts.push(`，一辆${shortCategory}就比较合适`);
    }
  } else if (energyLabel && energyLabel.length < 20) {
    parts.push(`，可以优先看${energyLabel}`);
  }

  // 车型示例
  if (exampleNames) {
    parts.push(`，比如${exampleNames}`);
  }

  let summary = parts.join('');
  // 确保以自然结尾
  if (!summary.endsWith('。') && !summary.endsWith('）') && !summary.endsWith(')')) {
    summary += '这类车源';
  }

  return summary;
}

/* ========================================================================
   8. buildSearchKeywords — 生成租车平台搜索关键词
   ======================================================================== */

export function buildSearchKeywords(result) {
  if (!result || (!result.length && !result.primary)) return [];

  const vehicles = result.length ? result : (result.primary ? [result.primary] : []);
  const keywords = new Set();

  for (const v of vehicles) {
    if (!v) continue;

    // 车身类型
    if (v.bodyType) {
      keywords.add(v.bodyType);
    }

    // 车型级别
    if (v.vehicleLevel) {
      keywords.add(v.vehicleLevel);
    }

    // 能源类型组合关键词
    if (v.energyType && v.bodyType) {
      keywords.add(`${v.energyType} ${v.bodyType}`);
    }

    // 品牌 + 车型级别
    if (v.brand && v.vehicleLevel) {
      keywords.add(`${v.brand} ${v.vehicleLevel}`);
    }

    // 具体车型同级搜索
    if (v.brand && v.model) {
      keywords.add(`${v.brand}${v.model}`);
      keywords.add(`${v.brand}${v.model} 同级`);
    }

    // 驱动方式
    if (v.driveType && v.bodyType === 'SUV') {
      keywords.add(v.driveType);
    }

    // 自动挡（通用关键词）
    keywords.add('自动挡');
  }

  return Array.from(keywords).slice(0, 12);
}

/* ========================================================================
   9. buildWhyNotAdvice — 生成"为什么不建议"解释文案
   ======================================================================== */

export function buildWhyNotAdvice(result, destinationInput, options = {}) {
  const profile = findDestinationProfile(destinationInput);
  const destName = profile ? profile.name : (destinationInput || '该目的地');
  const advices = [];

  // 纯电谨慎建议
  if (profile && profile.notRecommendedEnergy && profile.notRecommendedEnergy.includes('纯电动')) {
    advices.push(
      `${destName}沿途充电设施覆盖还不完善，长距离路段间隔较大，纯电车型需要提前仔细规划补能路线。建议优先看插电混动或增程式，既有电驱静谧和低成本，加油补能又不用完全依赖充电站。`,
    );
  }

  // 只选最低价的提醒
  if (options.budgetPreference === 'budget' || options.budgetPreference === '省钱优先') {
    advices.push(
      '低价车型在日租金上确实便宜，但长途自驾中座椅舒适性、隔音和续航容错率的差异会被放大。建议在满足空间下限的前提下，优先看性价比高的车型，不必只盯着最低日租金。',
    );
  }

  // 盲目上大车的提醒
  if (options.peopleCount && parseInt(options.peopleCount, 10) <= 2) {
    const hasLargeInResult = result && result.length && result.some((r) => r.vehicleLevel === '中大型' || r.vehicleLevel === '大型');
    if (hasLargeInResult) {
      advices.push(
        '1-2人出行不需要盲目上大车，紧凑型或中型车在灵活性和停车便利性上更好，租金也更划算。把省下的预算留给路上的体验和美食。',
      );
    }
  }

  // MPV 与 SUV 的选择建议
  if (options.peopleCount && parseInt(options.peopleCount, 10) >= 5) {
    advices.push(
      '多人出行时，MPV的第三排乘坐舒适性和后备箱空间通常优于同级别大型SUV。如果行程较长，建议优先考虑MPV而非7座SUV。',
    );
  }

  // 高海拔/山路动力提醒
  if (profile && (profile.altitudeRisk === '高' || profile.altitudeRisk === '中高')) {
    advices.push(
      `${destName}海拔变化大、山路较多，小排量自然吸气车型在高原路段动力衰减明显，超车和爬坡时可能吃力。建议选择涡轮增压、混动或动力储备更充足的车型。`,
    );
  }

  // 长距离舒适性提醒
  if (profile && profile.comfortImportance === '高') {
    advices.push(
      `${destName}每天在路上的时间不短，座椅支撑、隔音和辅助驾驶配置带来的体验差异比想象中大。建议在预算允许范围内适当提升舒适性配置的优先级。`,
    );
  }

  return advices;
}

/* ========================================================================
   10. buildTradeOffAdvice — 生成"为什么不建议这样选"的条件权衡解释
   ======================================================================== */

export function buildTradeOffAdvice(destContext, form) {
  if (!form) return null;

  const destName = destContext ? destContext.name : '';
  const pref = form.preference || '';
  const peopleRaw = form.peopleCount || '';
  const peopleNum = parseInt(peopleRaw, 10);
  const peopleLabel = peopleRaw === '1-2' ? '1-2' : peopleRaw === '3-4' ? '3-4' : peopleRaw === '5' ? '5' : peopleRaw === '6+' ? '6+' : '';
  const luggage = form.luggage || '';
  const notRecommendedEnergy = destContext ? (destContext.notRecommendedEnergy || []) : [];

  // 条件 1：省钱优先 + 人数>=3 或行李较多
  if ((pref === 'budget' || pref === '省钱优先') && (peopleNum >= 3 || luggage === 'heavy')) {
    const peopleNote = peopleLabel ? ` ${peopleLabel}人出行` : '';
    const luggageNote = luggage === 'heavy' ? '加上行李较多' : '';
    const extraNote = [peopleNote, luggageNote].filter(Boolean).join('，');
    return {
      title: '为什么不建议只看最低价？',
      body: `你偏好省钱${extraNote ? `，但${extraNote}` : ''}，小型车或紧凑型轿车后备箱可能吃紧；这次更建议在预算内优先看紧凑型 SUV 或中型 SUV，而不是只选最低价小车。`,
    };
  }

  // 条件 2：目的地不推荐纯电 + 用户偏好新能源
  if (notRecommendedEnergy.includes('纯电动') && (pref === 'ev' || pref === '新能源优先')) {
    const hasAltitude = destContext && (destContext.altitudeRisk === '高' || destContext.altitudeRisk === '中高');
    const reason = hasAltitude
      ? '存在长距离、高海拔或补能不均的问题'
      : '存在长距离或补能分布不均的问题';
    return {
      title: '为什么纯电要谨慎？',
      body: `${destName ? `${destName}` : '这条路线'}${reason}，纯电不是不能开，但需要提前规划沿途充电点；如果是第一次走这条路线，更建议汽油、插混或增程。`,
    };
  }

  // 条件 3：舒适优先（推荐通常不需要上豪华车）
  if (pref === 'comfort' || pref === '舒适优先') {
    return {
      title: '为什么不必盲目上大车？',
      body: `你更看重舒适，但这次不一定需要直接上大型豪华 SUV；中型或中大型 SUV 已经能覆盖空间、长途舒适和路况适应，性价比更均衡。`,
    };
  }

  // 条件 4：人数 <= 2 且目的地轻松（如海南）
  if (peopleNum <= 2 && destContext && destContext.altitudeRisk === '低') {
    return {
      title: '为什么不必盲目上大车？',
      body: `这次${destName ? `${destName}` : ''}路况轻松、人数不多，不必为了安全感盲目租大车；好停车、能耗低、取还方便反而更重要。`,
    };
  }

  // 条件 5：兜底 — 均衡说明
  return {
    title: '为什么这类车更均衡？',
    body: '这次推荐优先平衡空间、补能、路况和预算，不是单纯选最便宜或最大的一类车。',
  };
}

/* ========================================================================
   11. buildDataNotice — 返回数据质量提示（未匹配目的地 / 车型不足 等）
   ======================================================================== */

export function buildDataNotice(destContext, topVehicles, form) {
  const notice = { level: null, message: '' };

  // 场景 1：有路线数据但车型示例不足
  if (destContext && (!topVehicles || topVehicles.length < 2)) {
    notice.level = 'info';
    notice.message = `已匹配到${destContext.name}的路线数据，但当前车型示例较少，可在租车平台按车型级别筛选更多车源。`;
    return notice;
  }

  // 场景 2：能源冲突提示（轻量提醒，不阻断）
  if (destContext && destContext.notRecommendedEnergy.includes('纯电动') && form.preference === 'ev') {
    notice.level = 'tip';
    notice.message = '纯电在这条路线可以选择，但建议提前规划沿途补能点；如果是第一次去，更建议汽油、插混或增程。';
    return notice;
  }

  return notice;
}
