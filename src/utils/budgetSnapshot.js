const VERSION = 1;
const STORAGE_KEY = 'pyuy_budget_snapshot_v1';

/**
 * 保存预算快照到 localStorage
 * @param {object} draft - 当前表单草稿
 * @param {object} result - 预算计算结果
 * @param {object|null} selectedPlan - 已选租车方案
 * @returns {boolean} 是否保存成功
 */
export function saveBudgetSnapshot(draft, result, selectedPlan) {
  const snapshot = {
    version: VERSION,
    draft,
    result: pickResultFields(result),
    selectedPlan: selectedPlan ? pickPlanFields(selectedPlan) : null,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

/**
 * 从 localStorage 读取预算快照
 * 版本不匹配或数据损坏时自动清除并返回 null
 * @returns {object|null} 快照对象或 null
 */
export function loadBudgetSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const snapshot = JSON.parse(raw);

    if (!snapshot || snapshot.version !== VERSION || !snapshot.draft) {
      clearInvalidBudgetSnapshot();
      return null;
    }

    return snapshot;
  } catch {
    clearInvalidBudgetSnapshot();
    return null;
  }
}

/**
 * 清除损坏或不兼容的预算快照
 */
export function clearInvalidBudgetSnapshot() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 静默忽略
  }
}

function pickResultFields(result) {
  return {
    tripDays: result.tripDays,
    people: result.people,
    mileage: result.mileage,
    energyLabel: result.energyLabel,
    tripTotal: result.tripTotal,
    perPerson: result.perPerson,
    dailyAverage: result.dailyAverage,
    perPersonDaily: result.perPersonDaily,
    temporaryFunds: result.temporaryFunds,
    preparedFunds: result.preparedFunds,
    vehicleCostRatio: result.vehicleCostRatio,
    vehicleTransport: result.vehicleTransport,
    lodgingDining: result.lodgingDining,
    scenic: result.scenic,
    bigTraffic: result.bigTraffic,
    otherFees: result.otherFees,
    budgetLevel: result.budgetLevel,
    completenessPercent: result.completenessPercent,
    completenessText: result.completenessText,
    isRoughEstimate: result.isRoughEstimate,
    vehicleCostJudgment: result.vehicleCostJudgment,
    budgetSummary: result.budgetSummary,
    suggestions: result.suggestions,
  };
}

function pickPlanFields(plan) {
  return {
    platform: plan.platform,
    carModel: plan.carModel,
    insurancePlan: plan.insurancePlan,
    totalPrice: plan.totalPrice,
  };
}
