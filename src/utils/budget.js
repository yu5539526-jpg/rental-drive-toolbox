import { ENERGY_DEFAULTS } from '../constants/energyDefaults.js';

const amount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const count = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
};

const roundMoney = (value) => Math.round(Number(value) || 0);
const roundPercent = (value) => Math.round((Number(value) || 0) * 10) / 10;

export const formatMoney = (value) => `¥${roundMoney(value).toLocaleString('zh-CN')}`;

export const formatPercent = (value) => {
  const rounded = roundPercent(value);
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
};

export function calculateBudget(draft) {
  const tripDays = count(draft.tripDays);
  const people = count(draft.people);
  const mileage = amount(draft.mileage);
  const energyType = draft.energyType === 'hybrid' ? 'extended' : draft.energyType || 'oil';
  const energyConfig = ENERGY_DEFAULTS[energyType] || ENERGY_DEFAULTS.oil;
  const stayNights = Math.max(tripDays - 1, 0);
  const energyCost = energyConfig.getCost(mileage);

  const vehicleTransport =
    amount(draft.rentalPlatformTotal) +
    energyCost +
    amount(draft.tolls) +
    amount(draft.parking) +
    amount(draft.carWash);

  const lodging = amount(draft.hotelNightPrice) * stayNights;
  const dining =
    (amount(draft.breakfast) + amount(draft.lunch) + amount(draft.dinner)) * people * tripDays +
    amount(draft.snacks) +
    amount(draft.specialMeals);
  const scenic =
    (amount(draft.ticket) + amount(draft.shuttle) + amount(draft.cableway)) * people +
    amount(draft.entertainment);
  const bigTraffic = amount(draft.roundTripTransit) * people;
  const otherFees = amount(draft.cityTransport) + amount(draft.shopping) + amount(draft.gear) + amount(draft.other);
  const baseActual = vehicleTransport + lodging + dining + scenic + bigTraffic + otherFees;
  const emergency = baseActual * 0.1;
  const tripTotal = baseActual + emergency;
  const perPerson = tripTotal / people;
  const dailyAverage = tripTotal / tripDays;
  const perPersonDaily = tripTotal / people / tripDays;
  const temporaryFunds = amount(draft.vehicleDeposit) + amount(draft.violationDeposit);
  const preparedFunds = tripTotal + temporaryFunds;
  const vehicleCostRatio = tripTotal ? (vehicleTransport / tripTotal) * 100 : 0;

  const result = {
    tripDays,
    people,
    mileage,
    stayNights,
    energyType,
    energyLabel: energyConfig.label,
    energyUnitText: energyConfig.unitText,
    energyCost: roundMoney(energyCost),
    vehicleTransport: roundMoney(vehicleTransport),
    lodging: roundMoney(lodging),
    dining: roundMoney(dining),
    lodgingDining: roundMoney(lodging + dining),
    scenic: roundMoney(scenic),
    bigTraffic: roundMoney(bigTraffic),
    otherFees: roundMoney(otherFees),
    baseActual: roundMoney(baseActual),
    emergency: roundMoney(emergency),
    tripTotal: roundMoney(tripTotal),
    perPerson: roundMoney(perPerson),
    dailyAverage: roundMoney(dailyAverage),
    perPersonDaily: roundMoney(perPersonDaily),
    temporaryFunds: roundMoney(temporaryFunds),
    preparedFunds: roundMoney(preparedFunds),
    vehicleCostRatio: roundPercent(vehicleCostRatio),
    budgetLevel: getBudgetLevel(perPerson),
    vehicleCostJudgment: getVehicleCostJudgment(vehicleCostRatio),
    isRoughEstimate: isRoughEstimate(draft),
  };

  return {
    ...result,
    suggestions: getBudgetSuggestions({ draft, result, rawVehicleCostRatio: vehicleCostRatio, lodging, scenic, baseActual }),
  };
}

function getBudgetLevel(perPerson) {
  if (perPerson < 2000) return '经济型';
  if (perPerson < 5000) return '适中型';
  if (perPerson < 8000) return '舒适型';
  return '高预算型';
}

function getVehicleCostJudgment(ratio) {
  if (ratio < 30) return '车辆成本合理';
  if (ratio < 45) return '车辆成本偏高但可接受';
  return '车辆成本较高，建议降低车型等级、减少租车天数或避免高价车型';
}

function getBudgetSuggestions({ draft, result, rawVehicleCostRatio, lodging, scenic, baseActual }) {
  const suggestions = [];

  if (rawVehicleCostRatio >= 45) {
    suggestions.push('车辆相关费用占比较高，可以考虑降低车型等级、提前预订、减少租车天数或避开节假日。');
  } else if (rawVehicleCostRatio >= 30) {
    suggestions.push('车辆成本偏高但还算可控，建议对比不同门店、车型和取还车时间。');
  } else {
    suggestions.push('车辆成本占比比较健康，预算重点可以放在住宿、餐饮和体验项目。');
  }

  if (baseActual && lodging / baseActual >= 0.35) {
    suggestions.push('住宿费用较高，可以考虑住在非核心景区、县城或提前预订。');
  }

  if (baseActual && scenic / baseActual >= 0.22) {
    suggestions.push('景区和游玩项目费用较高，建议提前确认门票、区间车、索道等是否必须购买。');
  }

  if (result.energyType === 'electric' && result.mileage > 800) {
    suggestions.push('新能源长途自驾建议提前规划充电节点，尽量避开低电量进景区或山区。');
  }

  if (result.energyType === 'extended' && result.mileage > 1000) {
    suggestions.push('增程车适合长途自驾，但高速和山区油耗可能上升，预算建议适当留余量。');
  }

  if (result.isRoughEstimate) {
    suggestions.push('当前填写项目较少，结果更适合做粗略估算，建议补充住宿、餐饮、门票和大交通费用。');
  }

  return suggestions.slice(0, 4);
}

function isRoughEstimate(draft) {
  const importantFields = [
    'rentalPlatformTotal',
    'mileage',
    'hotelNightPrice',
    'breakfast',
    'lunch',
    'dinner',
    'ticket',
    'roundTripTransit',
  ];
  const filled = importantFields.filter((field) => amount(draft[field]) > 0).length;
  return filled < 4;
}
