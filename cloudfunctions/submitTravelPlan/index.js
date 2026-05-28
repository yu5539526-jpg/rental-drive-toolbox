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
  'appVersion',
  'entryMode',
  'sourceChannel',
  'sourceCampaign',
  'sourceNoteId',
  'sourceKeyword',
];

const BUDGET_INPUT_RAW_WHITELIST = [
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
  'tripTotal',
  'perPerson',
  'dailyAverage',
  'perPersonDaily',
  'temporaryFunds',
  'preparedFunds',
  'vehicleCostRatio',
  'vehicleTransport',
  'lodgingDining',
  'scenic',
  'bigTraffic',
  'otherFees',
  'energyLabel',
  'energyCost',
  'energyType',
  'energySource',
  'matchedVehicleName',
  'budgetLevel',
  'completenessPercent',
  'isRoughEstimate',
  'vehicleCostJudgment',
  'suggestions',
  'mileage',
  'tripDays',
  'people',
];

// ============================================================
// 敏感字段黑名单 — 精确匹配 key 名称（小写归一化）
// ============================================================

const SENSITIVE_KEYS = new Set([
  'phone', 'mobile', 'tel', 'telephone',
  'name', 'realname', 'real_name',
  'idcard', 'idnumber', 'id_number', 'idcardnumber',
  'wechat', 'weixin', 'wx',
  'exactlocation', 'exact_location',
  'latitude', 'longitude', 'lat', 'lng', 'gps',
  'useragent', 'user_agent', 'ua',
  'fingerprint', 'deviceid', 'device_id', 'device',
  'platenumber', 'plate_number', 'plate',
  'address', 'homeaddress', 'home_address',
  'email', 'mail',
  'birthday', 'birth', 'gender', 'sex', 'age',
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
  var n = Number(value);
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
  }
  return result;
}

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
// 数据映射：将前端原始字段映射为 v2 标准结构
// ============================================================

/**
 * 只保存非零、非空的有效预算输入字段。
 * 空字段或 0 值字段不写入，减少存储膨胀。
 */
function mapBudgetInput(raw) {
  var result = {};

  var fields = [
    { key: 'carRentalCost', src: 'rentalPlatformTotal' },
    { key: 'insuranceCost', src: null },
    { key: 'energyCost', src: null },
    { key: 'tollCost', src: 'tolls' },
    { key: 'parkingCost', src: 'parking' },
    { key: 'hotelCost', src: 'hotelNightPrice' },
    { key: 'foodCost', src: null, computed: function(r) {
      return sanitizeNumber(r.breakfast) + sanitizeNumber(r.lunch) +
             sanitizeNumber(r.dinner) + sanitizeNumber(r.snacks);
    }},
    { key: 'ticketCost', src: 'ticket' },
    { key: 'otherCost', src: null, computed: function(r) {
      return sanitizeNumber(r.cityTransport) + sanitizeNumber(r.shopping) +
             sanitizeNumber(r.gear) + sanitizeNumber(r.other) +
             sanitizeNumber(r.carWash) + sanitizeNumber(r.shuttle) +
             sanitizeNumber(r.cableway) + sanitizeNumber(r.entertainment) +
             sanitizeNumber(r.roundTripTransit);
    }},
  ];

  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    var val;
    if (f.computed) {
      val = f.computed(raw);
    } else if (f.src) {
      val = sanitizeNumber(raw[f.src]);
    } else {
      val = null;
    }
    // 只保存非零、非 null 的有效值
    if (val !== null && val !== 0) {
      result[f.key] = val;
    }
  }

  return result;
}

