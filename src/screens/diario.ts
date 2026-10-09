import { Analisi, FACCINE, PARAMETRI, configDi, dataLeggibile, formatta, statoDi, Stato } from '../model';
import { elimina, perData, tutte } from '../storage';
import { bottone, h } from '../ui/dom';
import type { Vai } from '../main';

const peggiore = (a: Analisi): Stato => {
  const stati = PARAMETRI.filter((c) => a.valori[c.id] !== undefined).map((c) => statoDi(c.id, a.valori[c.id]!));
  return stati.includes('pericolo') ? 'pericolo' : stati.includes('attenzione') ? 'attenzione' : 'ottimo';
};

export function diario(vai: Vai): HTMLElement {
  const lista = tutte();
  return h('section', { class: 'schermata' },
    h('header', { class: 'barra' }, bottone('🏠', 'tondo', () => vai({ nome: 'home' }), 'Torna alla home'), h('h1', {}, 'Il mio diario')),
    lista.length
      ? h('div', { class: 'lista' },
          ...lista.map((a) =>
            h('button', { type: 'button', class: `riga-giorno ${peggiore(a)}`, onclick: () => vai({ nome: 'dettaglio', data: a.data }) },
              h('span', { class: 'faccia' }, FACCINE[peggiore(a)]),
              h('span', { class: 'giorno' }, dataLeggibile(a.data)),
              h('span', { class: 'freccia' }, '›'),
            ),
          ),
        )
      : h('div', { class: 'vuoto' }, h('p', { class: 'emoji-gigante' }, '🐠'), h('p', {}, 'Nessuna analisi ancora!'), bottone('➕ Fai la prima analisi', 'grande', () => vai({ nome: 'nuova' }))),
    h('footer', { class: 'piede' }, bottone('📈 Andamento', 'grande', () => vai({ nome: 'andamento' }))),
  );
}

export function dettaglio(vai: Vai, data: string): HTMLElement {
  const a = perData(data);
  if (!a) return diario(vai);
  let chiedo = false;
  const zonaElimina = h('div', { class: 'riga' });
  const disegna = () =>
    zonaElimina.replaceChildren(
      chiedo
        ? h('div', { class: 'riga' },
            h('strong', {}, 'Sicuro? 🥺'),
            bottone('Sì, cancella', 'rosso', () => {
              elimina(data);
              vai({ nome: 'diario' });
            }),
            bottone('No, tienila', 'verde', () => {
              chiedo = false;
              disegna();
            }),
          )
        : bottone('🗑️ Cancella', 'secondario', () => {
            chiedo = true;
            disegna();
          }),
    );
  disegna();

  return h('section', { class: 'schermata' },
    h('header', { class: 'barra' }, bottone('‹', 'tondo', () => vai({ nome: 'diario' }), 'Indietro'), h('h1', {}, dataLeggibile(data))),
    h('div', { class: 'schede' },
      ...PARAMETRI.map((c) => {
        const v = a.valori[c.id];
        const stato = v === undefined ? undefined : statoDi(c.id, v);
        return h('article', { class: `scheda ${stato ?? 'vuota'}`, style: `--colore:${c.colore}` },
          h('header', {}, h('span', { class: 'emoji' }, c.emoji), h('h3', {}, c.nome)),
          h('div', { class: 'valore grande-valore' }, v === undefined ? '—' : `${formatta(v)} ${configDi(c.id).unita}`),
          h('p', { class: 'feedback' }, stato ? FACCINE[stato] : 'non misurato'),
        );
      }),
    ),
    h('footer', { class: 'piede' }, bottone('✏️ Modifica', 'grande', () => vai({ nome: 'nuova', data })), zonaElimina),
  );
}
