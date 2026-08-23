import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * La icona d'Instagram. Va dibuixada aquí i no com a imatge perquè agafi el
 * color del text que l'envolta i no pesi cap petició.
 *
 * La mida i el color els posa qui la fa servir, estilant `app-icona-instagram`.
 */
@Component({
  selector: 'app-icona-instagram',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: 1.15rem;
      height: 1.15rem;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconaInstagram {}
