import { TestBed } from '@angular/core/testing';
import { Preguntes } from './preguntes';
import { traduccionsDeProves } from '../../shared/traduccions-de-proves';

describe('Preguntes', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Preguntes],
      providers: [traduccionsDeProves()],
    }).compileComponents();
  });

  it('opens and closes a question when its button is clicked', async () => {
    const fixture = TestBed.createComponent(Preguntes);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const boto = compiled.querySelector<HTMLButtonElement>('.pregunta__boto');

    expect(boto?.getAttribute('aria-expanded')).toBe('false');

    boto?.click();
    await fixture.whenStable();
    expect(boto?.getAttribute('aria-expanded')).toBe('true');

    boto?.click();
    await fixture.whenStable();
    expect(boto?.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps every answer reachable by its own button', async () => {
    const fixture = TestBed.createComponent(Preguntes);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const botons = [...compiled.querySelectorAll<HTMLButtonElement>('.pregunta__boto')];

    expect(botons.length).toBe(4);

    for (const boto of botons) {
      const resposta = compiled.querySelector(`#${boto.getAttribute('aria-controls')}`);
      expect(resposta).not.toBeNull();
    }
  });
});
