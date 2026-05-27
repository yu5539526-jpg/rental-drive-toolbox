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
    highwayRatio: destination.highwayRatio || '',
    mountainRoadRatio: destination.mountainRoadRatio || '',
    unpavedRoadRatio: destination.unpavedRoadRatio || '',
    parkingPressure: destination.parkingPressure || '',
    chargingCondition: destination.chargingCondition,
    fuelCondition: destination.fuelCondition || '',
    altitudeRisk: destination.altitudeRisk,
    comfortImportance: destination.comfortImportance,
    vehicleSizeSensitivity: destination.vehicleSizeSensitivity || '',
    beginnerDifficulty: destination.beginnerDifficulty,
    routeSummary: destination.routeSummary,
    drivingWarning: destination.drivingWarning,
    highlights: destination.highlights || '',
    energyHint: destination.energyHint || '',
    suitableEnergy: splitList(destination.suitableEnergy || destination.suitableEnergyType),
    notRecommendedEnergy: splitList(destination.notRecommendedEnergy || destination.notRecommendedEnergyType),
    scoreWeights: destination.scoreWeights || '',
    preferredBodyTypes: destination.preferredBodyTypes || [],
    preferredVehicleLevels: destination.preferredVehicleLevels || [],
    notPreferredBodyTypes: destination.notPreferredBodyTypes || [],
    notPreferredVehicleLevels: destination.notPreferredVehicleLevels || [],
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
    energyHint: rec.energyHint || '',
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

function buildDynamicRules(destinationList) {
  const ruleTypeMap = {
    城区近郊轻自驾: '城区近郊',
    海岛滨海环线: '海岛滨海',
    山地高原山路: '山地高原',
    草原戈壁大长线: '草原戈壁',
  };

  const destinationWeights = {};
  const bonusRules = {};

  for (const dest of destinationList) {
    const ruleType = ruleTypeMap[dest.name] || dest.shortName || dest.name;
    const weightsStr = dest.scoreWeights || '0.14,0.14,0.14,0.14,0.14,0.14,0.14';
    const parts = weightsStr.split(',').map(Number);

    destinationWeights[ruleType] = {
      energy_type: parts[0] || 0.14,
      seat_comfort: (parts[1] || 0.14) + (parts[2] || 0.14),
      long_distance_comfort: parts[1] || 0.14,
      horsepower: parts[3] || 0.14,
      parking_difficulty: parts[4] || 0.14,
      trunk_space: parts[2] || 0.14,
    };

    bonusRules[ruleType] = {};

    const notPrefBody = dest.notPreferredBodyTypes || [];
    if (notPrefBody.some((b) => /大型|MPV/.test(b))) {
      bonusRules[ruleType].parking_easy = true;
    }

    if (/山地|草原/.test(ruleType)) {
      bonusRules[ruleType].four_wheel_drive = true;
      bonusRules[ruleType].long_distance_comfort_good = true;
    }

    if (/海岛/.test(ruleType)) {
      bonusRules[ruleType].parking_easy = true;
      bonusRules[ruleType].long_distance_comfort_good = true;
    }
  }

  return { destinationWeights, bonusRules };
}

const dynamicRules = buildDynamicRules(destinations);

export const carRecommendationRules = {
  destinationWeights: dynamicRules.destinationWeights,
  bonusRules: dynamicRules.bonusRules,
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
