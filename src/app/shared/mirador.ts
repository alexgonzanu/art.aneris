import { Injectable, OnDestroy } from '@angular/core';

/**
 * Un sol lloc des d'on mirar l'scroll.
 *
 * Cada secció que s'anima amb el desplaçament necessita recalcular on és quan
 * la pàgina es mou. Si cadascuna es posés el seu propi listener, hi hauria mitja
 * dotzena de callbacks demanant la posició per separat a cada fotograma. Aquí
 * n'hi ha un de sol: qui vulgui saber-ho s'hi apunta i se'l crida un cop per
 * fotograma, dins del mateix requestAnimationFrame.
 */
@Injectable({ providedIn: 'root' })
export class Mirador implements OnDestroy {
  private readonly oients = new Set<() => void>();
  private peticio = 0;
  private escoltant = false;

  private readonly demana = () => {
    if (this.peticio) return;

    this.peticio = requestAnimationFrame(() => {
      this.peticio = 0;
      for (const oient of this.oients) oient();
    });
  };

  /** Apunta una funció al recompte i retorna com donar-se de baixa. */
  observa(oient: () => void): () => void {
    this.oients.add(oient);

    if (!this.escoltant) {
      window.addEventListener('scroll', this.demana, { passive: true });
      window.addEventListener('resize', this.demana, { passive: true });
      this.escoltant = true;
    }

    return () => {
      this.oients.delete(oient);

      if (this.oients.size === 0) this.atura();
    };
  }

  ngOnDestroy(): void {
    this.atura();
  }

  private atura(): void {
    if (!this.escoltant) return;

    window.removeEventListener('scroll', this.demana);
    window.removeEventListener('resize', this.demana);
    cancelAnimationFrame(this.peticio);
    this.peticio = 0;
    this.escoltant = false;
  }
}
