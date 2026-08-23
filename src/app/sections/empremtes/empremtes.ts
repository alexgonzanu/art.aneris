import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Seccio, Sequencia } from '../../shared/sequencia/sequencia';

@Component({
  selector: 'app-empremtes',
  template: '<app-sequencia [dades]="dades" />',
  imports: [Sequencia],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Empremtes {
  protected readonly dades: Seccio = {
    id: 'empremtes',
    fons: 'paper',
    motiu: 'empremta',
    eyebrow: 'empremtes.eyebrow',
    titol: 'empremtes.titol',
    text: 'empremtes.text',
    nota: 'empremtes.nota',
    cta: { text: 'empremtes.cta', intencio: 'moment-vital' },

    // Encara no hi ha fotografies de la col·lecció: els passos sense imatge es
    // veuen com una casella en espera.
    passos: [
      {
        etiqueta: 'empremtes.pas1.etiqueta',
        peu: 'empremtes.pas1.peu',
      },
      {
        etiqueta: 'empremtes.pas2.etiqueta',
        peu: 'empremtes.pas2.peu',
      },
      {
        etiqueta: 'empremtes.pas3.etiqueta',
        peu: 'empremtes.pas3.peu',
      },
    ],
    resum: 'empremtes.resum',
    segell: 'empremtes.segell',
  };
}
