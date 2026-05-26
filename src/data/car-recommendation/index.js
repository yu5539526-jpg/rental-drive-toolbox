import curatedData from './car_recommend_data.json';

const DESTINATION_KEY_BY_ID = {
  D001: 'city-short',
  D002: 'island-leisure',
  D003: 'mountain-plateau',
  D004: 'grassland-gobi',
};

const PRICE_TIER_ORDER = ['低', '中', '高'];

function splitList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value || value === '无') return [];
  return String(value)
    .split(/[\/,，、;；]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item !== '无');
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDestination(destination) {
  const id = destination.id || destination.destinationId;
  return {
    id,
    name: destination.name || destination.routeName || destination.destinationName,
    shortName: destination.shortName || destination.type || destination.destinationName,
    type: DESTINATION_KEY_BY_ID[id] || destination.key || destination.type || 'general',
    startCity: destination.startCity,
    totalMileage: destination.totalMileage || destination.routeTotalMileage,
    recommendedDays: destination.recommendedDays,
    roadType: destination.roadType,
    chargingCondition: destination.chargingCondition,
    altitudeRisk: destination.altitudeRisk,
    comfortImportance: destination.comfortImportance,
    beginnerDifficulty: destination.beginnerDifficulty,
    routeSummary: destination.routeSummary,
    drivingWarning: destination.drivingWarning,
    suitableEnergy: splitList(destination.suitableEnergy || destination.suitableEnergyType),
    notRecommendedEnergy: splitList(destination.notRecommendedEnergy || destination.notRecommendedEnergyType),
    raw: destination,
  };
}

function normalizeRecommendation(rec) {
  const destination = destinationById[rec.destinationId] || {};
  const vehicleId = rec.vehicleId || rec.carId;

  return {
    destinationId: rec.destinationId,
    destinationName: rec.destinationName || destination.name || '',
    destinationKey: destination.type || DESTINATION_KEY_BY_ID[rec.destinationId] || '',
    vehicleId,
    name: [rec.brand, rec.model].filter(Boolean).join(''),
    brand: rec.brand || '',
    model: rec.model || '',
    vehicleLevel: rec.vehicleLevel || rec.carLevel || '',
    bodyType: rec.bodyType || rec.carType || '',
    carType: rec.carType || rec.bodyType || '',
    energyType: rec.energyType || '',
    priceTier: PRICE_TIER_ORDER.includes(rec.priceTier) ? rec.priceTier : '',
    driveType: rec.driveType || '',
    seatCount: normalizeNumber(rec.seatCount),
    suitablePeopleCount: normalizeNumber(rec.suitablePeopleCount),
    horsepower: rec.horsepower || '',
    fuelConsumption: rec.fuelConsumption || '',
    energyConsumption: rec.energyConsumption || '',
    officialRange: rec.officialRange || '',
    realRangeEstimate: rec.realRangeEstimate || '',
    groundClearance: rec.groundClearance || '',
    luggageCapacity: rec.luggageCapacity || rec.luggageLevel || '',
    luggageLevel: rec.luggageLevel || rec.luggageCapacity || '',
    trunkSpace: rec.trunkSpace || '',
    rearSpace: rec.rearSpace || '',
    longDistanceComfort: rec.longDistanceComfort || '',
    seatComfort: rec.seatComfort || '',
    drivingDifficulty: rec.drivingDifficulty || '',
    parkingDifficulty: rec.parkingDifficulty || '',
    driverFriendlyLevel: rec.driverFriendlyLevel || rec.drivingDifficulty || '',
    refuelChargeConvenience: rec.refuelChargeConvenience || '',
    energyRiskScore: normalizeNumber(rec.energyRiskScore),
    comfortScore: normalizeNumber(rec.comfortScore),
    spaceScore: normalizeNumber(rec.spaceScore),
    roadScore: normalizeNumber(rec.roadScore),
    parkingScore: normalizeNumber(rec.parkingScore),
    costScore: normalizeNumber(rec.costScore),
    beginnerFriendlyScore: normalizeNumber(rec.beginnerFriendlyScore),
    overallScore: normalizeNumber(rec.overallScore),
    recommendationLevel: rec.recommendationLevel || '',
    summarySentence: rec.summarySentence || '',
    bestUseCase: rec.bestUseCase || '',
    notSuitableCase: rec.notSuitableCase || '',
    commonProblems: rec.commonProblems || '',
    reason: rec.reason || '',
    warning: rec.warning || '',
    tags: rec.tags || [],
    pros: rec.pros || [],
    cons: rec.cons || [],
    destinationScores: rec.destinationScores || [],
    suitableDestinationTypes: rec.suitableDestinationTypes || [],
    notSuitableDestinationTypes: rec.notSuitableDestinationTypes || [],
    rawVehicle: rec,
    rawScore: rec,
  };
}

