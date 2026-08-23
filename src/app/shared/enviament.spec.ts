import type { MockInstance } from 'vitest';
import { Enviament, Missatge, Resultat } from './enviament';

/** Un missatge vàlid qualsevol; cada prova canvia el que li interessa. */
function missatge(canvis: Partial<Missatge> = {}): Missatge {
  return {
    nom: 'Alex',
    contacte: 'alex@example.com',
    tipus: 'taller',
    tipusText: 'Participar en un taller',
    detalls: 'Una ruta al Montseny.',
    data: '',
    privacitat: true,
    idioma: 'ca',
    web: '',
    ...canvis,
  };
}

describe('Enviament', () => {
  let enviament: Enviament;
  let peticions: MockInstance<typeof fetch>;

  beforeEach(() => {
    enviament = new Enviament();
    peticions = vi.spyOn(globalThis, 'fetch');

    // El servei deixa constància dels errors; les proves no els han de cridar.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not call anywhere when the honeypot arrives filled', async () => {
    const resultat = await enviament.envia(missatge({ web: 'https://spam.example' }));

    // Se li diu que tot ha anat bé perquè no ho torni a provar d’una altra manera.
    expect(resultat).toBe('enviat');
    expect(peticions).not.toHaveBeenCalled();
  });

  it('sends the honeypot along so the function can check it too', async () => {
    peticions.mockResolvedValue(new Response('{}', { status: 200 }));

    expect(await enviament.envia(missatge())).toBe('enviat');

    const [, opcions] = peticions.mock.calls[0];
    const cos = JSON.parse(String(opcions?.body)) as Missatge;

    expect(cos.web).toBe('');
    expect(cos.tipusText).toBe('Participar en un taller');
  });

  /* Les dues maneres que el correu no estigui llest volen el mateix avís
   * amable: el 404 és que no hi ha funció i el 503, que li falta la configuració.
   */
  it.each([
    [404, 'sense-configurar'],
    [503, 'sense-configurar'],
    [500, 'error'],
  ])('turns a %i into «%s»', async (estat, espera) => {
    peticions.mockResolvedValue(new Response('{}', { status: estat as number }));

    expect(await enviament.envia(missatge())).toBe(espera as Resultat);
  });

  it('reports an error when the request cannot even be made', async () => {
    peticions.mockRejectedValue(new Error('sense xarxa'));

    expect(await enviament.envia(missatge())).toBe('error');
  });
});
