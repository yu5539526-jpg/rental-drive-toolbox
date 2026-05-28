const cloudbase = require('@cloudbase/node-sdk');

// ============================================================
// 后台列表云函数 listTravelPlans
//
// 职责：
// - 从 process.env.ADMIN_ACCESS_TOKEN 读取服务端口令
// - 校验前端传入的 adminToken
// - 校验通过后从 travel_plans 读取最近记录
// - 只返回后台展示所需白名单字段，不返回完整原始记录
//
// 安全：
// - 不返回手机号、身份证、姓名、微信号、精确定位、User-Agent
// - 数据库保持 ADMINONLY，前端不直接读数据库
// ============================================================

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

// ============================================================
// 返回字段白名单 — 只有这些字段会返回给后台页面
// ============================================================

const RECORD_PROJECTION = {
  _id: 1,
  createdAt: 1,
  schemaVersion: 1,
  entryMode: 1,
  'source.sourceChannel': 1,
  'source.sourceCampaign': 1,
  'source.sourceNoteId': 1,
  'source.sourceKeyword': 1,
  'tripInfo.destination': 1,
  'tripInfo.departureCity': 1,
  'tripInfo.peopleCount': 1,
  'tripInfo.travelDays': 1,
  'tripInfo.rentalDays': 1,
  'tripInfo.energyType': 1,
  'tripInfo.mileage': 1,
  'budgetResult.tripTotal': 1,
  'budgetResult.perPerson': 1,
  'budgetResult.dailyAverage': 1,
  'budgetResult.budgetLevel': 1,
  'budgetResult.vehicleCostRatio': 1,
};

// ============================================================
// 敏感字段黑名单 — 二次保障，防止旧数据中的异常字段泄露
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
  'ip', 'ipaddress', 'ip_address',
  'cookie', 'token', 'session', 'secret',
  'password', 'passwd', 'pwd',
]);

// ============================================================
// 工具函数
// ============================================================

function isSensitiveKey(key) {
  return SENSITIVE_KEYS.has(String(key || '').toLowerCase().trim());
}

function scanSensitiveKeys(obj, path) {
  if (!obj || typeof obj !== 'object') return false;
  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      if (scanSensitiveKeys(obj[i], path + '[' + i + ']')) return true;
    }
    return false;
  }
  var keys = Object.keys(obj);
  for (var j = 0; j < keys.length; j++) {
    var key = keys[j];
    var fullPath = path ? path + '.' + key : key;
    if (isSensitiveKey(key)) {
      console.warn('[listTravelPlans] 检测到敏感字段:', fullPath);
      return true;
    }
    var val = obj[key];
    if (val && typeof val === 'object') {
      if (scanSensitiveKeys(val, fullPath)) return true;
    }
  }
  return false;
}

function sanitizeRecord(record) {
  var clean = {
    id: record._id || '',
    createdAt: record.createdAt || null,
    schemaVersion: record.schemaVersion || null,
    entryMode: record.entryMode || null,
    source: {
      sourceChannel: record.source?.sourceChannel || null,
      sourceCampaign: record.source?.sourceCampaign || null,
      sourceNoteId: record.source?.sourceNoteId || null,
      sourceKeyword: record.source?.sourceKeyword || null,
    },
    tripInfo: {
      destination: record.tripInfo?.destination || null,
      departureCity: record.tripInfo?.departureCity || null,
      peopleCount: record.tripInfo?.peopleCount ?? null,
      travelDays: record.tripInfo?.travelDays ?? null,
      rentalDays: record.tripInfo?.rentalDays ?? null,
      energyType: record.tripInfo?.energyType || null,
      mileage: record.tripInfo?.mileage ?? null,
    },
    budgetResult: {
      tripTotal: record.budgetResult?.tripTotal ?? null,
      perPerson: record.budgetResult?.perPerson ?? null,
      dailyAverage: record.budgetResult?.dailyAverage ?? null,
      budgetLevel: record.budgetResult?.budgetLevel || null,
      vehicleCostRatio: record.budgetResult?.vehicleCostRatio ?? null,
    },
  };

  // 二次安全扫描：如果 sanitizeRecord 白名单意外漏了字段，这里兜底
  if (scanSensitiveKeys(clean, '')) {
    console.warn('[listTravelPlans] sanitizeRecord 后仍检测到敏感字段，丢弃本条记录');
    return null;
  }

  return clean;
}

function timingSafeEqual(a, b) {
  var aLen = (a || '').length;
  var bLen = (b || '').length;
  var result = aLen ^ bLen;
  for (var i = 0; i < aLen && i < bLen; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ============================================================
// 云函数入口
// ============================================================

exports.main = async function (event, context) {
  console.log('[listTravelPlans] 收到请求');

  // -------- 读取服务端环境变量 --------
  var serverToken = process.env.ADMIN_ACCESS_TOKEN;

  if (!serverToken || typeof serverToken !== 'string' || serverToken.trim().length === 0) {
    console.error('[listTravelPlans] ADMIN_ACCESS_TOKEN 未配置');
    return { success: false, message: '后台口令未配置' };
  }

  // -------- 校验前端传入的口令 --------
  var clientToken = (event && event.adminToken) || '';

  if (!timingSafeEqual(String(clientToken), serverToken)) {
    console.warn('[listTravelPlans] 口令校验失败');
    return { success: false, message: '访问口令错误' };
  }

  // -------- 初始化数据库 --------
  var db;
  try {
    var app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
    db = app.database();
  } catch (err) {
    console.error('[listTravelPlans] 数据库初始化失败:', err.message);
    return { success: false, message: '读取失败' };
  }

  // -------- 查询数据库 --------
  try {
    var limit = DEFAULT_LIMIT;
    if (event && typeof event.pageSize === 'number' && event.pageSize > 0) {
      limit = Math.min(event.pageSize, MAX_LIMIT);
    }

    var result = await db.collection('travel_plans')
      .field(RECORD_PROJECTION)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    var rawRecords = result.data || [];

    // 字段投影 + 敏感过滤
    var records = [];
    for (var i = 0; i < rawRecords.length; i++) {
      var clean = sanitizeRecord(rawRecords[i]);
      if (clean) {
        records.push(clean);
      }
    }

    console.log('[listTravelPlans] 查询成功, 返回 ' + records.length + ' 条记录');
    return {
      success: true,
      records: records,
      total: records.length,
    };
  } catch (err) {
    console.error('[listTravelPlans] 数据库查询失败:', err.message);
    return { success: false, message: '读取失败，请稍后重试' };
  }
};
