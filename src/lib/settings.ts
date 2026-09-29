import { prisma } from "./prisma";

interface CacheEntry {
  value: any;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export const DEFAULT_SETTINGS: Record<string, any> = {
  faceMatchThreshold: 85,
  maxReuploadPerDay: 3,
  defaultGeofenceRadius: 100,
  maxLateMinutes: 15,
};

export async function getAppSetting<T = any>(key: string): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key },
    });

    const val = setting ? (setting.value as T) : (DEFAULT_SETTINGS[key] as T);
    cache.set(key, {
      value: val,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return val;
  } catch (error) {
    console.error(`Failed to fetch app setting [${key}], using default:`, error);
    return DEFAULT_SETTINGS[key] as T;
  }
}

export async function setAppSetting(key: string, value: any): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
