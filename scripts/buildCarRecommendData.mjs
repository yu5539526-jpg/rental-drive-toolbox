/**
 * buildCarRecommendData.mjs
 *
 * 从 curated CSV 数据源读取车型参数 + 目的地画像，
 * 对 36 款车 × 4 个目的地计算 7 个维度的差异化评分，
 * 输出 car_recommend_data.json。
 *
 * 用法: node scripts/buildCarRecommendData.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const CURATED_DIR = 'E:/ClaudeCode_project/CheXingKu/car-rental-database/curated';

/* ========================================================================
   CSV 解析
   ======================================================================== */

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function readCSV(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error(`CSV file ${filePath} has no data rows`);
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

/* ========================================================================
   文本 → 数值映射
   ======================================================================== */

const LEVEL_SCORE = {
  优秀: 5.0, 很好: 5.0,
  好: 4.5,
  较好: 4.0,
  中等: 3.0,
  一般: 2.6,
  较差: 2.0,
  差: 1.0, 很差: 1.0,
};

const PARKING_SCORE = {
  容易: 4.8,
  中等: 3.0,
  较大: 2.0,
  困难: 1.2,
};

const DRIVING_SCORE = {
  容易: 4.8,
  中等: 3.0,
  较大: 2.0,
  困难: 1.2,
};

function textScore(value, fallback = 3.0) {
  const text = String(value || '').trim();
  if (!text) return fallback;
  for (const [key, score] of Object.entries(LEVEL_SCORE)) {
    if (text.includes(key)) return score;
  }
  for (const [key, score] of Object.entries(PARKING_SCORE)) {
    if (text.includes(key)) return score;
  }
  return fallback;
}

function textScoreAny(value, fallback = 3.0) {
  const text = String(value || '').trim();
  if (!text) return fallback;
  // 尝试所有映射
  const allMaps = [{ ...LEVEL_SCORE, ...PARKING_SCORE, ...DRIVING_SCORE }];
  for (const [key, score] of Object.entries(allMaps[0])) {
    if (text.includes(key)) return score;
  }
  return fallback;
}

/* ========================================================================
   数值提取辅助函数
   ======================================================================== */

function extractNumber(value) {
  const nums = String(value || '').match(/\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number).filter(Number.isFinite));
}

function extractRangeKm(value) {
  // 从 "约550km" 或 "约900km(综合)" 中提取数字
  const match = String(value || '').match(/约(\d+)\s*k?m?/i);
  if (match) return Number(match[1]);
  const nums = String(value || '').match(/\d+/g);
  return nums ? Math.max(...nums.map(Number).filter((n) => n > 10)) : 0;
}

function extractGroundClearance(value) {
  const match = String(value || '').match(/(\d+)\s*mm/);
  return match ? Number(match[1]) : 0;
}

/* ========================================================================
   D001 → city-short 映射
   ======================================================================== */

const DEST_KEY_MAP = {
  D001: 'city-short',
  D002: 'island-leisure',
  D003: 'mountain-plateau',
  D004: 'grassland-gobi',
};

const DEST_TYPE_NAME = {
  D001: '城区近郊',
  D002: '海岛滨海',
  D003: '山地高原',
  D004: '草原戈壁',
};

/* ========================================================================
   7 维评分计算
   ======================================================================== */

