/**
 * 车身验车工具函数 — 保险联动 & 点位查询
 *
 * 依赖：
 *   - src/data/vehicleInspectionZones.js  (点位结构化数据)
 *   - src/data/insurancePlans.js           (保险方案数据)
 *   - src/utils/insuranceUtils.js          (findInsurancePlan 等)
 */

import {
  allInspectionZones,
  inspectionZonesByView,
  primaryZonesByView,
  PRIORITY_WEIGHT,
} from '../data/vehicleInspectionZones.js';
import {
  findInsurancePlan,
  getPlatformInsurancePlans,
  isPremiumPlan,
  isBasicPlan,
  getTierLabel,
} from './insuranceUtils.js';

// ============================================================================
// 1. 点位查询
// ============================================================================

/**
 * 按视角获取点位
 * @param {'front'|'side'|'rear'} view
 * @param {{ primaryOnly?: boolean }} options
 * @returns {object[]}
 */
export function getInspectionZonesByView(view, { primaryOnly = true } = {}) {
  const source = primaryOnly ? primaryZonesByView : inspectionZonesByView;
  return source[view] || [];
}

/**
 * 根据 ID 获取单个点位
 * @param {string} zoneId
 * @returns {object | undefined}
 */
export function getZoneById(zoneId) {
  return allInspectionZones.find((z) => z.id === zoneId);
}

/**
 * 获取所有点位 ID
 * @param {{ primaryOnly?: boolean }} options
 * @returns {string[]}
 */
export function getAllZoneIds({ primaryOnly = false } = {}) {
  const zones = primaryOnly
    ? allInspectionZones.filter((z) => z.primary)
    : allInspectionZones;
  return zones.map((z) => z.id);
}

// ============================================================================
// 2. 保险方案 → 重点部位计算
// ============================================================================

/**
 * 判断某个保险维度的覆盖是否"薄弱"（需要重点验车）
 */
function isCoverageWeak(value) {
  if (value === false) return true;
  if (value === '部分') return true;
  if (typeof value === 'string' && !value.includes('0 元') && !value.includes('全部')) return true;
  return false;
}

/**
 * 判断车损险是否有客户自付部分
 */
function hasCustomerPay(plan) {
  const pay = plan?.vehicleDamage?.customerPay;
  if (!pay || typeof pay !== 'string') return null;
  // "0 元" / "0 元及以下" 表示客户自付为 0（全免）
  if (pay.startsWith('0 元') || pay === '0') return false;
  return true;
}

/**
 * 解析保险方案的薄弱维度
 * @returns {{ tireWheel: boolean, vehicleDamage: boolean, downtime: boolean, depreciation: boolean, glass: boolean, isPremium: boolean }}
 */
function analyzePlanWeaknesses(plan) {
  if (!plan) {
    return {
      tireWheel: false,
      vehicleDamage: false,
      downtime: false,
      depreciation: false,
      glass: false,
      isPremium: false,
    };
  }

  return {
    tireWheel: isCoverageWeak(plan.tireWheel?.covered),
    vehicleDamage: hasCustomerPay(plan) === true,
    downtime: isCoverageWeak(plan.downtime?.covered),
    depreciation: isCoverageWeak(plan.depreciation?.covered),
    // 玻璃：covered 为 false 或未明确时视为薄弱
    glass: plan.glass?.covered !== true,
    isPremium: isPremiumPlan(plan),
  };
}

/**
 * 根据保险方案返回需要重点关注的部位
 *
 * @param {object | null} insurancePlan — 来自 INSURANCE_PLANS 的方案对象
 * @param {{ view?: 'front'|'side'|'rear', primaryOnly?: boolean }} options
 * @returns {object[]} 带 triggerReasons 的点位数组（按优先级降序排列）
 */