function buildVehicles(recommendationList) {
  const byId = new Map();

  for (const rec of recommendationList) {
    if (!rec.vehicleId || byId.has(rec.vehicleId)) continue;
    byId.set(rec.vehicleId, {
      id: rec.vehicleId,
      vehicleId: rec.vehicleId,
      name: rec.name,
      brand: rec.brand,
      model: rec.model,
      vehicleLevel: rec.vehicleLevel,
      bodyType: rec.bodyType,
      carType: rec.carType,
      energyType: rec.energyType,
      priceTier: rec.priceTier,
      driveType: rec.driveType,
      seatCount: rec.seatCount,
      suitablePeopleCount: rec.suitablePeopleCount,
      horsepower: rec.horsepower,
      fuelConsumption: rec.fuelConsumption,
      energyConsumption: rec.energyConsumption,
      officialRange: rec.officialRange,
      realRangeEstimate: rec.realRangeEstimate,
      groundClearance: rec.groundClearance,
      luggageCapacity: rec.luggageCapacity,
      trunkSpace: rec.trunkSpace,
      rearSpace: rec.rearSpace,
      longDistanceComfort: rec.longDistanceComfort,
      seatComfort: rec.seatComfort,
      drivingDifficulty: rec.drivingDifficulty,
      parkingDifficulty: rec.parkingDifficulty,
      refuelChargeConvenience: rec.refuelChargeConvenience,
      summarySentence: rec.summarySentence,
      bestUseCase: rec.bestUseCase,
      notSuitableCase: rec.notSuitableCase,
      commonProblems: rec.commonProblems,
    });
  }

  return Array.from(byId.values());
}

export const meta = {
  generatedAt: curatedData.meta?.generatedAt || '',
  totalVehicles: curatedData.meta?.totalVehicles || new Set(curatedData.recommendations.map((rec) => rec.vehicleId)).size,
  totalDestinations: curatedData.meta?.totalDestinations || curatedData.destinations.length,
  totalRecommendations: curatedData.meta?.totalRecommendations || curatedData.recommendations.length,
  source: 'curated',
};

export const destinations = curatedData.destinations.map(normalizeDestination);

const destinationById = Object.fromEntries(destinations.map((destination) => [destination.id, destination]));

export const recommendations = curatedData.recommendations.map(normalizeRecommendation);

export const vehicles = buildVehicles(recommendations);
export const destinationTypes = destinations;
export const carModels = vehicles;
export const carDestinationScores = recommendations;

export const carRecommendationRules = {
  destinationWeights: {
    城区近郊: {
      energy_type: 0.15,
      parking_difficulty: 0.25,
      seat_comfort: 0.1,
      long_distance_comfort: 0.1,
      horsepower: 0.05,
    },
    海岛滨海: {
      energy_type: 0.15,
      seat_comfort: 0.2,
      long_distance_comfort: 0.2,
      parking_difficulty: 0.1,
      horsepower: 0.05,
    },
    山地高原: {
      horsepower: 0.22,
      energy_type: 0.18,
      seat_comfort: 0.12,
      long_distance_comfort: 0.18,
      parking_difficulty: 0.1,
    },
    草原戈壁: {
      horsepower: 0.25,
      long_distance_comfort: 0.22,
      seat_comfort: 0.15,
      energy_type: 0.15,
      parking_difficulty: 0.05,
    },
  },
  bonusRules: {
    城区近郊: { parking_easy: true },
    海岛滨海: { long_distance_comfort_good: true, parking_easy: true },
    山地高原: { four_wheel_drive: true, long_distance_comfort_good: true },
    草原戈壁: { four_wheel_drive: true, long_distance_comfort_good: true },
  },
};

const carRecommendData = {
  meta,
  destinations,
  recommendations,
  vehicles,
  destinationTypes,
  carDestinationScores,
  carRecommendationRules,
};

export default carRecommendData;
