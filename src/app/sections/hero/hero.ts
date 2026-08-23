import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  imports: [NgOptimizedImage, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {}