export function getInsuranceSensitiveZones(insurancePlan, { view, primaryOnly = true } = {}) {
  const weaknesses = analyzePlanWeaknesses(insurancePlan);

  // 没有保险方案，或所有维度都覆盖良好 → 返回空
  const hasWeakness = Object.entries(weaknesses).some(
    ([k, v]) => k !== 'isPremium' && v === true,
  );
  if (!hasWeakness && !weaknesses.isPremium) return [];

  const sourceZones = view
    ? getInspectionZonesByView(view, { primaryOnly })
    : (primaryOnly
        ? allInspectionZones.filter((z) => z.primary)
        : allInspectionZones);

  const results = [];

  for (const zone of sourceZones) {
    const reasons = [];

    // 轮胎/轮毂薄弱 + 点位关联 tireWheel
    if (weaknesses.tireWheel && zone.insuranceKeys.includes('tireWheel')) {
      reasons.push({
        dimension: 'tireWheel',
        label: '轮胎/轮毂不覆盖',
        detail: '当前保障对轮胎/轮毂单独损伤不覆盖或仅部分覆盖',
        weight: 3,
      });
    }

    // 车损自付 + 点位关联 vehicleDamage
    if (weaknesses.vehicleDamage && zone.insuranceKeys.includes('vehicleDamage')) {
      reasons.push({
        dimension: 'vehicleDamage',
        label: '存在车损自付',
        detail: `车损自付额：${insurancePlan.vehicleDamage?.customerPay || '待确认'}，小额损伤需自行承担`,
        weight: 2,
      });
    }

    // 停运费不覆盖 + 点位关联 downtime
    if (weaknesses.downtime && zone.insuranceKeys.includes('downtime')) {
      reasons.push({
        dimension: 'downtime',
        label: '停运费不覆盖',
        detail: '事故维修期间可能产生停运费，建议保留完整留证',
        weight: 2,
      });
    }

    // 折旧费 + 点位关联 depreciation
    if (weaknesses.depreciation && zone.insuranceKeys.includes('depreciation')) {
      reasons.push({
        dimension: 'depreciation',
        label: '折旧/贬值可能承担',
        detail: '重大事故可能涉及折旧/贬值责任',
        weight: 1,
      });
    }

    // 玻璃 + 点位关联 glass
    if (weaknesses.glass && zone.insuranceKeys.includes('glass')) {
      reasons.push({
        dimension: 'glass',
        label: '玻璃保障不明确',
        detail: '玻璃单独破损可能不在保障范围内，建议核对下单页',
        weight: 3,
      });
    }

    if (reasons.length > 0) {
      results.push({
        ...zone,
        triggerReasons: reasons.sort((a, b) => b.weight - a.weight),
        _sensitiveWeight: reasons.reduce((sum, r) => sum + r.weight, 0),
      });
    }
  }

  // 按敏感权重降序排列
  results.sort((a, b) => b._sensitiveWeight - a._sensitiveWeight);

  return results;
}

// ============================================================================
// 3. 增强优先级计算
// ============================================================================

/**
 * 根据基础优先级 + 保险方案，计算增强后的点位显示优先级
 *
 * @param {object} zone           — 点位数据
 * @param {object | null} insurancePlan — 保险方案
 * @returns {{ level: 'must'|'warning'|'normal', reason: string, upgrade: boolean }}
 */
export function getEnhancedZonePriority(zone, insurancePlan) {
  const baseLevel = zone.basePriority || 'normal';
  const weaknesses = analyzePlanWeaknesses(insurancePlan);

  if (!insurancePlan) {
    return { level: baseLevel, reason: '未选择保险方案，使用基础优先级', upgrade: false };
  }

  // 检查该点位是否有薄弱维度
  let hitCount = 0;
  const hitLabels = [];

  if (weaknesses.tireWheel && zone.insuranceKeys.includes('tireWheel')) {
    hitCount++;
    hitLabels.push('轮胎/轮毂');
  }
  if (weaknesses.vehicleDamage && zone.insuranceKeys.includes('vehicleDamage')) {
    hitCount++;
    hitLabels.push('车损自付');
  }
  if (weaknesses.downtime && zone.insuranceKeys.includes('downtime')) {
    hitCount++;
    hitLabels.push('停运费');
  }
  if (weaknesses.depreciation && zone.insuranceKeys.includes('depreciation')) {
    hitCount++;
    hitLabels.push('折旧费');
  }
  if (weaknesses.glass && zone.insuranceKeys.includes('glass')) {
    hitCount++;
    hitLabels.push('玻璃');
  }

  // 升级逻辑
  let level = baseLevel;

  if (hitCount > 0) {
    if (baseLevel === 'normal') level = 'warning';
    else if (baseLevel === 'warning') level = 'must';
    // must stays must
  }

  // 高保障方案轻度降级（但仍保留提醒）
  if (weaknesses.isPremium && hitCount === 0) {
    if (baseLevel === 'must') level = 'warning';
    else if (baseLevel === 'warning') level = 'normal';
  }

  const reason = hitCount > 0
    ? `保险薄弱项（${hitLabels.join('、')}）触发升级：${baseLevel} → ${level}`
    : weaknesses.isPremium
      ? '高保障方案，优先级略微降低（仍建议完整留证）'
      : '基础优先级，无保险触发';

  return { level, reason, upgrade: level !== baseLevel };
}

// ============================================================================
// 4. 保险联动提示
// ============================================================================

/**
 * 根据当前点位和保险方案生成额外提示文案
 *
 * @param {object} zone           — 点位数据
 * @param {object | null} insurancePlan — 保险方案
 * @returns {{ tip: string, severity: 'strong'|'medium'|'mild'|'note' } | null}
 */
