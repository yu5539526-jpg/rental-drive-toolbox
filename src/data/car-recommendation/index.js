import carRecommendData from './car_recommend_data.json';

export const meta = carRecommendData.meta || {};
export const destinations = carRecommendData.destinations || [];
export const recommendations = carRecommendData.recommendations || [];

// 从 recommendations 中按 vehicleId 去重提取车型列表
export const vehicles = Object.values(
  (carRecommendData.recommendations || []).reduce((acc, r) => {
    if (r.vehicleId && !acc[r.vehicleId]) {
      acc[r.vehicleId] = {
        vehicleId: r.vehicleId,
        brand: r.brand,
        model: r.model,
        vehicleLevel: r.vehicleLevel,
        bodyType: r.bodyType,
        energyType: r.energyType,
        driveType: r.driveType,
        seatCount: r.seatCount,
        suitablePeopleCount: r.suitablePeopleCount,
        fuelConsumption: r.fuelConsumption,
        groundClearance: r.groundClearance,
        luggageCapacity: r.luggageCapacity,
        trunkSpace: r.trunkSpace,
        bestUseCase: r.bestUseCase,
        notSuitableCase: r.notSuitableCase,
        commonProblems: r.commonProblems,
        summarySentence: r.summarySentence,
      };
    }
    return acc;
  }, {}),
);

export { carRecommendData as default };
