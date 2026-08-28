import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Intencio } from '../intencio';
import { Tipus } from '../intencions';
import { Progres } from '../progres';
import { Reveal } from '../reveal';

/* Els textos de la secció són claus del diccionari, no frases: qui les
 * tradueix és la plantilla. Així la secció es queda sent només dades i canviar
 * d'idioma no obliga a reconstruir-la.
 */

/** Un pas de la seqüència. Sense imatge, la casella queda en espera. */
export interface Pas {
  readonly etiqueta: string;
  readonly peu: string;
  readonly imatge?: string;
  readonly alt?: string;
}

export interface Seccio {
  readonly id: string;
  readonly eyebrow: string;
  readonly titol: string;
  readonly text: string;
  /** Opcional: no totes les seccions tenen una frase de tancament abans del botó. */
  readonly nota?: string;
  readonly cta: { readonly text: string; readonly intencio: Tipus };
  readonly passos: readonly Pas[];
  readonly resum: string;
  /** Opcional: el segell del final del plafó. */
  readonly segell?: string;

  /** El fons de la secció; el del plafó és sempre el contrari. */
  readonly fons: 'sand' | 'paper';

  /** El dibuix del fons: corbes de nivell d'un mapa o solcs d'una empremta. */
  readonly motiu: 'corbes' | 'empremta';
}

/**
 * Una història explicada en tres passos: text a l'esquerra i, a la dreta, la
 * línia del temps 01 → 02 → 03 que es va dibuixant amb l'scroll.
 *
 * És la forma de les rutes i dels regals, que són la mateixa secció amb
 * un altre contingut. Si un dia n'hi ha una tercera, només caldrà escriure'n
 * les dades.
 */
@Component({
  selector: 'app-sequencia',
  templateUrl: './sequencia.html',
  styleUrl: './sequencia.scss',
  imports: [NgOptimizedImage, Reveal, Progres, Intencio, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sequencia {
  readonly dades = input.required<Seccio>();
}