function computeEnergyRiskScore(vehicle, dest) {
  const energy = (vehicle.energy_type || '').trim();
  const rangeKm = extractRangeKm(vehicle.real_range_estimate || vehicle.official_range || '');
  const refuelConv = (vehicle.refuel_charge_convenience || '').trim();
  const refuelScore = textScore(refuelConv, 3.0);

  let score = 3.0;

  // 续航里程影响
  if (rangeKm >= 800) score += 1.2;
  else if (rangeKm >= 600) score += 0.8;
  else if (rangeKm >= 400) score += 0.3;
  else if (rangeKm >= 250) score -= 0.3;
  else if (rangeKm > 0) score -= 0.8;

  // 补能便利性
  score += (refuelScore - 3.0) * 0.6;

  // 能源类型 vs 目的地补能条件
  const charging = (dest.charging_condition || '').trim();
  const fuel = (dest.fuel_condition || '').trim();

  if (energy === '纯电动') {
    if (charging.includes('好')) score += 0.5;
    else if (charging.includes('较差')) score -= 1.0;
    else if (charging.includes('差')) score -= 1.8;
  } else if (energy === '增程式' || energy === '插电混动') {
    score += 0.5; // 可油可电，容错率高
    if (fuel.includes('好') || fuel.includes('较好')) score += 0.2;
  } else if (energy === '汽油') {
    if (fuel.includes('好') || fuel.includes('较好')) score += 0.4;
    else if (fuel.includes('一般')) score -= 0.2;
  }

  // 目的地不推荐能源类型惩罚
  const notRec = (dest.not_recommended_energy_type || '').trim();
  if (notRec && notRec.includes('纯电动') && energy === '纯电动') {
    score -= 1.5;
  }

  return clamp(score, 1.0, 5.0);
}

function computeComfortScore(vehicle) {
  const longDist = textScore(vehicle.long_distance_comfort, 3.0);
  const seat = textScore(vehicle.seat_comfort, 3.0);

  // 附加舒适配置加分
  let bonus = 0;
  if ((vehicle.seat_ventilation || '').includes('有')) bonus += 0.15;
  if ((vehicle.seat_heating || '').includes('有')) bonus += 0.1;
  if ((vehicle.seat_massage || '').includes('有')) bonus += 0.15;
  if ((vehicle.zero_gravity_seat || '').includes('有')) bonus += 0.15;

  return clamp(longDist * 0.6 + seat * 0.4 + bonus, 1.0, 5.0);
}

function computeSpaceScore(vehicle) {
  const luggage = textScore(vehicle.luggage_capacity, 3.0);
  const trunk = textScore(vehicle.trunk_space, 3.0);
  const rear = textScore(vehicle.rear_space, 3.0);
  const seats = extractNumber(vehicle.seat_count);

  let seatBonus = 0;
  if (seats >= 6) seatBonus = 0.4;
  else if (seats >= 5) seatBonus = 0.15;

  return clamp(luggage * 0.4 + trunk * 0.3 + rear * 0.15 + 3.0 * 0.15 + seatBonus, 1.0, 5.0);
}

function computeRoadScore(vehicle) {
  const groundClearance = extractGroundClearance(vehicle.ground_clearance || '');
  const driveType = (vehicle.drive_type || '').trim();
  const bodyType = (vehicle.body_type || '').trim();
  const roadAdapt = textScoreAny(vehicle.road_condition_adaptability, 3.0);

  let score = 2.8;

  // 离地间隙
  if (groundClearance >= 210) score += 0.8;
  else if (groundClearance >= 190) score += 0.5;
  else if (groundClearance >= 160) score += 0.15;
  else if (groundClearance >= 140) score -= 0.15;
  else if (groundClearance > 0) score -= 0.4;

  // 驱动形式
  if (/四驱|4WD|AWD/.test(driveType.toUpperCase())) score += 0.5;
  else if (/后驱/.test(driveType)) score += 0.15;

  // 车身类型
  if (/SUV|越野/.test(bodyType)) score += 0.35;
  else if (/轿车|两厢/.test(bodyType)) score -= 0.2;

  // 路况适应性
  score += (roadAdapt - 3.0) * 0.4;

  return clamp(score, 1.0, 5.0);
}

