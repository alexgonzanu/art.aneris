import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Contacte } from './sections/contacte/contacte';
import { Formes } from './sections/formes/formes';
import { Galeria } from './sections/galeria/galeria';
import { Hero } from './sections/hero/hero';
import { Idea } from './sections/idea/idea';
import { Peu } from './sections/peu/peu';
import { Preguntes } from './sections/preguntes/preguntes';
import { Proces } from './sections/proces/proces';
import { Regals } from './sections/regals/regals';
import { Rutes } from './sections/rutes/rutes';
import { SiteHeader } from './sections/site-header/site-header';
import { Tallers } from './sections/tallers/tallers';
import { Idiomes } from './shared/idioma';
import { PujaAmunt } from './shared/puja-amunt/puja-amunt';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    SiteHeader,
    Hero,
    Idea,
    Galeria,
    Formes,
    Proces,
    Rutes,
    Regals,
    Tallers,
    Contacte,
    Preguntes,
    Peu,
    PujaAmunt,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /* L'arrel és qui posa en marxa el servei d'idioma. No li demana res: només
   * cal que existeixi des del primer moment perquè mantingui el lang del
   * document a to amb el que es llegeix.
   */
  private readonly idiomes = inject(Idiomes);
}
