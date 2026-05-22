import { optimizedCarModels } from './optimizedCarModels.js';
import { optimizedDestinationTypes } from './optimizedDestinationTypes.js';
import { optimizedCarDestinationScores } from './optimizedCarDestinationScores.js';
import { optimizedCarRecommendationRules } from './optimizedCarRecommendationRules.js';

// 车型推荐唯一运行数据入口。
// 数据来源于 E:\ClaudeCode_project\CheXingKu；旧 car_recommend_data.json 仅保留为历史留档，不参与 import 或 fallback。
// 字段归属：车型基础信息来自 optimizedCarModels，目的地适配分来自 optimizedCarDestinationScores，规则权重来自 optimizedCarRecommendationRules。
const vehicleById = Object.fromEntries(optimizedCarModels.map((vehicle) => [vehicle.id || vehicle.vehicleId, vehicle]));

export const meta = {
  generatedAt: optimizedCarDestinationScores.reduce((latest, item) => item.updateDate > latest ? item.updateDate : latest, ''),
  totalVehicles: optimizedCarModels.length,
  totalDestinations: optimizedDestinationTypes.length,
  totalRecommendations: optimizedCarDestinationScores.length,
  source: 'CheXingKu',
};

export const destinations = optimizedDestinationTypes.map((destination) => ({
  id: destination.id,
  name: destination.name,
  shortName: destination.shortName,
  type: destination.key || 'general',
  startCity: destination.startCity,
  totalMileage: destination.totalMileage,
  recommendedDays: destination.recommendedDays,
  roadType: destination.roadType,
  chargingCondition: destination.chargingCondition,
  altitudeRisk: destination.altitudeRisk,
  comfortImportance: destination.comfortImportance,
  beginnerDifficulty: destination.beginnerDifficulty,
  routeSummary: destination.routeSummary,
  drivingWarning: destination.drivingWarning,
  suitableEnergy: destination.suitableEnergy || [],
  notRecommendedEnergy: destination.notRecommendedEnergy || [],
  raw: destination,
}));

export const recommendations = optimizedCarDestinationScores.map((score) => {
  const vehicle = vehicleById[score.vehicleId] || {};

  return {
    destinationId: score.destinationId,
    destinationName: score.destinationName,
    destinationKey: score.destinationKey,
    vehicleId: score.vehicleId,
    name: vehicle.name || [vehicle.brand || score.brand, vehicle.model || score.model].filter(Boolean).join(''),
    brand: vehicle.brand || score.brand || '',
    model: vehicle.model || score.model || '',
    vehicleLevel: vehicle.vehicleLevel || vehicle.carLevel || score.vehicleLevel || '',
    bodyType: vehicle.bodyType || vehicle.carType || score.carType || '',
    carType: vehicle.carType || vehicle.bodyType || score.carType || '',
    energyType: vehicle.energyType || score.energyType || '',
    priceTier: score.priceTier || vehicle.priceTier || '',
    driveType: vehicle.driveType || '',
    seatCount: vehicle.seatCount ?? vehicle.seats ?? 0,
    suitablePeopleCount: vehicle.suitablePeopleCount ?? 0,
    horsepower: vehicle.horsepower || '',
    fuelConsumption: vehicle.fuelConsumption || '',
    energyConsumption: vehicle.energyConsumption || '',
    officialRange: vehicle.officialRange || '',
    realRangeEstimate: vehicle.realRangeEstimate || '',
    groundClearance: vehicle.groundClearance || '',
    luggageCapacity: vehicle.luggageCapacity || vehicle.luggageLevel || '',
    luggageLevel: vehicle.luggageLevel || vehicle.luggageCapacity || '',
    trunkSpace: vehicle.trunkSpace || '',
    rearSpace: vehicle.rearSpace || '',
    longDistanceComfort: vehicle.longDistanceComfort || '',
    seatComfort: vehicle.seatComfort || '',
    drivingDifficulty: vehicle.drivingDifficulty || '',
    parkingDifficulty: vehicle.parkingDifficulty || '',
    driverFriendlyLevel: vehicle.driverFriendlyLevel || vehicle.drivingDifficulty || '',
    refuelChargeConvenience: vehicle.refuelChargeConvenience || '',
    energyRiskScore: score.energyRiskScore ?? 0,
    comfortScore: score.comfortScore ?? 0,
    spaceScore: score.spaceScore ?? 0,
    roadScore: score.roadScore ?? 0,
    parkingScore: score.parkingScore ?? 0,
    costScore: score.costScore ?? 0,
    beginnerFriendlyScore: score.beginnerFriendlyScore ?? 0,
    overallScore: score.overallScore ?? 0,
    recommendationLevel: score.recommendationLevel || '',
    summarySentence: vehicle.summarySentence || '',
    bestUseCase: vehicle.bestUseCase || '',
    notSuitableCase: vehicle.notSuitableCase || '',
    commonProblems: vehicle.commonProblems || '',
    reason: score.reason || '',
    warning: score.warning || '',
    tags: vehicle.tags || [],
    pros: vehicle.pros || [],
    cons: vehicle.cons || [],
    destinationScores: vehicle.destinationScores || [],
    suitableDestinationTypes: vehicle.suitableDestinationTypes || [],
    notSuitableDestinationTypes: vehicle.notSuitableDestinationTypes || [],
    rawVehicle: vehicle,
    rawScore: score,
  };
});

export const vehicles = optimizedCarModels;
export const destinationTypes = optimizedDestinationTypes;
export const carModels = optimizedCarModels;
export const carDestinationScores = optimizedCarDestinationScores;
export const carRecommendationRules = optimizedCarRecommendationRules;

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