function computeParkingScore(vehicle) {
  const parkingDiff = (vehicle.parking_difficulty || '').trim();
  const size = (vehicle.vehicle_size || '').trim();
  const bodyType = (vehicle.body_type || '').trim();
  const level = (vehicle.vehicle_level || '').trim();

  let score = 3.0;

  // 停车难度
  if (parkingDiff.includes('容易')) score += 1.2;
  else if (parkingDiff.includes('中等')) score += 0.2;
  else if (parkingDiff.includes('较大') || parkingDiff.includes('困难')) score -= 1.0;

  // 车身尺寸（从小车到大车）
  if (/小型|紧凑型/.test(level)) score += 0.8;
  else if (/大型/.test(level)) score -= 0.8;
  else if (/中大型/.test(level)) score -= 0.3;

  if (/两厢|轿车/.test(bodyType)) score += 0.3;
  else if (/SUV/.test(bodyType) && /大型/.test(level)) score -= 0.5;

  // 尺寸字符串：越长越难停
  const dims = (size.match(/\d+/g) || []).map(Number);
  if (dims.length >= 2) {
    const length = dims[0];
    if (length >= 5200) score -= 0.6;
    else if (length >= 5000) score -= 0.3;
    else if (length <= 4300) score += 0.4;
  }

  return clamp(score, 1.0, 5.0);
}

function computeCostScore(vehicle) {
  const priceTier = (vehicle.price_tier || '').trim();
  const fuelConsumption = (vehicle.fuel_consumption || '').trim();
  const energyConsumption = (vehicle.energy_consumption || '').trim();

  let score = 3.0;

  if (priceTier === '低') score = 4.5;
  else if (priceTier === '中') score = 3.5;
  else if (priceTier === '高') score = 2.5;

  // 能耗微调
  const fuelL = extractNumber(fuelConsumption);
  if (fuelL > 0) {
    if (fuelL <= 6) score += 0.3;
    else if (fuelL >= 11) score -= 0.5;
    else if (fuelL >= 8) score -= 0.2;
  }

  const elecKwh = extractNumber(energyConsumption);
  if (elecKwh > 0) {
    if (elecKwh <= 14) score += 0.3;
    else if (elecKwh >= 20) score -= 0.4;
    else if (elecKwh >= 17) score -= 0.15;
  }

  return clamp(score, 1.0, 5.0);
}

function computeBeginnerFriendlyScore(vehicle) {
  const drivingDiff = (vehicle.driving_difficulty || '').trim();
  const parkingDiff = (vehicle.parking_difficulty || '').trim();
  const smartDriving = (vehicle.smart_driving || '').trim();
  const level = (vehicle.vehicle_level || '').trim();
  const bodyType = (vehicle.body_type || '').trim();

  let driveScore = 3.0;
  if (drivingDiff.includes('容易')) driveScore = 4.8;
  else if (drivingDiff.includes('中等')) driveScore = 3.0;
  else if (drivingDiff.includes('较大') || drivingDiff.includes('困难')) driveScore = 1.8;

  let parkScore = 3.0;
  if (parkingDiff.includes('容易')) parkScore = 4.8;
  else if (parkingDiff.includes('中等')) parkScore = 3.0;
  else if (parkingDiff.includes('较大') || parkingDiff.includes('困难')) parkScore = 1.8;

  let smartScore = 3.0;
  if (smartDriving.includes('很好')) smartScore = 5.0;
  else if (smartDriving.includes('好')) smartScore = 4.0;
  else if (smartDriving.includes('较好')) smartScore = 3.5;
  else if (smartDriving.includes('一般')) smartScore = 2.6;

  // 车身尺寸惩罚
  let sizePenalty = 0;
  if (/大型/.test(level)) sizePenalty = -0.5;
  else if (/中大型/.test(level)) sizePenalty = -0.15;
  if (/MPV|越野/.test(bodyType)) sizePenalty -= 0.25;

  return clamp(driveScore * 0.4 + parkScore * 0.3 + smartScore * 0.3 + sizePenalty, 1.0, 5.0);
}

function clamp(value, min, max) {
  return Math.round(Math.max(min, Math.min(max, value)) * 100) / 100;
}