function mapBudgetResult(raw) {
  var result = {};

  var fields = [
    'tripTotal',
    'perPerson',
    'dailyAverage',
    'perPersonDaily',
    'vehicleTransport',
    'lodgingDining',
    'scenic',
    'otherFees',
  ];

  for (var i = 0; i < fields.length; i++) {
    var key = fields[i];
    var val = sanitizeNumber(raw[key]);
    if (val !== 0) result[key] = val;
  }

  // vehicleCostRatio 保留一位小数
  var ratio = sanitizeNumber(raw.vehicleCostRatio);
  if (ratio !== 0) result.vehicleCostRatio = ratio;

  // 文本字段 — 只在非空时写入
  var budgetLevel = sanitizeString(raw.budgetLevel, MAX_STRING_LENGTH);
  if (budgetLevel) result.budgetLevel = budgetLevel;

  // 布尔字段 — 始终写入，方便分析
  result.isRoughEstimate = Boolean(raw.isRoughEstimate);

  return result;
}

function mapTripInfo(topLevel, rawBudgetInput, rawBudgetResult) {
  var result = {};

  var strFields = [
    { key: 'destination', src: topLevel.destination },
    { key: 'departureCity', src: topLevel.departureCity },
    { key: 'energyType', src: topLevel.energyType },
  ];
  for (var i = 0; i < strFields.length; i++) {
    var val = sanitizeString(strFields[i].src, MAX_STRING_LENGTH);
    if (val) result[strFields[i].key] = val;
  }

  var numFields = [
    { key: 'travelDays', src: topLevel.travelDays },
    { key: 'rentalDays', src: topLevel.rentalDays },
    { key: 'peopleCount', src: topLevel.peopleCount },
  ];
  for (var j = 0; j < numFields.length; j++) {
    var n = sanitizeNumber(numFields[j].src);
    if (n !== 0) result[numFields[j].key] = n;
  }

  // mileage 可能来自 budgetInput 或 budgetResult
  var mileage = sanitizeNumber(rawBudgetInput.mileage) || sanitizeNumber(rawBudgetResult.mileage);
  if (mileage !== 0) result.mileage = mileage;

  return result;
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
  var rawBudgetInput = filterObject(data.budgetInputs, BUDGET_INPUT_RAW_WHITELIST, MAX_NESTED_STRING_LENGTH);
  var rawBudgetResult = filterObject(data.budgetResult, BUDGET_RESULT_WHITELIST, MAX_NESTED_STRING_LENGTH);
  var budgetAdvice = sanitizeArray(data.budgetAdvice, MAX_BUDGET_ADVICE_LENGTH);

  var now = new Date().toISOString();

  // -------- 组装入库文档 (v2) --------
  var doc = {
    schemaVersion: 'travel_plan_budget_v2',

    entryMode: sanitizeString(topLevel.entryMode, 32) || null,
    appVersion: sanitizeString(topLevel.appVersion, 64) || null,

    createdAt: now,
    clientSubmittedAt: sanitizeString(topLevel.clientSubmittedAt, 64) || null,
    anonymousClientId: sanitizeString(topLevel.anonymousClientId, 128) || null,

    source: {
      page: 'budget',
      action: 'generate_budget_card',
      sourceChannel: sanitizeString(topLevel.sourceChannel, 64) || null,
      sourceCampaign: sanitizeString(topLevel.sourceCampaign, 64) || null,
      sourceNoteId: sanitizeString(topLevel.sourceNoteId, 128) || null,
      sourceKeyword: sanitizeString(topLevel.sourceKeyword, 128) || null,
      appVersion: sanitizeString(topLevel.appVersion, 64) || null,
    },

    tripInfo: mapTripInfo(topLevel, rawBudgetInput, rawBudgetResult),

    rentalPlan: {
      platform: sanitizeString(topLevel.platform, MAX_STRING_LENGTH) || null,
      carModel: sanitizeString(topLevel.carModel, MAX_STRING_LENGTH) || null,
      insuranceType: sanitizeString(topLevel.insuranceType, MAX_STRING_LENGTH) || null,
    },

    budgetInput: mapBudgetInput(rawBudgetInput),

    budgetResult: mapBudgetResult(rawBudgetResult),

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
