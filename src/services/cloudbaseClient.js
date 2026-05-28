/**
 * CloudBase 客户端封装
 *
 * 职责：
 * - 初始化 @cloudbase/js-sdk（Publishable Key 从环境变量读取，不硬编码）
 * - 暴露 submitTravelPlan(payload) 调用云函数，不直接写数据库
 *
 * 注意：此文件不收集手机号、身份证、姓名、微信号、精确定位、设备指纹、User-Agent。
 */

let _app = null;
let _initError = null;

function getEnvConfig() {
  const envId = import.meta.env.VITE_TCB_ENV_ID;
  const publishableKey = import.meta.env.VITE_TCB_PUBLISHABLE_KEY;
  const appVersion = import.meta.env.VITE_APP_VERSION || 'dev';

  const missing = [];
  if (!envId) missing.push('VITE_TCB_ENV_ID');
  if (!publishableKey) missing.push('VITE_TCB_PUBLISHABLE_KEY');

  return { envId, publishableKey, appVersion, missing };
}

async function ensureApp() {
  if (_app) return _app;
  if (_initError) throw _initError;

  const { envId, publishableKey, appVersion, missing } = getEnvConfig();

  if (missing.length > 0) {
    const msg = `[cloudbaseClient] 缺少环境变量: ${missing.join(', ')}。请在 .env.local 中配置后刷新页面。`;
    console.error(msg);
    _initError = new Error(msg);
    throw _initError;
  }

  try {
    const cloudbase = await import('@cloudbase/js-sdk');

    _app = cloudbase.default.init({
      env: envId,
      accessKey: publishableKey,
    });

    console.info(`[cloudbaseClient] CloudBase 初始化完成 env=${envId} version=${appVersion}`);
    return _app;
  } catch (error) {
    const msg = `[cloudbaseClient] CloudBase 初始化失败: ${error.message}`;
    console.error(msg);
    _initError = new Error(msg);
    throw _initError;
  }
}

/**
 * 提交旅行预算数据到 CloudBase 云函数 submitTravelPlan。
 *
 * 此方法只负责调用云函数，不直接操作数据库。
 * 云函数内部负责写入 travel_plans 集合。
 *
 * @param {object} payload - 非敏感的旅行预算数据
 * @param {string} payload.destination - 目的地
 * @param {string} payload.departureCity - 出发城市
 * @param {number} payload.travelDays - 出行天数
 * @param {number} payload.peopleCount - 出行人数
 * @param {number} payload.rentalDays - 租车天数
 * @param {string} payload.energyType - 能源类型
 * @param {string} payload.energySource - 能耗估算来源
 * @param {string} payload.matchedVehicleName - 匹配车型名称
 * @param {string} payload.platform - 租车平台
 * @param {string} payload.carModel - 车型
 * @param {string} payload.insuranceType - 保险类型
 * @param {object} payload.budgetInputs - 预算输入汇总
 * @param {object} payload.budgetResult - 预算计算结果
 * @param {string} payload.budgetLevel - 预算等级
 * @param {string[]} payload.budgetAdvice - 预算建议
 * @returns {Promise<{ success: boolean, recordId?: string, message: string }>}
 */
export async function submitTravelPlan(payload) {
  try {
    const app = await ensureApp();

    const result = await app.callFunction({
      name: 'submitTravelPlan',
      data: {
        ...payload,
        source: 'budget_calculator',
        appVersion: getEnvConfig().appVersion,
      },
    });

    const data = result?.result || result;

    if (data?.ok) {
      return {
        success: true,
        recordId: data.recordId || '',
        message: '提交成功',
      };
    }

    return {
      success: false,
      message: data?.message || '提交失败，请稍后重试',
    };
  } catch (error) {
    console.warn('[cloudbaseClient] submitTravelPlan 调用失败:', error.message);

    // 网络超时或云函数不可用
    if (error.message?.includes('timeout') || error.message?.includes('network')) {
      return { success: false, message: '网络连接失败，请稍后重试' };
    }

    // 云函数不存在
    if (error.message?.includes('FUNCTION_NOT_FOUND') || error.code === 'FUNCTION_NOT_FOUND') {
      return { success: false, message: '服务暂不可用，请稍后重试' };
    }

    return { success: false, message: '提交失败，请稍后重试' };
  }
}

/**
 * 调用后台云函数 listTravelPlans 获取最近提交记录。
 *
 * 此方法只负责调用云函数，不直接操作数据库。
 * 云函数内部负责校验口令、读取数据库、字段投影。
 *
 * @param {string} adminToken - 后台访问口令
 * @param {object} [options]
 * @param {number} [options.pageSize] - 每页条数，默认 50，最大 100
 * @returns {Promise<{ success: boolean, records?: Array, total?: number, message?: string }>}
 */
export async function listTravelPlans(adminToken, options = {}) {
  try {
    const app = await ensureApp();

    const result = await app.callFunction({
      name: 'listTravelPlans',
      data: {
        adminToken: adminToken || '',
        pageSize: options.pageSize || 50,
      },
    });

    const data = result?.result || result;

    if (data?.success) {
      return {
        success: true,
        records: data.records || [],
        total: data.total || 0,
      };
    }

    return {
      success: false,
      message: data?.message || '读取失败，请稍后重试',
    };
  } catch (error) {
    console.warn('[cloudbaseClient] listTravelPlans 调用失败:', error.message);

    if (error.message?.includes('FUNCTION_NOT_FOUND') || error.code === 'FUNCTION_NOT_FOUND') {
      return { success: false, message: '服务暂不可用，请稍后重试' };
    }

    if (error.message?.includes('timeout') || error.message?.includes('network')) {
      return { success: false, message: '网络连接失败，请稍后重试' };
    }

    return { success: false, message: '读取失败，请稍后重试' };
  }
}
