import { carRecommendationRules, destinations, recommendations } from '../data/car-recommendation/index.js';

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
  城区近郊: '城区近郊轻自驾',
  市郊短途: '城区近郊轻自驾',
  城市周边: '城区近郊轻自驾',
  周边短途: '城区近郊轻自驾',

  // 伊犁环线
  伊犁: '草原戈壁大长线',
  新疆伊犁: '草原戈壁大长线',
  赛里木湖: '草原戈壁大长线',
  那拉提: '草原戈壁大长线',
  独库公路: '草原戈壁大长线',
  新疆: '草原戈壁大长线',
  北疆: '草原戈壁大长线',

  // 川西小环线
  川西: '山地高原山路',
  川西大环线: '山地高原山路',
  稻城亚丁: '山地高原山路',
  色达: '山地高原山路',
  新都桥: '山地高原山路',
  '318': '山地高原山路',
  川藏线: '山地高原山路',
  四姑娘山: '山地高原山路',
  理塘: '山地高原山路',

  // 青甘大环线
  青甘: '草原戈壁大长线',
  青甘环线: '草原戈壁大长线',
  西北环线: '草原戈壁大长线',
  青海湖: '草原戈壁大长线',
  敦煌: '草原戈壁大长线',
  大柴旦: '草原戈壁大长线',
  青海: '草原戈壁大长线',
  甘肃: '草原戈壁大长线',
  河西走廊: '草原戈壁大长线',

  // 海南环岛自驾
  三亚: '海岛滨海环线',
  海南: '海岛滨海环线',
  海南环岛: '海岛滨海环线',
  三亚环岛: '海岛滨海环线',
  海口: '海岛滨海环线',
  万宁: '海岛滨海环线',
  陵水: '海岛滨海环线',
  青岛: '海岛滨海环线',
  厦门: '海岛滨海环线',
  威海: '海岛滨海环线',

  // 昆大丽香线
  云南: '山地高原山路',
  滇西北: '山地高原山路',
  大理: '山地高原山路',
  丽江: '山地高原山路',
  香格里拉: '山地高原山路',
  泸沽湖: '山地高原山路',
  昆明: '山地高原山路',
  西双版纳: '山地高原山路',
  腾冲: '山地高原山路',
};

