import { Directive, inject, input } from '@angular/core';
import { Intencions, Tipus } from './intencions';

/**
 * Marca un enllaç cap al formulari amb el que ve a demanar, perquè el
 * desplegable «Què tens en ment?» hi arribi ja triat: `appIntencio="taller"`.
 */
@Directive({
  selector: '[appIntencio]',
  host: { '(click)': 'demana()' },
})
export class Intencio {
  readonly appIntencio = input.required<Tipus>();

  private readonly intencions = inject(Intencions);

  protected demana(): void {
    this.intencions.demana(this.appIntencio());
  }
}
