import { Provider } from '@angular/core';
import { TranslateLoader, TranslationObject, provideTranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import ca from '../../../public/i18n/ca.json';
import en from '../../../public/i18n/en.json';
import es from '../../../public/i18n/es.json';

/* Les proves fan servir els diccionaris de debò i no una còpia retallada: si
 * algú es deixa una clau en afegir un text, les proves ho han de notar igual
 * que ho notaria la pàgina. Arriben ja carregats i sense xarxa pel mig.
 */
class CarregadorDeProves extends TranslateLoader {
  getTranslation(idioma: string): Observable<TranslationObject> {
    const diccionaris: Record<string, unknown> = { ca, es, en };

    return of((diccionaris[idioma] ?? ca) as TranslationObject);
  }
}

/** El servei de traduccions llest per a un TestBed. */
export function traduccionsDeProves(): Provider[] {
  return provideTranslateService({
    lang: 'ca',
    fallbackLang: 'ca',
    loader: () => new CarregadorDeProves(),
  });
}