/* ========================================================================
   目的地权重应用
   ======================================================================== */

function parseWeights(weightStr) {
  // "0.15,0.10,0.10,0.00,0.25,0.25,0.15"
  const parts = (weightStr || '0.14,0.14,0.14,0.14,0.14,0.14,0.14').split(',').map(Number);
  // 7 个维度: energyRisk, comfort, space, road, parking, cost, beginnerFriendly
  return {
    energyRisk: parts[0] || 0.14,
    comfort: parts[1] || 0.14,
    space: parts[2] || 0.14,
    road: parts[3] || 0.14,
    parking: parts[4] || 0.14,
    cost: parts[5] || 0.14,
    beginnerFriendly: parts[6] || 0.14,
  };
}

function computeOverallScore(scores, weights) {
  const weighted =
    scores.energyRiskScore * weights.energyRisk +
    scores.comfortScore * weights.comfort +
    scores.spaceScore * weights.space +
    scores.roadScore * weights.road +
    scores.parkingScore * weights.parking +
    scores.costScore * weights.cost +
    scores.beginnerFriendlyScore * weights.beginnerFriendly;

  const totalWeight =
    weights.energyRisk + weights.comfort + weights.space +
    weights.road + weights.parking + weights.cost + weights.beginnerFriendly;

  return totalWeight > 0 ? clamp(weighted / totalWeight, 1.0, 5.0) : 3.0;
}

function getRecommendationLevel(overallScore) {
  if (overallScore >= 4.2) return '强烈推荐';
  if (overallScore >= 3.5) return '推荐';
  if (overallScore >= 2.8) return '可选';
  return '不建议';
}

/* ========================================================================
   解析偏好列表
   ======================================================================== */

