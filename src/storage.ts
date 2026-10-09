import { Analisi, PARAMETRI, Parametro } from './model';

const CHIAVE = 'arik-fish-tanks:analisi';

/** Storage minimale (compatibile con localStorage) per poter testare fuori dal browser. */
export interface Archivio {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

let archivio: Archivio | undefined;

export function usaArchivio(a: Archivio): void {
  archivio = a;
}

function store(): Archivio {
  return archivio ?? localStorage;
}

function ordina(lista: Analisi[]): Analisi[] {
  return [...lista].sort((a, b) => b.data.localeCompare(a.data));
}

export function tutte(): Analisi[] {
  try {
    const grezzo = store().getItem(CHIAVE);
    return grezzo ? ordina(JSON.parse(grezzo) as Analisi[]) : [];
  } catch {
    return [];
  }
}

function scrivi(lista: Analisi[]): void {
  store().setItem(CHIAVE, JSON.stringify(ordina(lista)));
}

export function perData(data: string): Analisi | undefined {
  return tutte().find((a) => a.data === data);
}

/** Una sola analisi per giorno: salvare la stessa data sostituisce la precedente. */
export function salva(data: string, valori: Analisi['valori'], nota?: string): Analisi {
  const esistente = perData(data);
  const analisi: Analisi = { id: esistente?.id ?? `${data}-${Date.now()}`, data, valori, ...(nota ? { nota } : {}) };
  scrivi([...tutte().filter((a) => a.data !== data), analisi]);
  return analisi;
}

export function elimina(data: string): void {
  scrivi(tutte().filter((a) => a.data !== data));
}

export function esporta(): string {
  return JSON.stringify(tutte(), null, 2);
}

/** Importa un backup JSON; unisce per data (il backup vince). Restituisce quante analisi sono state lette. */
export function importa(json: string): number {
  const dati: unknown = JSON.parse(json);
  if (!Array.isArray(dati)) throw new Error('Formato non valido');
  const valide: Analisi[] = [];
  for (const r of dati as Analisi[]) {
    if (!r || typeof r.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.data) || typeof r.valori !== 'object') continue;
    const valori: Analisi['valori'] = {};
    for (const p of PARAMETRI) {
      const v = r.valori[p.id as Parametro];
      if (typeof v === 'number' && Number.isFinite(v)) valori[p.id] = v;
    }
    valide.push({ id: r.id ?? r.data, data: r.data, valori, ...(r.nota ? { nota: String(r.nota) } : {}) });
  }
  const date = new Set(valide.map((a) => a.data));
  scrivi([...tutte().filter((a) => !date.has(a.data)), ...valide]);
  return valide.length;
}