export function getInsuranceLinkedTips(zone, insurancePlan) {
  if (!insurancePlan || !zone) return null;

  const weaknesses = analyzePlanWeaknesses(insurancePlan);
  const keys = zone.insuranceKeys || [];

  // ── 轮胎/轮毂专项 ──
  if (weaknesses.tireWheel && keys.includes('tireWheel')) {
    return {
      tip: '当前保障对轮胎/轮毂不一定友好，建议重点拍胎壁、胎面、轮毂边缘和旧伤。',
      severity: 'strong',
    };
  }

  // ── 车损自付 + 外观件 ──
  if (weaknesses.vehicleDamage && keys.includes('vehicleDamage')) {
    const payAmount = insurancePlan.vehicleDamage?.customerPay || '待确认';
    return {
      tip: `当前方案存在小额车损自付（${payAmount}），小划痕、小凹陷、小掉漆也建议拍清楚。`,
      severity: 'strong',
    };
  }

  // ── 停运费 + 关键外观件 ──
  if (weaknesses.downtime && keys.includes('downtime')) {
    return {
      tip: '如果事故导致维修，可能涉及停运费。建议保留下单页保障说明、事故照片和沟通记录。',
      severity: 'medium',
    };
  }

  // ── 折旧费 ──
  if (weaknesses.depreciation && keys.includes('depreciation')) {
    return {
      tip: '重大事故可能涉及折旧/贬值责任，出险后务必按平台流程报警、报案、留存材料。',
      severity: 'mild',
    };
  }

  // ── 玻璃 ──
  if (weaknesses.glass && keys.includes('glass')) {
    return {
      tip: '当前方案对玻璃单独破损的覆盖不明确，建议核对下单页并重点拍清玻璃现状。',
      severity: 'strong',
    };
  }

  // ── 无薄弱项 → 通用提示 ──
  if (weaknesses.isPremium) {
    return {
      tip: '高保障能降低部分意外支出，但不代表可以省略验车。免责条款、未及时报案、涉水后二次启动、违法驾驶等情况仍可能不赔。',
      severity: 'note',
    };
  }

  return null;
}

// ============================================================================
// 5. 保险方案汇总提示
// ============================================================================

/**
 * 生成保险方案级别的汇总验车建议
 *
 * @param {object | null} insurancePlan
 * @returns {{ summary: string, warnings: string[], disclaimer: string } | null}
 */
export function getInsuranceSummaryTips(insurancePlan) {
  if (!insurancePlan) return null;

  const weaknesses = analyzePlanWeaknesses(insurancePlan);
  const warnings = [];

  if (weaknesses.tireWheel) {
    warnings.push('轮胎/轮毂不覆盖：四个轮胎和轮毂建议逐一拍摄近照，包括胎壁、胎面和轮毂边缘。');
  }

  if (weaknesses.vehicleDamage) {
    const pay = insurancePlan.vehicleDamage?.customerPay || '待确认';
    warnings.push(`车损自付 ${pay}：前后保险杠、车门、后视镜、大灯/尾灯、侧裙等位置的小损伤也建议拍清楚。`);
  }

  if (weaknesses.downtime) {
    warnings.push('停运费不覆盖/部分覆盖：涉及外观维修的部位（保险杠、灯具、车门、后备厢盖）建议重点留证。');
  }

  if (weaknesses.depreciation) {
    warnings.push('重大事故可能产生折旧/贬值责任，出险后按平台流程报警报案并留存完整材料。');
  }

  if (weaknesses.glass) {
    warnings.push('玻璃单独破损保障不明确：前挡、后挡、车窗玻璃建议各拍一张现状。');
  }

  if (weaknesses.isPremium && warnings.length === 0) {
    warnings.push('高保障方案覆盖较全面，但仍建议完整验车留证。免责条款和未及时报案等情况不在保障范围内。');
  }

  if (warnings.length === 0) {
    warnings.push('当前方案各维度覆盖较全，但仍建议按常规流程完整验车留证。');
  }

  return {
    summary: `${insurancePlan.platform || ''}「${insurancePlan.name || ''}」（${getTierLabel(insurancePlan)}）验车建议`,
    warnings,
    disclaimer: '以上建议基于公开保障信息整理，具体权益和免责条件下单页展示的合同和保险条款为准。',
  };
}

// ============================================================================
// 6. 辅助：新格式 → 兼容转换
// ============================================================================

/**
 * 将新版点位格式转为旧版组件兼容格式
 * 方便后续渐进式迁移组件时使用
 *
 * @param {object} zone — 新版点位
 * @returns {object} 旧版兼容格式
 */
export function toLegacyHotspotFormat(zone) {
  // basePriority + baseTags → riskLevel
  let riskLevel;
  if (zone.basePriority === 'must' && zone.baseTags?.includes('易争议')) {
    riskLevel = '高频争议';
  } else if (zone.basePriority === 'must' || zone.baseTags?.includes('必拍')) {
    riskLevel = '重点留证';
  } else {
    riskLevel = '容易忽略';
  }

  return {
    id: zone.id,
    view: zone.view,
    name: zone.label,
    label: zone.label.length > 3 ? zone.label.slice(0, 3) : zone.label,
    shortLabel: zone.label.length > 4 ? zone.label.slice(0, 4) : zone.label,
    riskLevel,
    checkPoints: zone.whatToCheck,
    photoTips: zone.howToShoot,
    warning: zone.note,
    position: {
      left: zone.x,
      top: zone.y,
      width: 12,
      height: 12,
    },
  };
}

export { PRIORITY_WEIGHT };
