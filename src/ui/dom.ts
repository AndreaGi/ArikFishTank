type Figli = (Node | string | null | undefined | false)[];

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | ((e: Event) => void) | undefined> = {},
  ...figli: Figli
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined) continue;
    if (typeof v === 'function') el.addEventListener(k.replace(/^on/, ''), v);
    else el.setAttribute(k, v);
  }
  for (const f of figli) if (f) el.append(f);
  return el;
}

export function bottone(testo: string, classe: string, onclick: () => void, etichetta?: string): HTMLButtonElement {
  return h('button', { type: 'button', class: `btn ${classe}`, onclick: () => onclick(), 'aria-label': etichetta }, testo);
}
