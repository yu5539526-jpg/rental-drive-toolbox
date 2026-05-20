/**
 * 保险数据工具函数
 *
 * 所有函数基于 src/data/insurancePlans.js 的结构化数据。
 * 不包含任何保险价格信息。
 */

import {
  INSURANCE_PLATFORMS,
  INSURANCE_PLANS,
  INSURANCE_TERMS,
  INSURANCE_SCENARIO_RULES,
  INSURANCE_CHECKLIST_TIPS,
  INSURANCE_DISCLAIMER,
} from '../data/insurancePlans.js';

// ============================================================================
// 1. 按平台名称获取保险方案列表
// ============================================================================

/**
 * @param {string} platformName — 用户输入的平台名称（支持别名模糊匹配）
 * @returns {{ platform: object, plans: object[] } | null}
 */
export function getPlatformInsurancePlans(platformName) {
  if (!platformName || typeof platformName !== 'string') return null;

  const normalized = platformName.trim().toLowerCase();

  const platform = INSURANCE_PLATFORMS.find((p) => {
    if (p.id === normalized || p.name === normalized) return true;
    return p.aliases.some((alias) => alias.toLowerCase() === normalized || normalized.includes(alias.toLowerCase()));
  });

  if (!platform) return null;

  const plans = INSURANCE_PLANS.filter((plan) => plan.platformId === platform.id);

  return { platform, plans };
}

// ============================================================================
// 2. 查找特定保险方案
// ============================================================================

/**
 * @param {string} platformName — 平台名称
 * @param {string} planName     — 保险方案名称
 * @returns {object | null}
 */
export function findInsurancePlan(platformName, planName) {
  const result = getPlatformInsurancePlans(platformName);
  if (!result || !planName) return null;

  const normalizedPlan = planName.trim().toLowerCase();

  return (
    result.plans.find(
      (p) =>
        p.name.toLowerCase() === normalizedPlan ||
        p.id.toLowerCase() === normalizedPlan,
    ) || null
  );
}

// ============================================================================
// 3. 比较两个保险方案
// ============================================================================

/**
 * 比较两个保险方案的保障维度差异
 *
 * @param {object} planA — 第一个保险方案（来自 INSURANCE_PLANS）
 * @param {object} planB — 第二个保险方案（来自 INSURANCE_PLANS）
 * @returns {object} 比较结果
 */
export function compareInsurancePlans(planA, planB) {
  if (!planA || !planB) {
    return { valid: false, message: '需要两个有效的保险方案才能比较' };
  }

  const dimensions = [];

  // —— 车损自付额 ——
  dimensions.push({
    label: '车损自付额',
    icon: 'vehicleDamage',
    valueA: planA.vehicleDamage?.customerPay || '未知',
    valueB: planB.vehicleDamage?.customerPay || '未知',
    difference: compareVehicleDamage(planA, planB),
    important: true,
  });

  // —— 三者额度 ——
  dimensions.push({
    label: '三者险额度',
    icon: 'thirdParty',
    valueA: formatThirdParty(planA),
    valueB: formatThirdParty(planB),
    difference: compareThirdParty(planA, planB),
    important: true,
  });

  // —— 轮胎/轮毂 ——
  dimensions.push({
    label: '轮胎/轮毂',
    icon: 'tireWheel',
    valueA: formatCovered(planA.tireWheel?.covered),
    valueB: formatCovered(planB.tireWheel?.covered),
    difference: compareCoverage('tireWheel', planA, planB),
    important: true,
  });

  // —— 玻璃单独破损 ——
  dimensions.push({
    label: '玻璃单独破损',
    icon: 'glass',
    valueA: formatCovered(planA.glass?.covered),
    valueB: formatCovered(planB.glass?.covered),
    difference: compareCoverage('glass', planA, planB),
    important: false,
  });

  // —— 停运费 ——
  dimensions.push({
    label: '停运费',
    icon: 'downtime',
    valueA: formatCovered(planA.downtime?.covered),
    valueB: formatCovered(planB.downtime?.covered),
    difference: compareCoverage('downtime', planA, planB),
    important: true,
  });

  // —— 折旧/贬值 ——
  dimensions.push({
    label: '折旧/贬值',
    icon: 'depreciation',
    valueA: formatCovered(planA.depreciation?.covered),
    valueB: formatCovered(planB.depreciation?.covered),
    difference: compareCoverage('depreciation', planA, planB),
    important: true,
  });

  // —— 司机保障 ——
  dimensions.push({
    label: '司机保障',
    icon: 'driverPassenger',
    valueA: planA.driverPassenger?.driver || '未显示',
    valueB: planB.driverPassenger?.driver || '未显示',
    difference: compareDriver(planA, planB),
    important: false,
  });

  // —— 乘客保障 ——
  dimensions.push({
    label: '乘客保障',
    icon: 'driverPassenger',
    valueA: planA.driverPassenger?.passenger || '未显示',
    valueB: planB.driverPassenger?.passenger || '未显示',
    difference: comparePassenger(planA, planB),
    important: false,
  });

  // —— 医保外医疗费用 ——
  dimensions.push({
    label: '医保外医疗费用',
    icon: 'medicalOutsideInsurance',
    valueA: formatCovered(planA.medicalOutsideInsurance?.covered),
    valueB: formatCovered(planB.medicalOutsideInsurance?.covered),
    difference: compareCoverage('medicalOutsideInsurance', planA, planB),
    important: false,
  });

  // —— 费用垫付 ——
  dimensions.push({
    label: '费用垫付',
    icon: 'advancePayment',
    valueA: planA.advancePayment?.required === false ? '无需垫付' : planA.advancePayment?.required === true ? '需垫付' : '未明确',
    valueB: planB.advancePayment?.required === false ? '无需垫付' : planB.advancePayment?.required === true ? '需垫付' : '未明确',
    difference: compareAdvancePayment(planA, planB),
    important: false,
  });

  // —— 关键风险提示 ——
  const keyWarningsA = planA.keyWarnings || [];
  const keyWarningsB = planB.keyWarnings || [];
  const commonWarnings = keyWarningsA.filter((w) => keyWarningsB.includes(w));
  const uniqueWarningsA = keyWarningsA.filter((w) => !keyWarningsB.includes(w));
  const uniqueWarningsB = keyWarningsB.filter((w) => !keyWarningsA.includes(w));

  // 汇总判断
  const betterDims = dimensions.filter((d) => d.difference === 'A更优').length;
  const worseDims = dimensions.filter((d) => d.difference === 'B更优').length;
  const summaryJudgment =
    betterDims > worseDims
      ? `保障维度比较：${planA.platform}「${planA.name}」在 ${betterDims} 个维度上优于 ${planB.platform}「${planB.name}」（${worseDims} 个维度较弱）`
      : worseDims > betterDims
        ? `保障维度比较：${planB.platform}「${planB.name}」在 ${worseDims} 个维度上优于 ${planA.platform}「${planA.name}」（${betterDims} 个维度较弱）`
        : `保障维度比较：${planA.platform}「${planA.name}」与 ${planB.platform}「${planB.name}」保障水平接近`;

  return {
    valid: true,
    planA: { platform: planA.platform, name: planA.name, tier: planA.tier },
    planB: { platform: planB.platform, name: planB.name, tier: planB.tier },
    dimensions,
    commonWarnings,
    uniqueWarningsA,
    uniqueWarningsB,
    summaryJudgment,
    disclaimer: INSURANCE_DISCLAIMER,
  };
}

