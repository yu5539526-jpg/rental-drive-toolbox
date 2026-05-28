const cloudbase = require('@cloudbase/node-sdk');

// ============================================================
// 字段白名单 — 只有在此列出的字段才会被写入数据库
// ============================================================

const TOP_LEVEL_WHITELIST = [
  'destination',
  'departureCity',
  'travelDays',
  'peopleCount',
  'rentalDays',
  'energyType',
  'energySource',
  'matchedVehicleName',
  'platform',
  'carModel',
  'insuranceType',
  'budgetLevel',
  'budgetAdvice',
  'anonymousClientId',
  'clientSubmittedAt',
  // 元信息字段
  'pagePath',
  'sourcePage',
  'appVersion',
  'destinationType',
  'pickupCity',
  'energyPreference',
];

const BUDGET_INPUT_WHITELIST = [
  'tripDays',
  'people',
  'rentalDays',
  'mileage',
  'rentalPlatformTotal',
  'tolls',
  'parking',
  'carWash',
  'vehicleDeposit',
  'violationDeposit',
  'hotelNightPrice',
  'breakfast',
  'lunch',
  'dinner',
  'snacks',
  'ticket',
  'shuttle',
  'cableway',
  'entertainment',
  'roundTripTransit',
  'cityTransport',
  'shopping',
  'gear',
  'other',
  'energyType',
  'destination',
  'departureCity',
];

const BUDGET_RESULT_WHITELIST = [
  'tripDays',
  'people',
  'mileage',
  'tripTotal',
  'perPerson',
  'perPersonBudget',
  'dailyAverage',
  'perPersonDaily',
  'temporaryFunds',
  'preparedFunds',
  'totalBudget',
  'vehicleCostRatio',
  'vehicleTransport',
  'lodgingDining',
  'scenic',
  'bigTraffic',
  'otherFees',
  'energyLabel',
  'energyType',
  'energySource',
  'matchedVehicleName',
  'budgetLevel',
  'completenessPercent',
  'isRoughEstimate',
  'vehicleCostJudgment',
  'suggestions',
];

// ============================================================
// 敏感字段黑名单 — 精确匹配 key 名称（小写归一化）
// ============================================================

const SENSITIVE_KEYS = new Set([
  'phone',
  'mobile',
  'tel',
  'telephone',
  'name',
  'realname',
  'real_name',
  'idcard',
  'idnumber',
  'id_number',
  'idcardnumber',
  'wechat',
  'weixin',
  'wx',
  'exactlocation',
  'exact_location',
  'latitude',
  'longitude',
  'lat',
  'lng',
  'gps',
  'useragent',
  'user_agent',
  'ua',
  'fingerprint',
  'deviceid',
  'device_id',
  'device',
  'platenumber',
  'plate_number',
  'plate',
  'address',
  'homeaddress',
  'home_address',
  'email',
  'mail',
  'birthday',
  'birth',
  'gender',
  'sex',
  'age',
]);

// ============================================================
// 校验常量
// ============================================================

const MAX_PAYLOAD_SIZE = 64 * 1024;
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_LENGTH = 20;
const MAX_BUDGET_ADVICE_LENGTH = 8;
const MAX_NESTED_STRING_LENGTH = 300;

// ============================================================
// 工具函数
// ============================================================

function isSensitiveKey(key) {
  return SENSITIVE_KEYS.has(String(key || '').toLowerCase().trim());
}

function sanitizeString(value, maxLen) {
  if (value == null) return '';
  return String(value).trim().slice(0, maxLen);
}

function sanitizeNumber(value) {
  if (value == null || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sanitizeBoolean(value) {
  return Boolean(value);
}

function sanitizeArray(value, maxLen) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxLen).map(function (item) {
    return sanitizeString(item, MAX_STRING_LENGTH);
  }).filter(Boolean);
}

function filterObject(obj, whitelist, maxStrLen) {
  if (!obj || typeof obj !== 'object') return {};
  var len = maxStrLen || MAX_NESTED_STRING_LENGTH;
  var result = {};
  for (var i = 0; i < whitelist.length; i++) {
    var key = whitelist[i];
    if (!(key in obj)) continue;
    var val = obj[key];
    if (val == null) {
      result[key] = null;
    } else if (typeof val === 'string') {
      result[key] = sanitizeString(val, len);
    } else if (typeof val === 'number') {
      result[key] = sanitizeNumber(val);
    } else if (typeof val === 'boolean') {
      result[key] = sanitizeBoolean(val);
    } else if (Array.isArray(val)) {
      result[key] = sanitizeArray(val, MAX_ARRAY_LENGTH);
    }
    // 不认识的类型静默跳过
  }
  return result;
}

