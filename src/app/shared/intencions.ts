import { Injectable, signal } from '@angular/core';

/** Els valors del desplegable «Què tens en ment?» del formulari. */
export const TIPUS = [
  'record-obra',
  'ruta',
  'moment-vital',
  'taller',
  'cocreacio',
  'altra',
] as const;

export type Tipus = (typeof TIPUS)[number];

interface Peticio {
  readonly tipus: Tipus;

  /** Cada petició porta el seu número perquè demanar dues vegades seguides el
   * mateix tipus continuï sent un canvi de senyal i el formulari se n'assabenti.
   */
  readonly num: number;
}

/**
 * Recull amb quina intenció s'ha arribat al formulari.
 *
 * Els botons repartits per la pàgina no són genèrics: qui clica «Vull venir a un
 * taller» ja ha dit què vol. Aquí es guarda l'última cosa demanada i el
 * formulari la recull per deixar el desplegable triat, de manera que no s'hagi
 * de tornar a respondre una pregunta que ja s'ha contestat clicant.
 */
@Injectable({ providedIn: 'root' })
export class Intencions {
  readonly darrera = signal<Peticio | null>(null);

  private num = 0;

  demana(tipus: Tipus): void {
    this.darrera.set({ tipus, num: ++this.num });
  }
}
