import { h } from './dom';

const EMOJI = ['🐠', '🐟', '🫧', '⭐', '🐙', '🦀', '🐡', '✨'];

/** Pioggia di emoji e suono "bolla"; si chiude da sola. */
export function celebra(): Promise<void> {
  const strato = h('div', { class: 'celebrazione', 'aria-hidden': 'true' });
  for (let i = 0; i < 28; i++) {
    const e = h('span', { class: 'coriandolo' }, EMOJI[i % EMOJI.length]);
    e.style.left = `${Math.random() * 100}%`;
    e.style.animationDelay = `${Math.random() * 0.6}s`;
    e.style.fontSize = `${28 + Math.random() * 28}px`;
    strato.append(e);
  }
  strato.append(h('div', { class: 'bravo' }, 'Bravo Arik! 🎉'));
  document.body.append(strato);
  suono();
  return new Promise((ok) =>
    setTimeout(() => {
      strato.remove();
      ok();
    }, 1800),
  );
}

function suono(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [523, 659, 784].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.start(t);
      o.stop(t + 0.26);
    });
  } catch {
    /* audio non disponibile: nessun problema */
  }
}
