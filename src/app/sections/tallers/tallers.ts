import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Intencio } from '../../shared/intencio';
import { Progres } from '../../shared/progres';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-tallers',
  templateUrl: './tallers.html',
  styleUrl: './tallers.scss',
  imports: [Reveal, Progres, Intencio, NgOptimizedImage, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tallers {}