export function normalizeDestinationName(input) {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // 直接命中 JSON 中的标准名称
  const exact = destinations.find((d) => d.name === trimmed || d.shortName === trimmed);
  if (exact) return exact.name;

  // 别名映射
  if (ALIAS_MAP[trimmed]) return ALIAS_MAP[trimmed];

  // 模糊匹配：输入包含标准名
  for (const d of destinations) {
    if (trimmed.includes(d.name) || d.name.includes(trimmed) || (d.shortName && (trimmed.includes(d.shortName) || d.shortName.includes(trimmed)))) {
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
  if (!profile) {
    return recommendations
      .filter((r) => r.recommendationLevel !== '不建议')
      .sort((a, b) => {
        const pa = LEVEL_PRIORITY[a.recommendationLevel] ?? 99;
        const pb = LEVEL_PRIORITY[b.recommendationLevel] ?? 99;
        if (pa !== pb) return pa - pb;
        return (b.overallScore ?? 0) - (a.overallScore ?? 0);
      });
  }

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
    horsepower: rec.horsepower,
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
  if (n >= 6) return rec.seatCount >= 6 || rec.bodyType === 'MPV';
  if (n >= 5) return rec.seatCount >= 5;
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

const LEVEL_SCORE = {
  很差: 1,
  差: 1,
  较差: 2,
  一般: 2.6,
  中等: 3,
  较好: 4,
  好: 4.5,
  很好: 5,
  优秀: 5,
};

const DESTINATION_TYPE_BY_NAME = {
  城区近郊轻自驾: '城区近郊',
  海岛滨海环线: '海岛滨海',
  山地高原山路: '山地高原',
  草原戈壁大长线: '草原戈壁',
};

const DESTINATION_KEY_TO_RULE_TYPE = {
  'city-short': '城区近郊',
  'island-leisure': '海岛滨海',
  'mountain-plateau': '山地高原',
  'yunnan-mountain': '山地高原',
  'grassland-gobi': '草原戈壁',
  'grassland-long': '草原戈壁',
  'loop-long': '草原戈壁',
};

function getDestinationRuleType(profile) {
  if (!profile) return '';
  return DESTINATION_TYPE_BY_NAME[profile.name] || DESTINATION_KEY_TO_RULE_TYPE[profile.type] || profile.shortName || profile.name || '';
}

function getDestinationCategory(profile) {
  const ruleType = getDestinationRuleType(profile);
  if (ruleType === '城区近郊') return 'city-short';
  if (ruleType === '海岛滨海') return 'island-leisure';
  if (ruleType === '山地高原') return 'mountain-plateau';
  if (ruleType === '草原戈壁') return 'grassland-gobi';
  return profile?.type || '';
}

function parsePeopleNumber(value) {
  if (value === '6+' || value === '6人及以上') return 6;
  if (value === '5') return 5;
  if (value === '3-4') return 4;
  if (value === '1-2') return 2;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function levelScore(value, fallback = 3) {
  const text = String(value || '').trim();
  if (!text) return fallback;
  for (const [key, score] of Object.entries(LEVEL_SCORE)) {
    if (text.includes(key)) return score;
  }
  if (text.includes('容易') || text.includes('简单')) return 5;
  if (text.includes('困难') || text.includes('较大') || text.includes('高')) return 2;
  return fallback;
}

function parseHorsepower(value) {
  const nums = String(value || '').match(/\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number).filter(Number.isFinite));
}

function getPowerLabel(rec) {
  const hp = parseHorsepower(rec.horsepower);
  if (!hp) return '';
  if (hp >= 300) return '动力更充足';
  if (hp >= 180) return '动力够用';
  return '动力偏日常';
}

function getPowerAdjustment(rec, profile, options = {}) {
  const hp = parseHorsepower(rec.horsepower);
  if (!hp) return 0;

  const category = getDestinationCategory(profile);
  const people = parsePeopleNumber(options.peopleCount);
  const heavyLoad = people >= 4 || options.luggageLevel === 'heavy';
  const complexRoute = ['mountain-plateau', 'grassland-gobi'].includes(category);

  if (complexRoute || heavyLoad) {
    if (hp >= 300) return 0.32;
    if (hp >= 220) return 0.22;
    if (hp >= 160) return 0.08;
    return -0.22;
  }

  if (category === 'city-short' && people <= 2 && options.luggageLevel !== 'heavy') {
    if (hp >= 300) return -0.08;
    if (hp >= 160) return 0.04;
    return 0;
  }

  return hp >= 180 ? 0.08 : 0;
}

function getBodyTypeAdjustment(rec, profile) {
  const category = getDestinationCategory(profile);
  const body = `${rec.bodyType || ''}${rec.vehicleLevel || ''}${rec.carType || ''}`;

  // 优先使用目的地画像中的偏好/非偏好车身类型
  const preferredBody = profile?.preferredBodyTypes || [];
  const notPreferredBody = profile?.notPreferredBodyTypes || [];
  const preferredLevel = profile?.preferredVehicleLevels || [];
  const notPreferredLevel = profile?.notPreferredVehicleLevels || [];

  if (preferredBody.length || notPreferredBody.length) {
    let score = 0;
    const bodyType = rec.bodyType || '';
    const level = rec.vehicleLevel || '';

    for (const pref of preferredBody) {
      if (bodyType.includes(pref) || pref.includes(bodyType)) { score += 0.2; break; }
    }
    for (const notPref of notPreferredBody) {
      if (bodyType.includes(notPref) || notPref.includes(bodyType)) { score -= 0.22; break; }
    }
    for (const pref of preferredLevel) {
      if (level.includes(pref) || pref.includes(level)) { score += 0.12; break; }
    }
    for (const notPref of notPreferredLevel) {
      if (level.includes(notPref) || notPref.includes(level)) { score -= 0.12; break; }
    }
    if (score !== 0) return score;
  }

  // 降级：使用硬编码规则
  if (category === 'city-short') {
    if (/轿车|小型|紧凑/.test(body)) return 0.18;
    if (/大型|中大型|MPV|硬派/.test(body)) return -0.18;
  }

  if (category === 'island-leisure') {
    if (/轿车|SUV|紧凑|中型/.test(body)) return 0.12;
    if (/硬派越野/.test(body)) return -0.18;
  }

  if (category === 'mountain-plateau') {
    if (/SUV|越野/.test(body)) return 0.2;
    if (/小型|轿车/.test(body)) return -0.14;
  }

  if (category === 'grassland-gobi') {
    if (/中型|中大型|SUV|MPV/.test(body)) return 0.2;
    if (/小型|两厢/.test(body)) return -0.18;
  }

  return 0;
}

function getPeopleLuggageAdjustment(rec, options = {}) {
  const people = parsePeopleNumber(options.peopleCount);
  const seats = Number(rec.seatCount) || 0;
  const suitable = Number(rec.suitablePeopleCount) || 0;
  let score = 0;

  if (people >= 6 && seats < 6) score -= 1.2;
  else if (people >= 5 && seats < 5) score -= 1;
  else if (people >= 5 && (rec.bodyType === 'MPV' || seats >= 6)) score += 0.28;
  else if (people >= 3 && seats >= 5) score += 0.12;
  else if (people <= 2 && /小型|紧凑型|两厢|三厢/.test(`${rec.vehicleLevel || ''}${rec.bodyType || ''}`)) score += 0.12;

  if (suitable && people && suitable < people) score -= 0.35;

  const luggageScore = levelScore(rec.luggageCapacity || rec.trunkSpace, 3);
  if (options.luggageLevel === 'heavy') {
    score += (luggageScore - 3) * 0.18;
    if (people >= 4 && luggageScore < 3.5) score -= 0.45;
  } else if (options.luggageLevel === 'light' && people <= 2 && /大型|中大型|MPV/.test(`${rec.vehicleLevel || ''}${rec.bodyType || ''}`)) {
    score -= 0.12;
  }

  return score;
}

function getDrivingAdjustment(rec, options = {}) {
  const drivingPreference = options.drivingPreference;
  if (!drivingPreference) return 0;

  const drivingScore = levelScore(rec.drivingDifficulty, 3);
  const parkingScore = levelScore(rec.parkingDifficulty, 3);
  const largeOrHard = /大型|中大型|MPV|硬派|越野/.test(`${rec.vehicleLevel || ''}${rec.bodyType || ''}${rec.bestUseCase || ''}`);
  const hp = parseHorsepower(rec.horsepower);

  if (drivingPreference === 'beginner' || drivingPreference === '新手') {
    let score = (rec.beginnerFriendlyScore || 3) * 0.08 + (rec.parkingScore || 3) * 0.05;
    if (drivingScore < 3 || parkingScore < 3 || largeOrHard) score -= 0.35;
    if (hp >= 350) score -= 0.12;
    return score;
  }

  if (drivingPreference === 'experienced' || drivingPreference === '熟练') {
    return (rec.roadScore || 3) * 0.08 + (largeOrHard ? 0.08 : 0);
  }

  return 0;
}

function getEnergyAdjustment(rec, profile, options = {}) {
  const pref = options.energyPreference;
  const energy = rec.energyType || '';
  const category = getDestinationCategory(profile);
  const notRecommendedEnergy = profile ? (profile.notRecommendedEnergy || []) : [];
  let score = 0;

  if (pref === 'ev' || pref === 'electric' || pref === '新能源优先') {
    if (['纯电动', '增程式', '插电混动'].includes(energy)) score += 0.28;
    if (energy === '纯电动' && ['mountain-plateau', 'grassland-gobi'].includes(category)) score -= 0.55;
  } else if (pref === 'oil' || pref === 'fuel' || pref === '油车优先') {
    if (['汽油', '油电混动'].includes(energy)) score += 0.24;
  } else if (pref === 'hybrid' || pref === '混动/增程优先') {
    if (['油电混动', '插电混动', '增程式'].includes(energy)) score += 0.28;
  }

  if (notRecommendedEnergy.includes(energy)) score -= 0.7;

  if (category === 'city-short' || category === 'island-leisure') {
    if (['纯电动', '插电混动', '增程式'].includes(energy)) score += 0.12;
  }

  if (category === 'mountain-plateau' || category === 'grassland-gobi') {
    if (['汽油', '油电混动', '插电混动', '增程式'].includes(energy)) score += 0.15;
  }

  return score;
}

function getRulesWeightAdjustment(rec, profile) {
  const ruleType = getDestinationRuleType(profile);
  const weights = carRecommendationRules?.destinationWeights?.[ruleType] || {};
  const bonus = carRecommendationRules?.bonusRules?.[ruleType] || {};
  let score = 0;

  if (weights.horsepower) score += getPowerAdjustment(rec, profile, {}) * Math.min(weights.horsepower / 6, 1);
  if (weights.parking_difficulty) score += (rec.parkingScore || 3) * 0.015;
  if (weights.energy_type) score += (rec.energyRiskScore || 3) * 0.015;
  if (weights.seat_comfort || weights.long_distance_comfort) score += (rec.comfortScore || 3) * 0.012;
  if (weights.rear_space || weights.trunk_space) score += (rec.spaceScore || 3) * 0.012;

  if (bonus.four_wheel_drive && /四驱|AWD|4WD/.test(rec.driveType || '')) score += 0.12;
  if (bonus.long_distance_comfort_good && levelScore(rec.longDistanceComfort, 3) >= 4) score += 0.12;
  if (bonus.parking_easy && levelScore(rec.parkingDifficulty, 3) >= 4) score += 0.1;

  return score;
}

function buildRecommendationReason(rec, profile, options = {}) {
  const parts = [];
  const powerLabel = getPowerLabel(rec);
  const category = getDestinationCategory(profile);

  if (category === 'mountain-plateau' && (options.drivingPreference === 'beginner' || options.peopleCount === '1-2')) {
    parts.push('城市山路和窄路较多，车身不宜过大');
  } else if (category === 'mountain-plateau' && options.luggageLevel === 'heavy') {
    parts.push('山路高原满载出行，更看动力储备和补能稳定性');
  } else if (category === 'grassland-gobi') {
    parts.push('长途距离长，空间、舒适性和补能稳定性更重要');
  } else if (category === 'city-short') {
    parts.push('城市短途更看重好开好停和低使用成本');
  }

  if (powerLabel && ['mountain-plateau', 'grassland-gobi'].includes(category)) parts.push(powerLabel);
  if (options.luggageLevel === 'heavy' && (rec.luggageCapacity || rec.trunkSpace)) parts.push(`行李空间${rec.luggageCapacity || rec.trunkSpace}`);
  if ((options.drivingPreference === 'beginner' || options.drivingPreference === '新手') && rec.parkingDifficulty) parts.push(`停车${rec.parkingDifficulty}`);
  if (rec.reason) {
    parts.push(...String(rec.reason).split(/[；;]+/).filter(Boolean).slice(0, 2));
  }

  return parts.filter(Boolean).slice(0, 4).join('；');
}

function buildAdjustedRecommendation(rec, profile, options = {}) {
  const destinationFit = Number(rec.overallScore) || 0;
  const typeFit = getBodyTypeAdjustment(rec, profile);
  const powerFit = getPowerAdjustment(rec, profile, options);
  const peopleLuggageFit = getPeopleLuggageAdjustment(rec, options);
  const drivingFit = getDrivingAdjustment(rec, options);
  const energyFit = getEnergyAdjustment(rec, profile, options);
  const ruleFit = getRulesWeightAdjustment(rec, profile);
  const warningPenalty = rec.recommendationLevel === '不建议' ? -1.2 : rec.recommendationLevel === '谨慎选择' ? -0.6 : 0;
  const recommendationScore = destinationFit + typeFit + powerFit + peopleLuggageFit + drivingFit + energyFit + ruleFit + warningPenalty;

  return {
    ...rec,
    recommendationScore: Math.round(recommendationScore * 100) / 100,
    powerReserveLabel: getPowerLabel(rec),
    reason: buildRecommendationReason(rec, profile, options),
    scoreBreakdown: {
      destinationFit,
      typeFit,
      powerFit,
      peopleLuggageFit,
      drivingFit,
      energyFit,
      ruleFit,
      warningPenalty,
    },
  };
}

export function getTopVehicleExamples(destinationInput, options = {}) {
  const allRecs = getRecommendationsByDestination(destinationInput);
  if (!allRecs.length) return [];

  const profile = findDestinationProfile(destinationInput);
  const { peopleCount, luggageLevel, budgetPreference } = options;

  // 从非"不建议"的推荐开始
  let candidates = allRecs.filter((r) => r.recommendationLevel !== '不建议');

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

  candidates = candidates.map((rec) => buildAdjustedRecommendation(rec, profile, options));

  // 预算偏好 — 基于 JSON 实际 costScore 排序和车型级别过滤
  if (budgetPreference === 'budget' || budgetPreference === '省钱优先') {
    // 省钱：排除大型/中大型，按 costScore 降序
    const budgetFriendly = candidates.filter(
      (r) => r.vehicleLevel !== '大型' && r.vehicleLevel !== '中大型',
    );
    if (budgetFriendly.length >= 3) candidates = budgetFriendly;
    candidates.sort((a, b) => (b.costScore ?? 0) - (a.costScore ?? 0) || (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0));
  } else if (budgetPreference === 'comfort' || budgetPreference === '舒适优先') {
    // 舒适：按 comfortScore 降序
    candidates.sort((a, b) => (b.comfortScore ?? 0) - (a.comfortScore ?? 0) || (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0));
  } else {
    // 默认：使用新车型库目的地评分 + 规则微调后的综合分
    candidates.sort((a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0));
  }

  // 返回指定数量，去重 vehicleId
  const limit = options.limit ?? 5;
  const VEHICLE_FALLBACKS = {
    brand: '', model: '', vehicleLevel: '中型', bodyType: 'SUV', energyType: '',
    driveType: '', fuelConsumption: '', officialRange: '', realRangeEstimate: '',
    groundClearance: '', luggageCapacity: '',
    trunkSpace: '', summarySentence: '', bestUseCase: '', notSuitableCase: '',
    commonProblems: '', recommendationLevel: '可选', priceTier: '',
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
      priceTier: rec.priceTier,
      driveType: rec.driveType,
      horsepower: rec.horsepower,
      officialRange: rec.officialRange,
      realRangeEstimate: rec.realRangeEstimate,
      powerReserveLabel: rec.powerReserveLabel,
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
      recommendationScore: rec.recommendationScore,
      scoreBreakdown: rec.scoreBreakdown,
      recommendationLevel: rec.recommendationLevel,
      energyRiskScore: rec.energyRiskScore,
      comfortScore: rec.comfortScore,
      spaceScore: rec.spaceScore,
      roadScore: rec.roadScore,
      parkingScore: rec.parkingScore,
      costScore: rec.costScore,
      beginnerFriendlyScore: rec.beginnerFriendlyScore,
      drivingDifficulty: rec.drivingDifficulty,
      parkingDifficulty: rec.parkingDifficulty,
      longDistanceComfort: rec.longDistanceComfort,
      seatComfort: rec.seatComfort,
      rearSpace: rec.rearSpace,
      reason: rec.reason,
    }, VEHICLE_FALLBACKS));
    if (result.length >= limit) break;
  }

  return result;
}

