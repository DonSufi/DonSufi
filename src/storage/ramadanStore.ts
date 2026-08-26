import { FastingStatus, RamadanFastingLog } from '../domain/ramadan/ramadan';
import { readJSON, writeJSON } from './db';
import { STORAGE_KEYS } from './keys';

export async function loadFastingLog(): Promise<RamadanFastingLog> {
  return readJSON(STORAGE_KEYS.ramadanFastingLog, {});
}

export async function setFastingStatus(date: string, status: FastingStatus): Promise<RamadanFastingLog> {
  const log = await loadFastingLog();
  const next = { ...log, [date]: status };
  await writeJSON(STORAGE_KEYS.ramadanFastingLog, next);
  return next;
}
