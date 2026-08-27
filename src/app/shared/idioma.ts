import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const IDIOMES = ['ca', 'es', 'en'] as const;

export type Idioma = (typeof IDIOMES)[number];

/** El primer de la llista és el de sortida i el de reserva. */
export const IDIOMA_PER_DEFECTE: Idioma = IDIOMES[0];

/**
 * Quin idioma es veu.
 *
 * ngx-translate ja porta el gruix de la feina —quins textos hi ha carregats i
 * quin idioma és l'actiu—, així que això només hi posa el que necessita la
 * pàgina i la llibreria no sap: la llista tancada d'idiomes que existeixen de
 * debò, i mantenir l'atribut lang del document a to amb el que es llegeix.
 */
@Injectable({ providedIn: 'root' })
export class Idiomes {
  readonly disponibles = IDIOMES;

  private readonly traduccions = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  /** L'idioma actiu, ja acotat als que existeixen. */
  readonly actual = computed<Idioma>(() => {
    const lang = this.traduccions.currentLang();

    return IDIOMES.find((idioma) => idioma === lang) ?? IDIOMA_PER_DEFECTE;
  });

  constructor() {
    /* El lang del document ha d'anar amb el que es veu: és el que fa servir el
     * navegador per partir mots i el lector de pantalla per triar la veu. Es
     * queda aquí i no a l'index.html perquè ara pot canviar en calent.
     */
    effect(() => {
      this.document.documentElement.lang = this.actual();
    });
  }

  canvia(idioma: Idioma): void {
    if (idioma === this.actual()) return;

    this.traduccions.use(idioma);
  }
}