// ============================================================================
// 4. 场景化保险建议
// ============================================================================

/**
 * @param {object} context
 *   context.destination      — 目的地名称（如"伊犁"、"川西"）
 *   context.destinationType  — 目的地类型（如"mountain-plateau"、"loop-long"）
 *   context.tripIntensity    — 行程强度（"easy"/"medium"/"high"）
 *   context.peopleCount      — 出行人数（数字或字符串）
 *   context.people           — 出行人数（备选字段）
 *   context.tripDays         — 出行天数
 *   context.preference       — 用车偏好（"budget"/"comfort"/"reliable"/"ev"/"photo"）
 *   context.isBeginner       — 是否新手
 *   context.experience       — 经验描述（含"新手"/"第一次"等关键词）
 *   context.budgetConscious  — 是否预算敏感
 *
 * @returns {object} { matched, advices, disclaimer }
 */
export function getInsuranceAdviceByScenario(context = {}) {
  const matchedRules = INSURANCE_SCENARIO_RULES.filter((rule) => rule.match(context));

  if (!matchedRules.length) {
    return {
      matched: false,
      advices: [
        {
          ruleId: 'default',
          priorityTags: ['vehicleDamage', 'thirdParty', 'tireWheel'],
          riskTags: ['不同平台和车型的保障差异较大，建议下单前仔细核对保障详情'],
          tierAdvice: 'standard',
          reason:
            '当前未匹配到特定场景规则。一般建议：长途或复杂路线优先考虑高保障方案，城市短途可选择中等保障。具体请在下单页核对车损自付额、三者额度和轮胎/停运费覆盖情况。',
          disclaimerNote: INSURANCE_DISCLAIMER,
        },
      ],
      disclaimer: INSURANCE_DISCLAIMER,
    };
  }

  const advices = matchedRules.map((rule) => ({
    ruleId: rule.id,
    priorityTags: rule.priorityTags,
    riskTags: rule.riskTags,
    tierAdvice: rule.tierAdvice,
    reason: rule.reason,
    disclaimerNote: rule.disclaimerNote || INSURANCE_DISCLAIMER,
  }));

  return {
    matched: true,
    advices,
    suggestedTier: advices[0].tierAdvice,
    disclaimer: INSURANCE_DISCLAIMER,
  };
}

// ============================================================================
// 5. 验车拍照提醒
// ============================================================================

/**
 * @param {string} platformName — 平台名称
 * @param {string} planName     — 保险方案名称
 * @returns {object} { title, items, notice }
 */
