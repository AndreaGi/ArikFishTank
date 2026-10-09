import './style.css';
import { andamento } from './screens/andamento';
import { dettaglio, diario } from './screens/diario';
import { home } from './screens/home';
import { nuova } from './screens/nuova';

export type Schermata =
  | { nome: 'home' }
  | { nome: 'nuova'; data?: string }
  | { nome: 'diario' }
  | { nome: 'dettaglio'; data: string }
  | { nome: 'andamento' };
export type Vai = (s: Schermata) => void;

const radice = document.getElementById('app')!;

const vai: Vai = (s) => {
  const vista =
    s.nome === 'nuova' ? nuova(vai, s.data)
    : s.nome === 'diario' ? diario(vai)
    : s.nome === 'dettaglio' ? dettaglio(vai, s.data)
    : s.nome === 'andamento' ? andamento(vai)
    : home(vai);
  radice.replaceChildren(vista);
  window.scrollTo(0, 0);
};

// bolle decorative di sfondo
const bolle = document.querySelector('.bubbles')!;
for (let i = 0; i < 14; i++) {
  const b = document.createElement('i');
  b.style.left = `${Math.random() * 100}%`;
  b.style.width = b.style.height = `${10 + Math.random() * 26}px`;
  b.style.animationDuration = `${8 + Math.random() * 10}s`;
  b.style.animationDelay = `${-Math.random() * 12}s`;
  bolle.append(b);
}

vai({ nome: 'home' });
