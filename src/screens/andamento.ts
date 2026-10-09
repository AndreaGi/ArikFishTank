import { PARAMETRI } from '../model';
import { tutte } from '../storage';
import { grafico } from '../ui/chart';
import { bottone, h } from '../ui/dom';
import type { Vai } from '../main';

export function andamento(vai: Vai): HTMLElement {
  const analisi = tutte();
  return h('section', { class: 'schermata' },
    h('header', { class: 'barra' }, bottone('‹', 'tondo', () => vai({ nome: 'diario' }), 'Indietro'), h('h1', {}, 'Andamento')),
    h('p', { class: 'avviso' }, 'La fascia verde è la zona dove i pesci stanno bene 💚'),
    h('div', { class: 'schede grafici' },
      ...PARAMETRI.map((c) =>
        h('article', { class: 'scheda grafico-scheda', style: `--colore:${c.colore}` },
          h('header', {}, h('span', { class: 'emoji' }, c.emoji), h('h3', {}, c.nome)),
          grafico(c, analisi) as unknown as Node,
        ),
      ),
    ),
  );
}
