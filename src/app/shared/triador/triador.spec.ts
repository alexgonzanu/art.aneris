import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Opcio, Triador } from './triador';
import { traduccionsDeProves } from '../traduccions-de-proves';

/* Claus de debò del diccionari: així la prova també comprova que el que es
 * veu surti traduït i no la clau pelada.
 */
const OPCIONS: readonly Opcio[] = [
  { valor: 'ruta', text: 'contacte.tipus.ruta' },
  { valor: 'taller', text: 'contacte.tipus.taller' },
  { valor: 'altra', text: 'contacte.tipus.altra' },
];

describe('Triador', () => {
  let fixture: ComponentFixture<Triador>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Triador],
      providers: [traduccionsDeProves()],
    }).compileComponents();

    fixture = TestBed.createComponent(Triador);
    fixture.componentRef.setInput('identificador', 'tipus');
    fixture.componentRef.setInput('opcions', OPCIONS);
    await fixture.whenStable();

    el = fixture.nativeElement as HTMLElement;
  });

  const camp = () => el.querySelector<HTMLButtonElement>('.triador__camp');

  const obre = async () => {
    camp()?.click();
    await fixture.whenStable();
  };

  const tecla = async (key: string) => {
    camp()?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await fixture.whenStable();
  };

  const opcio = (valor: string) => el.querySelector<HTMLElement>(`[data-valor="${valor}"]`);

  it('shows the placeholder until something is picked', () => {
    expect(camp()?.textContent).toContain('Selecciona una opció');
    expect(camp()?.classList).toContain('triador__camp--buit');
  });

  it('picks an option and hands the form its value', async () => {
    let escrit: string | undefined;
    fixture.componentInstance.registerOnChange((valor) => (escrit = valor));

    await obre();
    expect(el.querySelector('[role="listbox"]')).not.toBeNull();

    opcio('taller')?.click();
    await fixture.whenStable();

    expect(escrit).toBe('taller');
    expect(el.querySelector('[role="listbox"]')).toBeNull();
    expect(camp()?.textContent).toContain('Participar en un taller');
  });

  it('opens on the arrow keys and picks with Enter', async () => {
    let escrit: string | undefined;
    fixture.componentInstance.registerOnChange((valor) => (escrit = valor));

    await tecla('ArrowDown');
    expect(el.querySelector('[role="listbox"]')).not.toBeNull();

    // S'obre per la primera i baixa una: la segona de la llista.
    await tecla('ArrowDown');
    expect(camp()?.getAttribute('aria-activedescendant')).toBe('tipus-taller');

    await tecla('Enter');
    expect(escrit).toBe('taller');
  });

  it('jumps to the option that starts with the letter typed', async () => {
    await obre();

    // Busca pel text que es veu —«Una altra idea»— i no per la clau.
    await tecla('u');

    expect(camp()?.getAttribute('aria-activedescendant')).toBe('tipus-altra');
  });

  it('does not run off either end of the list', async () => {
    await obre();

    await tecla('ArrowUp');
    expect(camp()?.getAttribute('aria-activedescendant')).toBe('tipus-ruta');

    await tecla('End');
    await tecla('ArrowDown');
    expect(camp()?.getAttribute('aria-activedescendant')).toBe('tipus-altra');
  });

  it('closes on Escape without picking anything', async () => {
    let escrit: string | undefined;
    fixture.componentInstance.registerOnChange((valor) => (escrit = valor));

    await obre();
    await tecla('Escape');

    expect(el.querySelector('[role="listbox"]')).toBeNull();
    expect(escrit).toBeUndefined();
  });

  it('marks the option the form already carries', async () => {
    fixture.componentInstance.writeValue('altra');
    await fixture.whenStable();

    expect(camp()?.textContent).toContain('Una altra idea');

    await obre();

    expect(opcio('altra')?.getAttribute('aria-selected')).toBe('true');
    expect(opcio('ruta')?.getAttribute('aria-selected')).toBe('false');

    // S'obre per la que ja hi ha triada, no per la primera.
    expect(camp()?.getAttribute('aria-activedescendant')).toBe('tipus-altra');
  });
});
