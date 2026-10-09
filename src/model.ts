export type Parametro = 'ph' | 'nitriti' | 'nitrati' | 'ammoniaca' | 'fosfati';
export type Stato = 'ottimo' | 'attenzione' | 'pericolo';

export interface Analisi {
  id: string;
  data: string; // YYYY-MM-DD
  valori: Partial<Record<Parametro, number>>;
  nota?: string;
}

export interface ConfigParametro {
  id: Parametro;
  nome: string;
  emoji: string;
  colore: string;
  unita: string;
  step: number;
  min: number;
  max: number;
  iniziale: number;
  /** intervallo perfetto */
  ok: [number, number];
  /** intervallo accettabile (fuori da qui = pericolo) */
  warn: [number, number];
}

export const PARAMETRI: ConfigParametro[] = [
  { id: 'ph', nome: 'PH', emoji: '🧪', colore: '#8b5cf6', unita: '', step: 0.1, min: 4, max: 10, iniziale: 7, ok: [6.5, 7.5], warn: [6, 8] },
  { id: 'nitriti', nome: 'Nitriti', emoji: '🫧', colore: '#f59e0b', unita: 'mg/L', step: 0.25, min: 0, max: 10, iniziale: 0, ok: [0, 0.1], warn: [0, 0.5] },
  { id: 'nitrati', nome: 'Nitrati', emoji: '🌿', colore: '#10b981', unita: 'mg/L', step: 5, min: 0, max: 200, iniziale: 0, ok: [0, 25], warn: [0, 50] },
  { id: 'ammoniaca', nome: 'Ammoniaca', emoji: '💨', colore: '#ef4444', unita: 'mg/L', step: 0.25, min: 0, max: 10, iniziale: 0, ok: [0, 0.1], warn: [0, 0.5] },
  { id: 'fosfati', nome: 'Fosfati', emoji: '🦐', colore: '#3b82f6', unita: 'mg/L', step: 0.25, min: 0, max: 10, iniziale: 0, ok: [0, 1], warn: [0, 2] },
];

export const configDi = (p: Parametro): ConfigParametro => PARAMETRI.find((c) => c.id === p)!;

const inRange = (v: number, [a, b]: [number, number]) => v >= a && v <= b;

export function statoDi(p: Parametro, valore: number): Stato {
  const c = configDi(p);
  if (inRange(valore, c.ok)) return 'ottimo';
  if (inRange(valore, c.warn)) return 'attenzione';
  return 'pericolo';
}

export const FACCINE: Record<Stato, string> = { ottimo: '😀', attenzione: '😐', pericolo: '😟' };
export const FRASI: Record<Stato, string> = {
  ottimo: 'Perfetto, i pesci sono felici!',
  attenzione: 'Occhio! Chiedi aiuto a un grande.',
  pericolo: 'Ahi! I pesci non stanno bene.',
};

/** Arrotonda al passo del parametro e limita a [min, max]; elimina errori di virgola mobile. */
export function normalizza(p: Parametro, valore: number): number {
  const c = configDi(p);
  const limitato = Math.min(c.max, Math.max(c.min, valore));
  return Math.round(limitato * 100) / 100;
}

export function cambia(p: Parametro, valore: number, direzione: 1 | -1): number {
  return normalizza(p, valore + direzione * configDi(p).step);
}

export function formatta(v: number): string {
  return String(v).replace('.', ',');
}

export function oggi(): string {
  return aData(new Date());
}

export function aData(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const g = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${g}`;
}

export function giornoFa(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return aData(d);
}

export function dataLeggibile(data: string): string {
  const [y, m, g] = data.split('-').map(Number);
  return new Date(y, m - 1, g).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
