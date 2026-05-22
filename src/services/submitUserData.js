const STORAGE_KEY = 'rentalDrive.leadSubmissions';

export async function submitUserData(data) {
  const payload = {
    source: 'xhs-h5-toolbox',
    createdAt: new Date().toISOString(),
    ...data,
  };

  try {
    const existing = safeParse(localStorage.getItem(STORAGE_KEY), []);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([payload, ...existing]));
  } catch (error) {
    console.warn('submitUserData localStorage save failed', error);
  }

  return {
    ok: true,
    data: payload,
  };
}

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
