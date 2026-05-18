const CLIENT_ID_KEY = 'pyuy_anonymous_client_id';
const REQUEST_TIMEOUT_MS = 8000;

function getAnonymousClientId() {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return `session-${Date.now().toString(36)}`;
  }
}

/**
 * 将预算快照提交到后台。
 * 如果未配置 VITE_BUDGET_SAVE_ENDPOINT 环境变量，仅打印提示并跳过。
 * 所有错误均静默处理，不影响本地保存和用户操作。
 *
 * @param {{ draft: object, result: object, selectedPlan: object|null, updatedAt: string }} snapshot
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export async function submitBudgetSnapshotToBackend(snapshot) {
  const endpoint = import.meta.env.VITE_BUDGET_SAVE_ENDPOINT;

  if (!endpoint) {
    console.info('[budget:save] 未配置 VITE_BUDGET_SAVE_ENDPOINT，仅本地保存');
    return { ok: false, reason: 'no-endpoint' };
  }

  const payload = {
    eventType: 'budget_snapshot_saved',
    source: 'budget_calculator',
    anonymousClientId: getAnonymousClientId(),
    createdAt: snapshot.updatedAt || new Date().toISOString(),
    updatedAt: snapshot.updatedAt || new Date().toISOString(),
    destination: snapshot.draft?.destination || '',
    departureCity: snapshot.draft?.departureCity || '',
    travelDays: Number(snapshot.draft?.tripDays) || 0,
    peopleCount: Number(snapshot.draft?.people) || 0,
    rentalDays: Number(snapshot.draft?.rentalDays) || 0,
    energyType: snapshot.draft?.energyType || '',
    platform: snapshot.selectedPlan?.platform || '',
    carModel: snapshot.selectedPlan?.carModel || '',
    insuranceType: snapshot.selectedPlan?.insurancePlan || '',
    budgetInputs: snapshot.draft || {},
    budgetResult: snapshot.result || {},
    budgetLevel: snapshot.result?.budgetLevel || '',
    budgetAdvice: snapshot.result?.suggestions || [],
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    pagePath: typeof window !== 'undefined' ? window.location.href : '',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[budget:save] 后台返回状态 ${response.status}`);
      return { ok: false, reason: 'bad-status', status: response.status };
    }

    console.info('[budget:save] 后台保存成功');
    return { ok: true };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('[budget:save] 请求超时，仅本地保存');
      return { ok: false, reason: 'timeout' };
    }
    console.warn('[budget:save] 提交失败，仅本地保存', error.message);
    return { ok: false, reason: 'network-error' };
  }
}
