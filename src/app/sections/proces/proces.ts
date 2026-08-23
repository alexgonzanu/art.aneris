import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Progres } from '../../shared/progres';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-proces',
  templateUrl: './proces.html',
  styleUrl: './proces.scss',
  imports: [Reveal, Progres, NgOptimizedImage, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Proces {}