export function getChecklistInsuranceTips(platformName, planName) {
  const plan = planName ? findInsurancePlan(platformName, planName) : null;
  const result = getPlatformInsurancePlans(platformName);

  const tips = { ...INSURANCE_CHECKLIST_TIPS.default };

  if (result && result.platform) {
    const platformTips = INSURANCE_CHECKLIST_TIPS.byPlatform[result.platform.id];
    if (platformTips) {
      const isBasic = plan ? plan.tier === 'basic' : true;
      tips.notice = isBasic ? platformTips.basicNotice : platformTips.premiumNotice;
    }
  }

  // 如果找到具体方案，增加方案特定的风险提示
  if (plan) {
    tips.planSpecific = {
      name: plan.name,
      platform: plan.platform,
      vehicleDamage: plan.vehicleDamage?.summary || '',
      tireWheelNote: plan.tireWheel?.note || '',
      downtimeNote: plan.downtime?.note || '',
      keyWarnings: plan.keyWarnings || [],
    };
  }

  tips.disclaimer = INSURANCE_DISCLAIMER;

  return tips;
}

// ============================================================================
// 辅助函数
// ============================================================================

export { INSURANCE_DISCLAIMER, INSURANCE_TERMS };

/** 获取方案的车损自付简要文本 */
export function getVehicleDamageShort(plan) {
  if (!plan || !plan.vehicleDamage) return '未知';
  return plan.vehicleDamage.customerPay || plan.vehicleDamage.summary || '未知';
}

/** 判断方案是否为高保障 */
export function isPremiumPlan(plan) {
  return plan?.tier === 'premium' || plan?.tier === 'special';
}

/** 判断方案是否为基础保障 */
export function isBasicPlan(plan) {
  return plan?.tier === 'basic' || plan?.requiredType === 'required';
}

/** 获取保障层级的中文标签 */
export function getTierLabel(plan) {
  if (!plan) return '未知';
  const labels = { basic: '基础保障', standard: '中等保障', premium: '高保障', special: '特殊产品' };
  return labels[plan.tier] || '其他';
}

/** 获取保障层级的样式类名（配合项目现有设计 token） */
export function getTierBadgeClass(plan) {
  if (!plan) return 'bg-aquaCard text-muted';
  const classes = {
    basic: 'bg-aquaCard text-muted',
    standard: 'bg-mint text-pine',
    premium: 'bg-amberSoft/40 text-amberDark',
    special: 'bg-pine text-white',
  };
  return classes[plan.tier] || 'bg-aquaCard text-muted';
}

// ============================================================================
// 内部辅助
// ============================================================================

function formatCovered(value) {
  if (value === true) return '覆盖';
  if (value === false) return '不覆盖';
  if (value === '部分') return '部分覆盖';
  if (typeof value === 'string') return value;
  return '未明确';
}

function formatThirdParty(plan) {
  if (!plan || !plan.thirdParty) return '未知';
  return `${plan.thirdParty.amount} ${plan.thirdParty.unit}`;
}

function compareVehicleDamage(planA, planB) {
  const payA = planA?.vehicleDamage?.customerPay || '';
  const payB = planB?.vehicleDamage?.customerPay || '';
  if (payA === payB) return '相同';
  if (payA.includes('0 元') && !payB.includes('0 元')) return 'A更优';
  if (payB.includes('0 元') && !payA.includes('0 元')) return 'B更优';
  return '有差异';
}

function compareThirdParty(planA, planB) {
  const amountA = planA?.thirdParty?.amount || 0;
  const amountB = planB?.thirdParty?.amount || 0;
  if (amountA === amountB) return '相同';
  return amountA > amountB ? 'A更优' : 'B更优';
}

function compareCoverage(dimension, planA, planB) {
  const valA = planA?.[dimension]?.covered;
  const valB = planB?.[dimension]?.covered;

  const score = (v) => {
    if (v === true) return 3;
    if (v === '部分') return 2;
    if (v === false) return 1;
    return 0; // 未知
  };

  const scoreA = score(valA);
  const scoreB = score(valB);

  if (scoreA === scoreB) return '相同';
  return scoreA > scoreB ? 'A更优' : 'B更优';
}

function compareDriver(planA, planB) {
  const driverA = extractAmount(planA?.driverPassenger?.driver);
  const driverB = extractAmount(planB?.driverPassenger?.driver);
  if (driverA === driverB) return '相同';
  if (driverA === null || driverB === null) return '信息不全';
  return driverA > driverB ? 'A更优' : 'B更优';
}

function comparePassenger(planA, planB) {
  const passA = extractAmount(planA?.driverPassenger?.passenger);
  const passB = extractAmount(planB?.driverPassenger?.passenger);
  if (passA === passB) return '相同';
  if (passA === null && passB === null) return '均未显示';
  if (passA === null) return 'A未显示';
  if (passB === null) return 'B未显示';
  return passA > passB ? 'A更优' : 'B更优';
}

function compareAdvancePayment(planA, planB) {
  const reqA = planA?.advancePayment?.required;
  const reqB = planB?.advancePayment?.required;
  if (reqA === reqB) return '相同';
  if (reqA === false && reqB !== false) return 'A更优';
  if (reqB === false && reqA !== false) return 'B更优';
  return '有差异';
}

function extractAmount(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