function parsePrefList(value) {
  if (!value || value === '无') return [];
  return String(value)
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ========================================================================
   主流程
   ======================================================================== */

function main() {
  console.log('📖 读取 curated CSV 数据...');

  const vehiclesCSV = readCSV(`${CURATED_DIR}/vehicle_base_curated.csv`);
  const destCSV = readCSV(`${CURATED_DIR}/destination_profile_curated.csv`);

  console.log(`   车型: ${vehiclesCSV.rows.length} 款`);
  console.log(`   目的地: ${destCSV.rows.length} 个`);

  // 构建目的地列表
  const destinations = destCSV.rows.map((row) => ({
    id: row.destination_id,
    name: row.destination_name,
    routeName: row.route_name,
    shortName: DEST_TYPE_NAME[row.destination_id] || row.destination_name,
    type: DEST_KEY_MAP[row.destination_id] || '',
    startCity: row.start_city,
    totalMileage: row.route_total_mileage,
    recommendedDays: row.recommended_days,
    roadType: row.road_type,
    highwayRatio: row.highway_ratio,
    mountainRoadRatio: row.mountain_road_ratio,
    unpavedRoadRatio: row.unpaved_road_ratio,
    parkingPressure: row.parking_pressure,
    chargingCondition: row.charging_condition,
    fuelCondition: row.fuel_condition,
    weatherRisk: row.weather_risk,
    altitudeRisk: row.altitude_risk,
    comfortImportance: row.comfort_importance,
    vehicleSizeSensitivity: row.vehicle_size_sensitivity,
    beginnerDifficulty: row.beginner_difficulty,
    suitableEnergy: parsePrefList(row.suitable_energy_type),
    notRecommendedEnergy: parsePrefList(row.not_recommended_energy_type),
    routeSummary: row.route_summary,
    drivingWarning: row.driving_warning,
    highlights: row.route_summary ? row.route_summary.slice(0, 80) : '',
    energyHint: '',
    scoreWeights: row.score_weights,
    preferredBodyTypes: parsePrefList(row.preferred_body_types),
    preferredVehicleLevels: parsePrefList(row.preferred_vehicle_levels),
    notPreferredBodyTypes: parsePrefList(row.not_preferred_body_types),
    notPreferredVehicleLevels: parsePrefList(row.not_preferred_vehicle_levels),
  }));

  // 构建推荐记录
  const recommendations = [];

  for (const vehicle of vehiclesCSV.rows) {
    for (const dest of destCSV.rows) {
      const scores = {
        energyRiskScore: computeEnergyRiskScore(vehicle, dest),
        comfortScore: computeComfortScore(vehicle),
        spaceScore: computeSpaceScore(vehicle),
        roadScore: computeRoadScore(vehicle),
        parkingScore: computeParkingScore(vehicle),
        costScore: computeCostScore(vehicle),
        beginnerFriendlyScore: computeBeginnerFriendlyScore(vehicle),
      };

      const weights = parseWeights(dest.score_weights);
      const overallScore = computeOverallScore(scores, weights);
      const recommendationLevel = getRecommendationLevel(overallScore);

      const vehicleId = vehicle.vehicle_id;
      const destId = dest.destination_id;
      const destInfo = destinations.find((d) => d.id === destId) || {};

      // 生成能源提示
      const energy = (vehicle.energy_type || '').trim();
      const charging = (dest.charging_condition || '').trim();
      let energyHint = '';
      if (energy === '纯电动' && (charging.includes('较差') || charging.includes('差'))) {
        energyHint = '纯电车型在此路线需提前确认充电站分布，建议优先选择增程或混动。';
      } else if (energy === '纯电动' && charging.includes('好')) {
        energyHint = '此路线充电条件良好，纯电体验和成本优势明显。';
      } else if ((energy === '增程式' || energy === '插电混动') && (charging.includes('较差') || charging.includes('差'))) {
        energyHint = '增程/插混兼顾电驱体验和加油补能，在此路线容错率最高。';
      }

      recommendations.push({
        destinationId: destId,
        destinationName: destInfo.name || '',
        destinationKey: DEST_KEY_MAP[destId] || '',
        vehicleId,
        name: `${vehicle.brand || ''}${vehicle.model || ''}`.trim(),
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        vehicleLevel: vehicle.vehicle_level || '',
        bodyType: vehicle.body_type || '',
        carType: vehicle.body_type || '',
        energyType: vehicle.energy_type || '',
        priceTier: vehicle.price_tier || '',
        driveType: vehicle.drive_type || '',
        seatCount: extractNumber(vehicle.seat_count),
        suitablePeopleCount: extractNumber(vehicle.suitable_people_count),
        horsepower: vehicle.horsepower || '',
        fuelConsumption: vehicle.fuel_consumption || '',
        energyConsumption: vehicle.energy_consumption || '',
        officialRange: vehicle.official_range || '',
        realRangeEstimate: vehicle.real_range_estimate || '',
        groundClearance: vehicle.ground_clearance || '',
        luggageCapacity: vehicle.luggage_capacity || '',
        luggageLevel: vehicle.luggage_capacity || '',
        trunkSpace: vehicle.trunk_space || '',
        rearSpace: vehicle.rear_space || '',
        longDistanceComfort: vehicle.long_distance_comfort || '',
        seatComfort: vehicle.seat_comfort || '',
        drivingDifficulty: vehicle.driving_difficulty || '',
        parkingDifficulty: vehicle.parking_difficulty || '',
        driverFriendlyLevel: vehicle.driving_difficulty || '',
        refuelChargeConvenience: vehicle.refuel_charge_convenience || '',
        ...scores,
        overallScore,
        recommendationLevel,
        summarySentence: vehicle.summary_sentence || '',
        bestUseCase: vehicle.best_use_case || '',
        notSuitableCase: vehicle.not_suitable_case || '',
        commonProblems: vehicle.common_problems || '',
        reason: vehicle.summary_sentence || '',
        warning: vehicle.not_suitable_case || '',
        tags: [vehicle.body_type, vehicle.energy_type, vehicle.vehicle_level].filter(Boolean),
        pros: (vehicle.best_use_case || '').split('/').map((s) => s.trim()).filter(Boolean),
        cons: (vehicle.not_suitable_case || '').split('/').map((s) => s.trim()).filter(Boolean),
        destinationScores: [],
        suitableDestinationTypes: [],
        notSuitableDestinationTypes: [],
        energyHint,
      });
    }
  }

  // 构建输出 JSON
  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      totalVehicles: vehiclesCSV.rows.length,
      totalDestinations: destinations.length,
      totalRecommendations: recommendations.length,
      source: 'curated',
      description: '从 curated CSV 数据源自动生成，评分已按目的地差异化计算',
    },
    destinations: destinations.map((d) => ({
      id: d.id,
      name: d.name,
      routeName: d.routeName,
      shortName: d.shortName,
      type: d.type,
      startCity: d.startCity,
      totalMileage: d.totalMileage,
      recommendedDays: d.recommendedDays,
      roadType: d.roadType,
      highwayRatio: d.highwayRatio,
      mountainRoadRatio: d.mountainRoadRatio,
      unpavedRoadRatio: d.unpavedRoadRatio,
      parkingPressure: d.parkingPressure,
      chargingCondition: d.chargingCondition,
      fuelCondition: d.fuelCondition,
      weatherRisk: d.weatherRisk,
      altitudeRisk: d.altitudeRisk,
      comfortImportance: d.comfortImportance,
      vehicleSizeSensitivity: d.vehicleSizeSensitivity,
      beginnerDifficulty: d.beginnerDifficulty,
      suitableEnergy: d.suitableEnergy,
      notRecommendedEnergy: d.notRecommendedEnergy,
      routeSummary: d.routeSummary,
      drivingWarning: d.drivingWarning,
      highlights: d.highlights,
      energyHint: d.energyHint,
      scoreWeights: d.scoreWeights,
      preferredBodyTypes: d.preferredBodyTypes,
      preferredVehicleLevels: d.preferredVehicleLevels,
      notPreferredBodyTypes: d.notPreferredBodyTypes,
      notPreferredVehicleLevels: d.notPreferredVehicleLevels,
    })),
    recommendations,
  };

  // 写入文件
  const outDir = resolve(PROJECT_ROOT, 'src/data/car-recommendation');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'car_recommend_data.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✅ 已生成 ${outPath}`);
  console.log(`   车型: ${vehiclesCSV.rows.length} 款`);
  console.log(`   目的地: ${destinations.length} 个`);
  console.log(`   推荐记录: ${recommendations.length} 条 (${vehiclesCSV.rows.length}×${destinations.length})`);

  // 输出评分分布统计
  const levels = {};
  for (const rec of recommendations) {
    levels[rec.recommendationLevel] = (levels[rec.recommendationLevel] || 0) + 1;
  }
  console.log('\n📊 推荐等级分布:');
  for (const [level, count] of Object.entries(levels)) {
    console.log(`   ${level}: ${count} 条 (${((count / recommendations.length) * 100).toFixed(1)}%)`);
  }

  // 每款车在4个目的地下的 overallScore 范围
  console.log('\n📊 车型评分跨度 (min-max overallScore):');
  const byVehicle = {};
  for (const rec of recommendations) {
    if (!byVehicle[rec.vehicleId]) byVehicle[rec.vehicleId] = [];
    byVehicle[rec.vehicleId].push(rec.overallScore);
  }
  for (const [vid, scores] of Object.entries(byVehicle)) {
    const min = Math.min(...scores).toFixed(2);
    const max = Math.max(...scores).toFixed(2);
    const spread = (Math.max(...scores) - Math.min(...scores)).toFixed(2);
    const rec = recommendations.find((r) => r.vehicleId === vid);
    console.log(`   ${vid} ${rec?.brand || ''}${rec?.model || ''}: ${min} ~ ${max} (跨度 ${spread})`);
  }
}

main();
