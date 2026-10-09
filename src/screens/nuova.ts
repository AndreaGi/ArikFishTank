import { FACCINE, FRASI, PARAMETRI, Parametro, cambia, dataLeggibile, formatta, giornoFa, normalizza, oggi, statoDi, configDi } from '../model';
import { perData, salva } from '../storage';
import { celebra } from '../ui/celebrazione';
import { bottone, h } from '../ui/dom';
import type { Vai } from '../main';

export function nuova(vai: Vai, dataIniziale: string = oggi()): HTMLElement {
  let data = dataIniziale;
  let valori: Partial<Record<Parametro, number>> = { ...perData(data)?.valori };

  const radice = h('section', { class: 'schermata' });
  const quando = h('div', { class: 'quando' });
  const schede = h('div', { class: 'schede' });
  const salvaBtn = bottone('Salva! ✅', 'grande verde', onSalva);

  function disegnaQuando() {
    const input = h('input', {
      type: 'date',
      value: data,
      max: oggi(),
      'aria-label': 'Scegli il giorno',
      onchange: (e) => {
        const v = (e.target as HTMLInputElement).value;
        if (v) cambiaData(v);
      },
    });
    quando.replaceChildren(
      h('h2', {}, '📅 Che giorno è?'),
      h('div', { class: 'riga' },
        bottone('Oggi', data === oggi() ? 'scelto' : '', () => cambiaData(oggi())),
        bottone('Ieri', data === giornoFa(1) ? 'scelto' : '', () => cambiaData(giornoFa(1))),
        input,
      ),
      h('p', { class: 'data-grande' }, dataLeggibile(data)),
      ...(perData(data) ? [h('p', { class: 'avviso' }, "✏️ C'è già un'analisi di questo giorno: la stai modificando.")] : []),
    );
  }

  function cambiaData(nuovaData: string) {
    data = nuovaData;
    valori = { ...perData(data)?.valori };
    disegnaQuando();
    disegnaSchede();
  }

  function imposta(p: Parametro, v: number | undefined) {
    if (v === undefined) delete valori[p];
    else valori[p] = normalizza(p, v);
    disegnaSchede();
  }

  function scheda(p: Parametro): HTMLElement {
    const c = configDi(p);
    const v = valori[p];
    const stato = v === undefined ? undefined : statoDi(p, v);
    const campo = h('input', {
      type: 'number',
      inputmode: 'decimal',
      step: String(c.step),
      min: String(c.min),
      max: String(c.max),
      class: 'numero',
      placeholder: '?',
      'aria-label': `Valore ${c.nome}`,
      value: v === undefined ? '' : String(v),
      onchange: (e) => {
        const t = (e.target as HTMLInputElement).value.replace(',', '.');
        imposta(p, t === '' || isNaN(Number(t)) ? undefined : Number(t));
      },
    });
    return h('article', { class: `scheda ${stato ?? 'vuota'}`, style: `--colore:${c.colore}` },
      h('header', {}, h('span', { class: 'emoji' }, c.emoji), h('h3', {}, c.nome), v !== undefined ? bottone('✖', 'piccolo', () => imposta(p, undefined), `Cancella ${c.nome}`) : null),
      h('div', { class: 'stepper' },
        bottone('−', 'tondo', () => imposta(p, cambia(p, v ?? c.iniziale + c.step, -1)), `Diminuisci ${c.nome}`),
        h('div', { class: 'valore' }, campo, c.unita ? h('small', {}, c.unita) : null),
        bottone('+', 'tondo', () => imposta(p, v === undefined ? c.iniziale : cambia(p, v, 1)), `Aumenta ${c.nome}`),
      ),
      h('p', { class: 'feedback' }, stato ? `${FACCINE[stato]} ${FRASI[stato]}` : 'Tocca + per iniziare'),
    );
  }

  function disegnaSchede() {
    schede.replaceChildren(...PARAMETRI.map((c) => scheda(c.id)));
    const n = Object.keys(valori).length;
    salvaBtn.disabled = n === 0;
    salvaBtn.textContent = n === 0 ? 'Inserisci almeno un valore' : `Salva! ✅ (${n}/${PARAMETRI.length})`;
  }

  async function onSalva() {
    salva(data, valori);
    await celebra();
    vai({ nome: 'dettaglio', data });
  }

  disegnaQuando();
  disegnaSchede();
  radice.append(
    h('header', { class: 'barra' }, bottone('🏠', 'tondo', () => vai({ nome: 'home' }), 'Torna alla home'), h('h1', {}, 'Nuova analisi')),
    quando,
    schede,
    h('footer', { class: 'piede' }, salvaBtn),
  );
  return radice;
}
