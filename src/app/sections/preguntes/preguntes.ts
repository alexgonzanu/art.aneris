import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Progres } from '../../shared/progres';
import { Reveal } from '../../shared/reveal';

/** Cada pregunta és un parell de claus del diccionari; les tradueix la plantilla. */
interface Pregunta {
  readonly id: string;
  readonly questio: string;
  readonly resposta: string;
}

@Component({
  selector: 'app-preguntes',
  templateUrl: './preguntes.html',
  styleUrl: './preguntes.scss',
  imports: [Reveal, Progres, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Preguntes {
  protected readonly preguntes: readonly Pregunta[] = [
    {
      id: 'idea-clara',
      questio: 'preguntes.ideaClara.questio',
      resposta: 'preguntes.ideaClara.resposta',
    },
    {
      id: 'encarrec',
      questio: 'preguntes.encarrec.questio',
      resposta: 'preguntes.encarrec.resposta',
    },
    {
      id: 'preu',
      questio: 'preguntes.preu.questio',
      resposta: 'preguntes.preu.resposta',
    },
    {
      id: 'termini',
      questio: 'preguntes.termini.questio',
      resposta: 'preguntes.termini.resposta',
    },
    {
      id: 'strava',
      questio: 'preguntes.strava.questio',
      resposta: 'preguntes.strava.resposta',
    },
    {
      id: 'regal',
      questio: 'preguntes.regal.questio',
      resposta: 'preguntes.regal.resposta',
    },
    {
      id: 'tallers',
      questio: 'preguntes.tallers.questio',
      resposta: 'preguntes.tallers.resposta',
    },
  ];

  /* Cada pregunta va pel seu compte: se'n poden tenir diverses obertes alhora,
   * com al disseny de referència.
   */
  private readonly obertes = signal<ReadonlySet<number>>(new Set());

  protected esOberta(i: number): boolean {
    return this.obertes().has(i);
  }

  protected commuta(i: number): void {
    this.obertes.update((obertes) => {
      const seguent = new Set(obertes);

      if (!seguent.delete(i)) seguent.add(i);

      return seguent;
    });
  }
}