const PRICE_TIER_ORDER = ['低', '中', '高'];
const PRICE_TIER_LABELS = {
  低: '低价方案',
  中: '中价方案',
  高: '高价方案',
};

function normalizePriceTier(value) {
  if (!value) return '';
  if (PRICE_TIER_ORDER.includes(value)) return value;
  if (String(value).includes('低')) return '低';
  if (String(value).includes('中')) return '中';
  if (String(value).includes('高')) return '高';
  return '';
}

function scoreTierCandidate(rec, options = {}) {
  let score = rec.recommendationScore ?? rec.overallScore ?? 0;
  const { drivingPreference } = options;

  if (drivingPreference === 'beginner') {
    score += (rec.beginnerFriendlyScore ?? 0) * 0.06;
    score += (rec.parkingScore ?? 0) * 0.04;
  }

  if (drivingPreference === 'experienced') {
    score += (rec.roadScore ?? 0) * 0.05;
    score += (rec.comfortScore ?? 0) * 0.03;
  }

  if (options.tripIntensity === 'high') {
    score += (rec.comfortScore ?? 0) * 0.04;
  }

  if (options.luggageLevel === 'heavy') {
    score += (rec.spaceScore ?? 0) * 0.05;
  }

  return score;
}

export function getTieredVehicleRecommendations(destinationInput, options = {}) {
  const allRecs = getTopVehicleExamples(destinationInput, {
    ...options,
    budgetPreference: '',
    limit: 80,
  });

  if (!allRecs.length) return [];

  const selected = [];
  const used = new Set();

  for (const tier of PRICE_TIER_ORDER) {
    const tierCandidates = allRecs
      .filter((rec) => normalizePriceTier(rec.priceTier) === tier && !used.has(rec.vehicleId))
      .sort((a, b) => scoreTierCandidate(b, options) - scoreTierCandidate(a, options));

    const picked = tierCandidates[0];
    if (picked) {
      used.add(picked.vehicleId);
      selected.push({
        ...picked,
        priceTier: tier,
        priceTierLabel: PRICE_TIER_LABELS[tier],
      });
    }
  }

  if (selected.length < 3) {
    const missingTiers = PRICE_TIER_ORDER.filter((tier) => !selected.some((rec) => rec.priceTier === tier));
    const fillers = allRecs
      .filter((rec) => !used.has(rec.vehicleId))
      .sort((a, b) => scoreTierCandidate(b, options) - scoreTierCandidate(a, options));

    for (const rec of fillers) {
      const tier = missingTiers.shift() || normalizePriceTier(rec.priceTier) || PRICE_TIER_ORDER[selected.length] || '中';
      selected.push({
        ...rec,
        priceTier: tier,
        priceTierLabel: PRICE_TIER_LABELS[tier] || '推荐方案',
      });
      used.add(rec.vehicleId);
      if (selected.length >= 3) break;
    }
  }

  return selected
    .slice(0, 3)
    .sort((a, b) => PRICE_TIER_ORDER.indexOf(a.priceTier) - PRICE_TIER_ORDER.indexOf(b.priceTier));
}

