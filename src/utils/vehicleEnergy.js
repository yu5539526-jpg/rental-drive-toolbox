import vehicleEnergyData from '../data/vehicleEnergyData.json';

const INVALID_VALUES = new Set(['', '不适用', '待补充', '暂无', '-']);

export function findVehicleEnergyProfile(inputModel) {
  const input = normalizeVehicleName(inputModel);
  if (!input || input.length < 2) return null;

  let best = null;

  for (const vehicle of vehicleEnergyData) {
    const brand = String(vehicle.brand || '').trim();
    const model = String(vehicle.model || '').trim();
    const normalizedBrand = normalizeVehicleName(brand);
    const normalizedModel = normalizeVehicleName(model);
    const normalizedFullName = normalizeVehicleName(`${brand}${model}`);
    const score = getMatchScore(input, normalizedFullName, normalizedModel, normalizedBrand);

    if (!score) continue;
    if (!best || score > best.score) {
      best = { vehicle, score };
    }
  }

  if (!best || best.score < 55) return null;

  return {
    vehicleId: best.vehicle.vehicleId,
    brand: best.vehicle.brand,
    model: best.vehicle.model,
    displayName: `${best.vehicle.brand}${best.vehicle.model}`,
    rawEnergyType: best.vehicle.energyType,
    budgetEnergyType: normalizeBudgetEnergyType(best.vehicle.energyType),
    fuelConsumption: parseConsumptionValue(best.vehicle.fuelConsumption),
    electricConsumption: parseConsumptionValue(best.vehicle.energyConsumption),
    rawFuelConsumption: best.vehicle.fuelConsumption,
    rawEnergyConsumption: best.vehicle.energyConsumption,
  };
}

export function normalizeBudgetEnergyType(energyType) {
  const value = String(energyType || '');
  if (value.includes('纯电')) return 'electric';
  if (value.includes('增程') || value.includes('插电')) return 'extended';
  return 'oil';
}

function getMatchScore(input, fullName, model, brand) {
  if (!model) return 0;

  if (input === fullName) return 100;
  if (input === model) return 92;

  let score = 0;

  if (input.includes(fullName)) {
    score = Math.max(score, 88 + lengthBonus(fullName));
  }

  if (input.includes(model)) {
    score = Math.max(score, 72 + lengthBonus(model));
  }

  if (fullName.includes(input) && input.length >= 3) {
    score = Math.max(score, 62 + lengthBonus(input));
  }

  if (model.includes(input) && input.length >= 3) {
    score = Math.max(score, 58 + lengthBonus(input));
  }

  if (brand && input.includes(brand) && input.includes(model)) {
    score += 8;
  }

  return Math.min(score, 99);
}

function lengthBonus(value) {
  return Math.min(10, Math.floor(String(value || '').length / 2));
}

function parseConsumptionValue(value) {
  const text = String(value || '').trim();
  if (INVALID_VALUES.has(text)) return null;

  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeVehicleName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/20\d{2}款?/g, '')
    .replace(/[款版型]/g, '')
    .replace(/[\s·.。/\\|｜,，:：;；'"“”‘’()[\]{}（）【】<>《》_\-+]/g, '')
    .trim();
}
