import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** Botó flotant que torna al principi de la pàgina. */
@Component({
  selector: 'app-puja-amunt',
  templateUrl: './puja-amunt.html',
  styleUrl: './puja-amunt.scss',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PujaAmunt {
  protected puja(): void {
    // Sense demanar `behavior`, l'scroll segueix el `scroll-behavior` del CSS:
    // suau per defecte i instantani quan es demana moviment reduït.
    window.scrollTo({ top: 0 });
  }
}
