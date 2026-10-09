import { esporta, importa } from '../storage';
import { bottone, h } from '../ui/dom';
import type { Vai } from '../main';

export function home(vai: Vai): HTMLElement {
  const messaggio = h('p', { class: 'avviso', role: 'status' });

  const scarica = () => {
    const url = URL.createObjectURL(new Blob([esporta()], { type: 'application/json' }));
    const a = h('a', { href: url, download: `arik-fish-tank-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const file = h('input', {
    type: 'file',
    accept: 'application/json',
    hidden: '',
    onchange: async (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (!f) return;
      try {
        messaggio.textContent = `Importate ${importa(await f.text())} analisi ✅`;
      } catch {
        messaggio.textContent = 'File non valido 😕';
      }
    },
  });

  return h('section', { class: 'schermata home' },
    h('div', { class: 'pesci', 'aria-hidden': 'true' }, h('span', { class: 'pesce p1' }, '🐠'), h('span', { class: 'pesce p2' }, '🐟'), h('span', { class: 'pesce p3' }, '🐡')),
    h('h1', { class: 'titolo' }, 'Arik Fish Tank'),
    h('p', { class: 'sottotitolo' }, "Il diario dell'acquario di Arik"),
    h('div', { class: 'menu' },
      bottone('➕ Nuova analisi', 'enorme', () => vai({ nome: 'nuova' })),
      bottone('📖 Il mio diario', 'enorme azzurro', () => vai({ nome: 'diario' })),
    ),
    messaggio,
    h('footer', { class: 'backup' }, bottone('💾 Salva backup', 'piccolo-testo', scarica), bottone('📂 Carica backup', 'piccolo-testo', () => file.click()), file),
  );
}