/* ========================================================================
   6. buildDestinationContext — 将 JSON 目的地数据转为自然语言上下文
   ======================================================================== */

const DESTINATION_SCENE_MAP = {
  城区近郊轻自驾: {
    intro: '城区近郊轻自驾以城市道路、快速路和短途高速为主，核心是好开好停、省钱省心，停车便利性比大车气场更重要。',
    highlights: '单日里程短、停车频率高，适合紧凑轿车、小型 SUV、混动或纯电车型。',
    energyHint: '补能条件整体友好，纯电、插混、增程和油车都能选，重点看取还车和停车是否方便。',
    comfortHint: '不必过度追求大车和高马力，灵活、低成本、好停车更实用。',
  },
  海岛滨海环线: {
    intro: '海岛滨海环线以铺装路、高速和沿海公路为主，海拔低、补能友好，适合轻松舒适的自驾节奏。',
    highlights: '路况轻松，舒适、空调、空间和能耗更值得关注，不需要默认上硬派越野。',
    energyHint: '滨海城市充电条件通常较好，纯电、插混和增程都可以纳入选择。',
    comfortHint: '长时间吹空调和城市景区停车较多，座椅舒适、能耗和停车便利性会影响体验。',
  },
  山地高原山路: {
    intro: '山地高原山路包含高速、国道、山路和县道，海拔变化与连续爬坡会放大动力、底盘和补能容错率的重要性。',
    highlights: '山路、高原和窄路较多，优先看动力储备、底盘通过性、补能便利和驾驶难度。',
    energyHint: '纯电需要谨慎规划补能，油车、插混和增程通常更稳。',
    comfortHint: '满载爬坡和长时间驾驶对动力、制动、座椅支撑和隔音要求更高。',
  },
  草原戈壁大长线: {
    intro: '草原戈壁大长线距离长、路段空旷，部分区域补能和维修距离较远，对可靠性、续航和长途舒适性要求高。',
    highlights: '每天驾驶时间长，空间、续航、补能确定性和长途舒适性会被明显放大。',
    energyHint: '油车、插混或增程更稳；纯电除非补能规划非常明确，否则不建议作为默认首选。',
    comfortHint: '座椅舒适、后排空间、后备箱和辅助驾驶会直接影响长途体验。',
  },
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

const DESTINATION_TYPE_SNIPPETS = {
  'city-short': '城市短途更看重好开好停和低使用成本',
  'island-leisure': '补能友好',
  'mountain-plateau': '山路和海拔变化多',
  'grassland-gobi': '路线长、补能压力更高',
  'yunnan-mountain': '城市和山路混合',
  'grassland-long': '路线长、景点分散',
  'loop-long': '长途和补能压力更高',
  unsure: '先按稳妥方案',
};

const ENERGY_SNIPPETS = {
  'recommend-oil-strong': '油车或增程',
  'recommend-oil': '油车、插混或增程',
  'recommend-extended': '增程或混动',
  'ev-friendly': '纯电或增程',
  both: '油车或新能源都行',
};

export function buildOneLinerSummary(destContext, result, topVehicles, form) {
  const destName = result?.tripProfile?.type || '这类路线';
  const peopleRaw = form.peopleCount || '';
  const peopleLabel = peopleRaw === '1-2' ? '1-2' : peopleRaw === '3-4' ? '3-4' : peopleRaw === '5' ? '5' : peopleRaw === '6+' ? '6+' : '';
  const luggageRaw = form.luggage || '';
  const luggageLabel = luggageRaw === 'light' ? '行李不多' : luggageRaw === 'medium' ? '行李适中' : luggageRaw === 'heavy' ? '行李较多' : '';

  // 路线特征
  const routeSnippet = DESTINATION_TYPE_SNIPPETS[form.destinationType] || '';

  // 车型推荐方向
  const primaryCategory = result.primary ? result.primary.category : '';
  const energyLabel = result.energyAdvice ? result.energyAdvice.recommended : '';

  // 拼接：你这次【目的地】 【人数】人自驾，【路线特征】；【推荐方向】【示例】
  const parts = [`这次${destName}`];
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
      parts.push(`，优先看${shortCategory}；能源选${energyLabel}`);
    } else {
      parts.push(`，优先看${shortCategory}`);
    }
  } else if (energyLabel && energyLabel.length < 20) {
    parts.push(`，可以优先看${energyLabel}`);
  }

  let summary = parts.join('');
  // 确保以自然结尾
  if (!summary.endsWith('。') && !summary.endsWith('）') && !summary.endsWith(')')) {
    summary += '。';
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
  const destName = options.destinationLabel || '这类路线';
  const advices = [];

  // 纯电谨慎建议
  if (profile && profile.notRecommendedEnergy && profile.notRecommendedEnergy.includes('纯电动')) {
    advices.push(
      `${destName}补能不确定性较高，纯电需要提前规划。更省心的方向是插混或增程。`,
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
      `${destName}有山路或海拔变化，小排量车型可能吃力，建议选择动力更充足的车型。`,
    );
  }

  // 长距离舒适性提醒
  if (profile && profile.comfortImportance === '高') {
    advices.push(
      `${destName}长途舒适性更重要，座椅、隔音和辅助驾驶可以适当优先。`,
    );
  }

  return advices;
}

