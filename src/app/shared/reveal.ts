import {
  Directive,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

/**
 * Fa aparèixer l'element quan entra a la vista, com el IntersectionObserver del
 * disseny de referència (llindar 0.12, un sol cop per element).
 *
 * El valor opcional és un retard en mil·lisegons, per encadenar l'aparició de
 * diversos elements: `[appReveal]="90"`.
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal' },
})
export class Reveal implements OnDestroy {
  readonly appReveal = input(0, { transform: (valor: unknown) => numberAttribute(valor, 0) });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;

      // Sense suport d'IntersectionObserver, mostrem el contingut directament.
      if (typeof IntersectionObserver === 'undefined') {
        el.classList.add('reveal--visible');
        return;
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            this.observer?.unobserve(entry.target);
            this.mostra(entry.target as HTMLElement);
          }
        },
        { threshold: 0.12 },
      );

      this.observer.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private mostra(el: HTMLElement): void {
    const retard = this.appReveal();

    if (retard > 0) {
      el.style.transitionDelay = `${retard}ms`;

      // El retard només serveix per a l'entrada: si es quedés posat, el hover
      // de la targeta també trigaria a respondre.
      el.addEventListener(
        'transitionend',
        () => {
          el.style.transitionDelay = '';
        },
        { once: true },
      );
    }

    el.classList.add('reveal--visible');
  }
}
