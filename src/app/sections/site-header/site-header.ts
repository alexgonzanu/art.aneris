import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Idioma, Idiomes } from '../../shared/idioma';

/** L'etiqueta és una clau del diccionari; qui la tradueix és la plantilla. */
interface NavLink {
  readonly href: string;
  readonly label: string;
}

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  imports: [TranslatePipe],

  // Amb el menú obert, Escape l'ha de tancar: és per on se surt de qualsevol
  // cosa que s'obre a sobre de la pàgina.
  host: { '(document:keydown.escape)': 'closeMenu()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  protected readonly links: readonly NavLink[] = [
    { href: '#idea', label: 'capcalera.idea' },
    { href: '#com-funciona', label: 'capcalera.comFunciona' },
    { href: '#rutes', label: 'capcalera.rutes' },
    { href: '#regals', label: 'capcalera.regals' },
    { href: '#tallers', label: 'capcalera.tallers' },
  ];

  protected readonly menuOpen = signal(false);

  private readonly idiomes = inject(Idiomes);

  protected readonly disponibles = this.idiomes.disponibles;
  protected readonly idiomaActual = this.idiomes.actual;

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected canviaIdioma(idioma: Idioma): void {
    this.idiomes.canvia(idioma);
    this.closeMenu();
  }
}