/**
 * 递归扫描对象所有 key，精确匹配敏感字段名
 * 不再使用子串匹配，避免 pagePath 被 'age' 误伤
 */
function scanSensitiveKeys(obj, path) {
  if (!obj || typeof obj !== 'object') return null;
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var fullPath = path ? path + '.' + key : key;
    if (isSensitiveKey(key)) {
      return '检测到敏感字段: ' + fullPath;
    }
    var val = obj[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      var nested = scanSensitiveKeys(val, fullPath);
      if (nested) return nested;
    }
  }
  return null;
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'payload 不能为空';
  }

  var jsonSize = Buffer.byteLength(JSON.stringify(payload), 'utf-8');
  if (jsonSize > MAX_PAYLOAD_SIZE) {
    return 'payload 超过大小限制 (' + MAX_PAYLOAD_SIZE + ' 字节)';
  }

  var sensitive = scanSensitiveKeys(payload, '');
  if (sensitive) {
    return sensitive;
  }

  return null;
}

// ============================================================
// 云函数入口
// ============================================================

exports.main = async function (event, context) {
  console.log('[submitTravelPlan] 收到请求');

  // 兼容控制台手动测试：如果 event 只有 { payload: {...} }，自动解包
  var data = (event && event.payload && typeof event.payload === 'object' && Object.keys(event).length === 1)
    ? event.payload
    : event;

  // -------- 基础校验 --------
  var validationError = validatePayload(data);
  if (validationError) {
    console.warn('[submitTravelPlan] 校验失败:', validationError);
    return { success: false, message: '提交数据校验未通过' };
  }

  // -------- 字段白名单过滤 --------
  var topLevel = filterObject(data, TOP_LEVEL_WHITELIST, MAX_STRING_LENGTH);
  var budgetInputs = filterObject(data.budgetInputs, BUDGET_INPUT_WHITELIST, MAX_NESTED_STRING_LENGTH);
  var budgetResult = filterObject(data.budgetResult, BUDGET_RESULT_WHITELIST, MAX_NESTED_STRING_LENGTH);

  // 兼容 tripInfo 扁平字段（来自控制台测试或新版前端）
  var tripInfoRaw = data.tripInfo || {};
  var tripInfo = {
    destination: sanitizeString(tripInfoRaw.destination || topLevel.destination, MAX_STRING_LENGTH),
    departureCity: sanitizeString(tripInfoRaw.pickupCity || tripInfoRaw.departureCity || topLevel.departureCity, MAX_STRING_LENGTH),
    destinationType: sanitizeString(tripInfoRaw.destinationType || topLevel.destinationType, MAX_STRING_LENGTH),
    travelDays: sanitizeNumber(tripInfoRaw.travelDays || topLevel.travelDays),
    rentalDays: sanitizeNumber(tripInfoRaw.rentalDays || topLevel.rentalDays),
    peopleCount: sanitizeNumber(tripInfoRaw.peopleCount || topLevel.peopleCount),
    energyType: sanitizeString(tripInfoRaw.energyPreference || topLevel.energyPreference || topLevel.energyType, MAX_STRING_LENGTH),
    energySource: sanitizeString(topLevel.energySource, MAX_STRING_LENGTH),
    matchedVehicleName: sanitizeString(topLevel.matchedVehicleName, MAX_STRING_LENGTH),
  };

  // budgetAdvice 单独处理，限制数组长度
  var budgetAdvice = sanitizeArray(data.budgetAdvice, MAX_BUDGET_ADVICE_LENGTH);

  // 合并 budgetResult（兼容 totalBudget/perPersonBudget 扁平字段）
  var totalBudget = sanitizeNumber(budgetResult.totalBudget || budgetResult.tripTotal);
  var perPersonBudget = sanitizeNumber(budgetResult.perPersonBudget || budgetResult.perPerson);

  var now = new Date().toISOString();

  // -------- 组装入库文档 --------
  var doc = {
    schemaVersion: 'travel_plan_budget_v1',
    source: 'budget_generate_card',
    sourcePage: sanitizeString(topLevel.sourcePage || 'budget', 64),
    pagePath: sanitizeString(topLevel.pagePath || '', 256),
    appVersion: sanitizeString(topLevel.appVersion || '', 64),
    createdAt: now,
    clientSubmittedAt: sanitizeString(topLevel.clientSubmittedAt, 64) || null,
    anonymousClientId: sanitizeString(topLevel.anonymousClientId, 128) || null,

    tripInfo: tripInfo,

    rentalPlan: {
      platform: sanitizeString(topLevel.platform, MAX_STRING_LENGTH),
      carModel: sanitizeString(topLevel.carModel, MAX_STRING_LENGTH),
      insuranceType: sanitizeString(topLevel.insuranceType, MAX_STRING_LENGTH),
    },

    budgetInput: {
      tripDays: sanitizeNumber(budgetInputs.tripDays),
      people: sanitizeNumber(budgetInputs.people),
      rentalDays: sanitizeNumber(budgetInputs.rentalDays),
      mileage: sanitizeNumber(budgetInputs.mileage),
      rentalPlatformTotal: sanitizeNumber(budgetInputs.rentalPlatformTotal),
      tolls: sanitizeNumber(budgetInputs.tolls),
      parking: sanitizeNumber(budgetInputs.parking),
      carWash: sanitizeNumber(budgetInputs.carWash),
      vehicleDeposit: sanitizeNumber(budgetInputs.vehicleDeposit),
      violationDeposit: sanitizeNumber(budgetInputs.violationDeposit),
      hotelNightPrice: sanitizeNumber(budgetInputs.hotelNightPrice),
      breakfast: sanitizeNumber(budgetInputs.breakfast),
      lunch: sanitizeNumber(budgetInputs.lunch),
      dinner: sanitizeNumber(budgetInputs.dinner),
      snacks: sanitizeNumber(budgetInputs.snacks),
      ticket: sanitizeNumber(budgetInputs.ticket),
      shuttle: sanitizeNumber(budgetInputs.shuttle),
      cableway: sanitizeNumber(budgetInputs.cableway),
      entertainment: sanitizeNumber(budgetInputs.entertainment),
      roundTripTransit: sanitizeNumber(budgetInputs.roundTripTransit),
      cityTransport: sanitizeNumber(budgetInputs.cityTransport),
      shopping: sanitizeNumber(budgetInputs.shopping),
      gear: sanitizeNumber(budgetInputs.gear),
      other: sanitizeNumber(budgetInputs.other),
    },

    budgetResult: {
      totalBudget: totalBudget,
      perPersonBudget: perPersonBudget,
      dailyAverage: sanitizeNumber(budgetResult.dailyAverage),
      perPersonDaily: sanitizeNumber(budgetResult.perPersonDaily),
      temporaryFunds: sanitizeNumber(budgetResult.temporaryFunds),
      preparedFunds: sanitizeNumber(budgetResult.preparedFunds),
      vehicleCostRatio: sanitizeNumber(budgetResult.vehicleCostRatio),
      vehicleTransport: sanitizeNumber(budgetResult.vehicleTransport),
      lodgingDining: sanitizeNumber(budgetResult.lodgingDining),
      scenic: sanitizeNumber(budgetResult.scenic),
      bigTraffic: sanitizeNumber(budgetResult.bigTraffic),
      otherFees: sanitizeNumber(budgetResult.otherFees),
      energyLabel: sanitizeString(budgetResult.energyLabel, MAX_STRING_LENGTH),
      budgetLevel: sanitizeString(budgetResult.budgetLevel, MAX_STRING_LENGTH),
      isRoughEstimate: Boolean(budgetResult.isRoughEstimate),
      completenessPercent: sanitizeNumber(budgetResult.completenessPercent),
    },

    budgetAdvice: budgetAdvice,

    consent: {
      noSensitiveData: true,
      privacyNoticeShown: true,
    },
  };

  // -------- 写入数据库 --------
  var db;
  try {
    var app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
    db = app.database();
  } catch (err) {
    console.error('[submitTravelPlan] 数据库初始化失败:', err.message);
    return { success: false, message: '保存失败' };
  }

  try {
    var result = await db.collection('travel_plans').add(doc);
    console.log('[submitTravelPlan] 写入成功 recordId:', result.id);
    return {
      success: true,
      recordId: result.id || '',
      message: '保存成功',
    };
  } catch (err) {
    console.error('[submitTravelPlan] 数据库写入失败:', err.message);
    return { success: false, message: '保存失败' };
  }
};
