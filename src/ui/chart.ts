import { Analisi, ConfigParametro, formatta } from '../model';

const NS = 'http://www.w3.org/2000/svg';
const W = 640;
const H = 240;
const PAD = { l: 48, r: 16, t: 16, b: 32 };

function s(tag: string, attrs: Record<string, string | number>, testo?: string): SVGElement {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (testo) el.textContent = testo;
  return el;
}

/** Grafico a linea con fascia verde dell'intervallo ideale. `analisi` in qualsiasi ordine. */
export function grafico(c: ConfigParametro, analisi: Analisi[]): SVGElement {
  const punti = analisi
    .filter((a) => a.valori[c.id] !== undefined)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(-12)
    .map((a) => ({ data: a.data, v: a.valori[c.id] as number }));

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'grafico', role: 'img', 'aria-label': `Andamento ${c.nome}` });
  if (!punti.length) {
    svg.append(s('text', { x: W / 2, y: H / 2, 'text-anchor': 'middle', class: 'grafico-vuoto' }, 'Ancora nessun dato 🐟'));
    return svg;
  }

  const tutti = [...punti.map((p) => p.v), c.ok[0], c.ok[1]];
  let lo = Math.min(...tutti);
  let hi = Math.max(...tutti);
  const margine = (hi - lo || 1) * 0.2;
  lo = Math.max(0, lo - margine);
  hi += margine;
  const x = (i: number) => PAD.l + (punti.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i * (W - PAD.l - PAD.r)) / (punti.length - 1));
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);

  svg.append(s('rect', { x: PAD.l, y: y(c.ok[1]), width: W - PAD.l - PAD.r, height: Math.max(2, y(c.ok[0]) - y(c.ok[1])), class: 'fascia-ok' }));
  svg.append(s('text', { x: PAD.l - 6, y: y(c.ok[1]) + 5, 'text-anchor': 'end', class: 'asse' }, formatta(c.ok[1])));
  if (c.ok[0] > 0) svg.append(s('text', { x: PAD.l - 6, y: y(c.ok[0]) + 5, 'text-anchor': 'end', class: 'asse' }, formatta(c.ok[0])));
  svg.append(s('polyline', { points: punti.map((p, i) => `${x(i)},${y(p.v)}`).join(' '), fill: 'none', stroke: c.colore, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  punti.forEach((p, i) => {
    svg.append(s('circle', { cx: x(i), cy: y(p.v), r: 8, fill: '#fff', stroke: c.colore, 'stroke-width': 4 }));
    svg.append(s('text', { x: x(i), y: y(p.v) - 14, 'text-anchor': 'middle', class: 'valore-punto' }, formatta(p.v)));
    const [, m, g] = p.data.split('-');
    svg.append(s('text', { x: x(i), y: H - 8, 'text-anchor': 'middle', class: 'asse' }, `${Number(g)}/${Number(m)}`));
  });
  return svg;
}
