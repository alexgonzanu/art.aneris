import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { Mirador } from './mirador';

/**
 * Escriu a l'element la variable CSS `--progres`, de 0 a 1, segons com avança
 * pel viewport: 0 quan entra per baix i 1 quan se'n veu el final.
 *
 * Serveix per lligar una animació a l'scroll sense retenir-lo. Qui mou el temps
 * és el dit de qui llegeix, no un temporitzador, i tota la coreografia queda al
 * CSS derivant-la d'aquest únic número.
 *
 * Compte: mesura el recorregut d'un bloc que travessa la pantalla. Un bloc que
 * no arriba a travessar-la mai —el peu de pàgina, sense res a sota— es quedaria
 * a mig camí per sempre; per a aquests casos hi ha appReveal.
 */
@Directive({
  selector: '[appProgres]',
})
export class Progres implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly mirador = inject(Mirador);
  private baixa?: () => void;

  constructor() {
    // La variable està registrada amb valor inicial 1, de manera que si aquest
    // codi no arriba a executar-se mai la secció es veu sencera. Per això la
    // posem a 0 aquí, abans del primer pintat, i no al revés.
    this.escriu(0);

    afterNextRender(() => {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        this.escriu(1);
        return;
      }

      this.calcula();
      this.baixa = this.mirador.observa(() => this.calcula());
    });
  }

  ngOnDestroy(): void {
    this.baixa?.();
  }

  private calcula(): void {
    const marc = this.host.nativeElement.getBoundingClientRect();
    const finestra = window.innerHeight;

    // El recorregut es mesura sobre l'alçada del propi bloc: així s'omple just
    // quan el final del bloc arriba a la part baixa de la pantalla, tant si és
    // la fila curta de l'escriptori com la columna llarga del mòbil.
    const inici = finestra * 0.88;
    const recorregut = Math.max(marc.height + finestra * 0.03, finestra * 0.4);

    this.escriu(Math.min(Math.max((inici - marc.top) / recorregut, 0), 1));
  }

  private escriu(valor: number): void {
    this.host.nativeElement.style.setProperty('--progres', valor.toFixed(3));
  }
}
