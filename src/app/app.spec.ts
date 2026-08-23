import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { traduccionsDeProves } from './shared/traduccions-de-proves';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [traduccionsDeProves()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the hero headline', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Art que neix');
  });

  it('should render the four idea cards', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = [...compiled.querySelectorAll('.card__label')].map((el) => el.textContent);
    expect(labels).toEqual(['Un lloc', 'Una ruta', 'Un moment vital', 'Una sensació']);
  });

  it('preselects the form topic when arriving from a call to action', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLAnchorElement>('.tallers__cta')?.click();
    await fixture.whenStable();

    expect(compiled.querySelector('#tipus')?.textContent).toContain('Participar en un taller');
  });

  it('renders the three steps of both sequence sections', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const etiquetes = (seccio: string) =>
      [...compiled.querySelectorAll(`${seccio} .fita__etiqueta`)].map((el) =>
        el.textContent?.trim(),
      );

    expect(etiquetes('#rutes')).toEqual(['Ruta', 'Relleu i paisatge', 'Obra final']);
    expect(etiquetes('#empremtes')).toEqual(['Empremta', 'Relleu i matèria', 'Obra final']);
  });

  it('swaps the whole page over when another language is picked', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Art que neix');

    const angles = [...compiled.querySelectorAll<HTMLButtonElement>('.idiomes__opcio')].find(
      (boto) => boto.textContent?.trim() === 'en',
    );
    angles?.click();
    await fixture.whenStable();

    expect(compiled.querySelector('h1')?.textContent).toContain('Art born');

    // El text que viu a les dades d'una secció també ha de canviar.
    expect(compiled.querySelector('#rutes .fita__etiqueta')?.textContent?.trim()).toBe('Route');

    // I el lang del document, que és qui ho diu als lectors de pantalla.
    expect(document.documentElement.lang).toBe('en');
  });

  it('leaves no untranslated key on the page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    /* Una clau que el diccionari no té es veu tal qual: «galeria.titol» en
     * comptes de la frase. Es mira tros a tros i no el text sencer de la
     * pàgina, perquè de seguit el final d'una frase i el principi de la
     * següent formen parells amb punt al mig que semblen claus i no ho són.
     *
     * També s'hi miren els atributs que es diuen en veu alta: una alternativa
     * d'imatge sense traduir no es veu, però se sent.
     */
    const trossos: string[] = [];

    const camins = document.createTreeWalker(compiled, NodeFilter.SHOW_TEXT);
    while (camins.nextNode()) trossos.push(camins.currentNode.textContent ?? '');

    for (const el of compiled.querySelectorAll('[alt], [aria-label], [placeholder]')) {
      for (const atribut of ['alt', 'aria-label', 'placeholder']) {
        trossos.push(el.getAttribute(atribut) ?? '');
      }
    }

    // Una clau ocupa el tros sencer: paraules enganxades per punts, sense espais.
    const clau = /^[a-z][a-zA-Z]*(?:\.[a-zA-Z]+)+$/;
    const crues = trossos.map((t) => t.trim()).filter((t) => clau.test(t) && t !== 'art.aneris');

    expect(crues).toEqual([]);
  });
});
