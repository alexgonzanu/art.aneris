import { Injectable } from '@angular/core';

/* La funció que envia el correu, servida des del mateix domini que la pàgina:
 * per això és una adreça relativa i no hi ha CORS pel mig. El codi és a
 * netlify/functions/contacte.mjs.
 */
const ENDPOINT = '/api/contacte';

export interface Missatge {
  readonly nom: string;
  readonly contacte: string;
  readonly tipus: string;

  /** L'etiqueta del desplegable ja traduïda: al correu hi ha de dir la frase. */
  readonly tipusText: string;

  readonly detalls: string;
  readonly data: string;
  readonly privacitat: boolean;

  /** En quin idioma s'ha omplert, per saber en quin s'ha de respondre. */
  readonly idioma: string;

  /** El camp esquer del formulari. Ha d'arribar sempre buit. */
  readonly web: string;
}

export type Resultat = 'enviat' | 'sense-configurar' | 'error';

/**
 * El transport del formulari.
 *
 * Viu fora del component perquè una cosa és el formulari —què es demana, què és
 * obligatori, què es diu quan falta— i una altra on va a parar. Així el
 * formulari es pot provar sense tocar la xarxa.
 */
@Injectable({ providedIn: 'root' })
export class Enviament {
  async envia(missatge: Missatge): Promise<Resultat> {
    // El camp esquer és invisible i no es pot tabular: una persona no l'omple
    // mai. Si arriba ple, és un robot: se li diu que tot ha anat bé i no
    // s'envia res. Aturar-lo aquí estalvia el viatge, però qui compta és la
    // mateixa comprovació a la funció: un robot que trobi l'adreça del POST no
    // passa per aquí.
    if (missatge.web) return 'enviat';

    try {
      // L'esquer sí que surt d'aquí: la funció l'ha de poder tornar a mirar.
      const resposta = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missatge),
      });

      if (resposta.ok) return 'enviat';

      /* Dues maneres que el correu no estigui llest, i totes dues volen el
       * mateix avís amable i no un error: el 404 és que no hi ha funció —un
       * «ng serve» pelat, sense «netlify dev»— i el 503, que hi és però li
       * falten les variables d'entorn.
       */
      if (resposta.status === 404 || resposta.status === 503) return 'sense-configurar';

      throw new Error(`El servidor ha respost ${resposta.status}`);
    } catch (error) {
      console.error(error);

      return 'error';
    }
  }
}
