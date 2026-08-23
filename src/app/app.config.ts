import { IMAGE_CONFIG, IMAGE_LOADER } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AMPLADES, carregadorImatges } from './shared/imatges';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: IMAGE_LOADER, useValue: carregadorImatges },

    // Les amplades que pot demanar NgOptimizedImage són exactament les que
    // existeixen com a fitxer; qualsevol altra donaria un 404.
    { provide: IMAGE_CONFIG, useValue: { breakpoints: AMPLADES } },

    /* Els textos viuen a public/i18n/<idioma>.json i es demanen en arrencar.
     *
     * El català fa de llengua per defecte i també de reserva: si una clau
     * encara no està traduïda a un altre idioma, el que es veu és el text
     * català i no la clau pelada.
     */
    provideHttpClient(),
    provideTranslateService({
      lang: 'ca',
      fallbackLang: 'ca',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    }),
  ],
};
