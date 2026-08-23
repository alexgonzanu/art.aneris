import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Calendari } from './calendari';
import { traduccionsDeProves } from '../traduccions-de-proves';

/* Un mínim fix deixa la prova sempre al mateix mes, passi quan passi. */
const MINIM = '2026-08-22';

describe('Calendari', () => {
  let fixture: ComponentFixture<Calendari>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calendari],
      providers: [traduccionsDeProves()],
    }).compileComponents();

    fixture = TestBed.createComponent(Calendari);
    fixture.componentRef.setInput('identificador', 'data');
    fixture.componentRef.setInput('minim', MINIM);
    await fixture.whenStable();

    el = fixture.nativeElement as HTMLElement;
  });

  const obre = async () => {
    el.querySelector<HTMLButtonElement>('.calendari__camp')?.click();
    await fixture.whenStable();
  };

  const dia = (iso: string) => el.querySelector<HTMLButtonElement>(`[data-dia="${iso}"]`);

  it('picks a day and hands the form an ISO date', async () => {
    let escrit: string | undefined;
    fixture.componentInstance.registerOnChange((valor) => (escrit = valor));

    await obre();
    expect(el.querySelector('[role="dialog"]')).not.toBeNull();

    dia('2026-08-25')?.click();
    await fixture.whenStable();

    expect(escrit).toBe('2026-08-25');
    expect(el.querySelector('[role="dialog"]')).toBeNull();
    expect(el.querySelector('.calendari__camp')?.textContent).toContain('25 d’agost del 2026');
  });

  it('does not let you choose a day that has already gone', async () => {
    await obre();

    expect(dia('2026-08-20')?.disabled).toBe(true);
    expect(dia('2026-08-22')?.disabled).toBe(false);
  });

  it('moves the roving focus with the arrow keys', async () => {
    await obre();

    expect(dia(MINIM)?.getAttribute('tabindex')).toBe('0');

    dia(MINIM)?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();

    // Una setmana més avall, i el 29 encara és d'agost.
    expect(dia('2026-08-29')?.getAttribute('tabindex')).toBe('0');
    expect(dia(MINIM)?.getAttribute('tabindex')).toBe('-1');
  });

  it('follows the focus into the next month when the week runs over', async () => {
    await obre();

    dia(MINIM)?.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }));
    await fixture.whenStable();

    expect(el.querySelector('.calendari__mes')?.textContent).toContain('setembre');
    expect(dia('2026-09-22')?.getAttribute('tabindex')).toBe('0');
  });

  it('lets you take the date back off', async () => {
    let escrit: string | undefined;

    fixture.componentInstance.writeValue('2026-09-10');
    fixture.componentInstance.registerOnChange((valor) => (escrit = valor));
    await fixture.whenStable();

    await obre();
    el.querySelector<HTMLButtonElement>('.calendari__esborra')?.click();
    await fixture.whenStable();

    expect(escrit).toBe('');
    expect(el.querySelector('.calendari__camp')?.textContent).toContain('Tria una data');
  });
});
