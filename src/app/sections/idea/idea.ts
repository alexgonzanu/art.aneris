import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-idea',
  templateUrl: './idea.html',
  styleUrl: './idea.scss',
  imports: [Reveal, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Idea {}