/* ========================================================================
   10. buildTradeOffAdvice — 生成"为什么不建议这样选"的条件权衡解释
   ======================================================================== */

export function buildTradeOffAdvice(destContext, form) {
  if (!form) return null;

  const pref = form.energyPreference || form.preference || '';
  const peopleRaw = form.peopleCount || '';
  const peopleNum = parseInt(peopleRaw, 10);
  const peopleLabel = peopleRaw === '1-2' ? '1-2' : peopleRaw === '3-4' ? '3-4' : peopleRaw === '5' ? '5' : peopleRaw === '6+' ? '6+' : '';
  const luggage = form.luggage || '';
  const notRecommendedEnergy = destContext ? (destContext.notRecommendedEnergy || []) : [];

  // 条件 1：目的地不推荐纯电 + 用户偏好新能源
  if (notRecommendedEnergy.includes('纯电动') && (pref === 'ev' || pref === '新能源优先')) {
    const hasAltitude = destContext && (destContext.altitudeRisk === '高' || destContext.altitudeRisk === '中高');
    const reason = hasAltitude
      ? '存在长距离、高海拔或补能不均的问题'
      : '存在长距离或补能分布不均的问题';
    return {
      title: '为什么纯电要谨慎？',
      body: `这类路线${reason}，纯电需要提前规划充电点；第一次走，更建议汽油、插混或增程。`,
    };
  }

  // 条件 2：人数 <= 2 且目的地轻松（如海南）
  if (peopleNum <= 2 && destContext && destContext.altitudeRisk === '低') {
    return {
      title: '为什么不必盲目上大车？',
      body: '这类路线较轻松、人数不多，不必盲目租大车；好停车、能耗低、取还方便反而更重要。',
    };
  }

  // 条件 3：兜底 — 均衡说明
  return {
    title: '为什么这类车更均衡？',
    body: '这次推荐优先平衡空间、补能、路况、驾驶难度和预算档位，不是单纯选最便宜或最大的一类车。',
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
    notice.message = '当前车型示例较少，可在租车平台按车型级别筛选更多车源。';
    return notice;
  }

  // 场景 2：能源冲突提示（轻量提醒，不阻断）
  if (destContext && destContext.notRecommendedEnergy.includes('纯电动') && form.energyPreference === 'ev') {
    notice.level = 'tip';
    notice.message = '纯电在这条路线可以选择，但建议提前规划沿途补能点；如果是第一次去，更建议汽油、插混或增程。';
    return notice;
  }

  return notice;
}
