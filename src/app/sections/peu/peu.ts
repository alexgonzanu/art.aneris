import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconaInstagram } from '../../shared/icona-instagram/icona-instagram';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-peu',
  templateUrl: './peu.html',
  styleUrl: './peu.scss',
  imports: [Reveal, IconaInstagram, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Peu {
  /** L'any del copyright, que al disseny de referència es posava des del JavaScript. */
  protected readonly any = new Date().getFullYear();
}
