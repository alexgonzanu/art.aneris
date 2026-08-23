import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Seccio, Sequencia } from '../../shared/sequencia/sequencia';

@Component({
  selector: 'app-rutes',
  template: '<app-sequencia [dades]="dades" />',
  imports: [Sequencia],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rutes {
  protected readonly dades: Seccio = {
    id: 'rutes',
    fons: 'sand',
    motiu: 'corbes',
    eyebrow: 'rutes.eyebrow',
    titol: 'rutes.titol',
    text: 'rutes.text',
    nota: 'rutes.nota',
    cta: { text: 'rutes.cta', intencio: 'ruta' },
    passos: [
      {
        etiqueta: 'rutes.pas1.etiqueta',
        peu: 'rutes.pas1.peu',
        imatge: 'ruta-mapa-tracat',
        alt: 'rutes.pas1.alt',
      },
      {
        etiqueta: 'rutes.pas2.etiqueta',
        peu: 'rutes.pas2.peu',
        imatge: 'ruta-relleu-paisatge',
        alt: 'rutes.pas2.alt',
      },
      {
        etiqueta: 'rutes.pas3.etiqueta',
        peu: 'rutes.pas3.peu',
        imatge: 'ruta-obra-final',
        alt: 'rutes.pas3.alt',
      },
    ],
    resum: 'rutes.resum',
    segell: 'rutes.segell',
  };
}
