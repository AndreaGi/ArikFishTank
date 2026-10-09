import { beforeEach, describe, expect, it } from 'vitest';
import { cambia, normalizza, statoDi } from './model';
import { elimina, esporta, importa, perData, salva, tutte, usaArchivio } from './storage';

beforeEach(() => {
  const m = new Map<string, string>();
  usaArchivio({ getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) });
});

describe('semaforo', () => {
  it('classifica i valori', () => {
    expect(statoDi('ph', 7)).toBe('ottimo');
    expect(statoDi('ph', 6.2)).toBe('attenzione');
    expect(statoDi('ph', 5)).toBe('pericolo');
    expect(statoDi('nitriti', 0)).toBe('ottimo');
    expect(statoDi('nitriti', 2)).toBe('pericolo');
    expect(statoDi('nitrati', 40)).toBe('attenzione');
  });
  it('stepper senza errori di virgola mobile e nei limiti', () => {
    expect(cambia('ph', 7, 1)).toBe(7.1);
    expect(cambia('ph', 7.2, -1)).toBe(7.1);
    expect(cambia('nitrati', 0, -1)).toBe(0);
    expect(normalizza('ph', 99)).toBe(10);
  });
});

describe('storage', () => {
  it('upsert per data, ordinamento e delete', () => {
    salva('2026-10-01', { ph: 7 });
    salva('2026-10-05', { ph: 7.2, nitrati: 10 });
    salva('2026-10-01', { ph: 6.8 });
    expect(tutte().map((a) => a.data)).toEqual(['2026-10-05', '2026-10-01']);
    expect(perData('2026-10-01')?.valori.ph).toBe(6.8);
    elimina('2026-10-05');
    expect(tutte()).toHaveLength(1);
  });
  it('esporta/importa e scarta righe non valide', () => {
    salva('2026-10-01', { ph: 7 });
    const backup = esporta();
    elimina('2026-10-01');
    expect(importa(backup)).toBe(1);
    expect(importa('[{"data":"boh","valori":{}},{"data":"2026-10-02","valori":{"ph":"x","fosfati":1}}]')).toBe(1);
    expect(perData('2026-10-02')?.valori).toEqual({ fosfati: 1 });
    expect(() => importa('{}')).toThrow();
  });
});
