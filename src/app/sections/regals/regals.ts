import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Seccio, Sequencia } from '../../shared/sequencia/sequencia';

@Component({
  selector: 'app-regals',
  template: '<app-sequencia [dades]="dades" />',
  imports: [Sequencia],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Regals {
  protected readonly dades: Seccio = {
    id: 'regals',
    fons: 'paper',
    motiu: 'empremta',
    eyebrow: 'regals.eyebrow',
    titol: 'regals.titol',
    text: 'regals.text',

    // El botó porta al formulari amb «un record» ja triat, que és el
    // mateix que fa la targeta de regals de la secció «formes».
    cta: { text: 'regals.cta', intencio: 'moment-vital' },
    passos: [
      {
        etiqueta: 'regals.pas1.etiqueta',
        peu: 'regals.pas1.peu',
        imatge: 'regal-intencio',
        alt: 'regals.pas1.alt',
      },
      {
        etiqueta: 'regals.pas2.etiqueta',
        peu: 'regals.pas2.peu',
        imatge: 'regal-historia',
        alt: 'regals.pas2.alt',
      },
      {
        etiqueta: 'regals.pas3.etiqueta',
        peu: 'regals.pas3.peu',
        imatge: 'regal-obra',
        alt: 'regals.pas3.alt',
      },
    ],
    resum: 'regals.resum',
  };
}
