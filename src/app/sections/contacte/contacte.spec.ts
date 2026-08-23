import { TestBed } from '@angular/core/testing';
import { Contacte } from './contacte';
import { Enviament, Missatge, Resultat } from '../../shared/enviament';
import { traduccionsDeProves } from '../../shared/traduccions-de-proves';

interface Fixture {
  whenStable(): Promise<unknown>;
}

/**
 * Un transport de mentida: no toca la xarxa, respon el que li manin i guarda
 * què li han donat. El que fa el de debò amb el missatge es prova a part, a
 * enviament.spec.ts; aquí només importa què en fa el formulari.
 */
class EnviamentDeProves {
  resultat: Resultat = 'enviat';
  readonly enviats: Missatge[] = [];

  envia(missatge: Missatge): Promise<Resultat> {
    this.enviats.push(missatge);

    return Promise.resolve(this.resultat);
  }
}

/** Envia el formulari com ho faria el navegador en clicar el botó. */
async function envia(compiled: HTMLElement, fixture: Fixture) {
  compiled.querySelector('form')?.dispatchEvent(new Event('submit'));
  await fixture.whenStable();
}

/** Tria una opció del desplegable obrint-lo i clicant-la, com el ratolí. */
async function tria(compiled: HTMLElement, valor: string, fixture: Fixture) {
  compiled.querySelector<HTMLButtonElement>('#tipus')?.click();
  await fixture.whenStable();

  const opcio = compiled.querySelector<HTMLElement>(`[data-valor="${valor}"]`);
  if (!opcio) throw new Error(`no hi ha l’opció ${valor}`);

  opcio.click();
  await fixture.whenStable();
}

/** Omple el formulari amb una resposta vàlida, com ho faria una persona. */
async function omple(compiled: HTMLElement, fixture: Fixture, extres: Record<string, string> = {}) {
  const escriu = (selector: string, valor: string) => {
    const camp = compiled.querySelector<HTMLInputElement>(selector);
    if (!camp) throw new Error(`no hi ha ${selector}`);
    camp.value = valor;
    camp.dispatchEvent(new Event('input'));
    camp.dispatchEvent(new Event('change'));
  };

  escriu('#nom', 'Alex');
  escriu('#contacte-directe', 'alex@example.com');
  escriu('#detalls', 'Una ruta al Montseny.');

  for (const [selector, valor] of Object.entries(extres)) escriu(selector, valor);

  await tria(compiled, 'taller', fixture);

  const privacitat = compiled.querySelector<HTMLInputElement>('.consentiment__marca');
  if (privacitat) {
    privacitat.checked = true;
    privacitat.dispatchEvent(new Event('change'));
  }

  await fixture.whenStable();
}

describe('Contacte', () => {
  let transport: EnviamentDeProves;

  beforeEach(async () => {
    transport = new EnviamentDeProves();

    await TestBed.configureTestingModule({
      imports: [Contacte],
      providers: [traduccionsDeProves(), { provide: Enviament, useValue: transport }],
    }).compileComponents();
  });

  it('complains about the empty required fields instead of sending', async () => {
    const fixture = TestBed.createComponent(Contacte);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    await envia(compiled, fixture);

    expect(compiled.querySelectorAll('.camp__avis').length).toBeGreaterThan(0);
    expect(compiled.querySelector('#nom')?.getAttribute('aria-invalid')).toBe('true');
    expect(transport.enviats).toHaveLength(0);
  });

  it('thanks and empties the form when the message goes through', async () => {
    const fixture = TestBed.createComponent(Contacte);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    await omple(compiled, fixture);
    await envia(compiled, fixture);

    expect(compiled.querySelector('.contacte__estat')?.getAttribute('data-to')).toBe('fet');
    expect(compiled.querySelector<HTMLInputElement>('#nom')?.value).toBe('');
  });

  /* El correu l'ha de llegir una persona: hi ha de dir la frase del desplegable
   * i no el valor pelat que fa servir el codi.
   */
  it('hands over the readable label of the dropdown and the language', async () => {
    const fixture = TestBed.createComponent(Contacte);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    await omple(compiled, fixture);
    await envia(compiled, fixture);

    expect(transport.enviats[0]).toMatchObject({
      nom: 'Alex',
      tipus: 'taller',
      tipusText: 'Participar en un taller',
      idioma: 'ca',
    });
  });

  it.each([
    ['sense-configurar', 'avis'],
    ['error', 'error'],
  ])('shows the «%s» notice as a %s', async (resultat, to) => {
    transport.resultat = resultat as Resultat;

    const fixture = TestBed.createComponent(Contacte);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    await omple(compiled, fixture);
    await envia(compiled, fixture);

    const avis = compiled.querySelector('.contacte__estat');

    expect(avis?.getAttribute('data-to')).toBe(to);
    expect(avis?.textContent?.trim()).not.toBe('');

    // El que ha escrit no es perd: només es buida quan ha arribat.
    expect(compiled.querySelector<HTMLInputElement>('#nom')?.value).toBe('Alex');
  });

  it('sends the focus to the first field that fails and says why', async () => {
    const fixture = TestBed.createComponent(Contacte);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    document.body.appendChild(compiled);

    await envia(compiled, fixture);

    const nom = compiled.querySelector<HTMLInputElement>('#nom');
    expect(document.activeElement).toBe(nom);
    expect(nom?.getAttribute('aria-describedby')).toBe('avis-nom');
    expect(compiled.querySelector('#avis-nom')).not.toBeNull();
  });

  it('keeps the live region in the page before there is anything to announce', async () => {
    const fixture = TestBed.createComponent(Contacte);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[role="status"]')).not.toBeNull();
    expect(compiled.querySelector('.contacte__estat')).toBeNull();
  });

  /* Qui decideix no enviar res quan l'esquer arriba ple és el transport, i té
   * la seva prova a part. El formulari ha de fer la seva: donar-l'hi tal com
   * ha arribat, sense filtrar-lo pel camí.
   */
  it('passes the honeypot on untouched instead of quietly dropping it', async () => {
    const fixture = TestBed.createComponent(Contacte);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector<HTMLInputElement>('#web')).not.toBeNull();

    // Un robot omple tots els camps, també el que no hauria de veure.
    await omple(compiled, fixture, { '#web': 'https://spam.example' });
    await envia(compiled, fixture);

    expect(transport.enviats[0].web).toBe('https://spam.example');
  });
});
