import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.html',
  styleUrl: './galeria.scss',
  imports: [Reveal, NgOptimizedImage, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Galeria {}
