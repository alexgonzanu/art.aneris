import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Intencio } from '../../shared/intencio';
import { Progres } from '../../shared/progres';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-formes',
  templateUrl: './formes.html',
  styleUrl: './formes.scss',
  imports: [Reveal, Progres, Intencio, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Formes {}
