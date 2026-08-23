# ArtAneris

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Imatges i tipografies

Els originals de les fotografies viuen a `imatges/` i **no es despleguen**. De cada
un en surten quatre WebP a `public/img/` (400, 800, 1200 i 1600 px) més la imatge
social en JPEG, que és el que serveix la pàgina:

```bash
npm run imatges
```

Es genera sol abans de `npm run build` i de `npm start`, i només refà el que ha
canviat. Per afegir una fotografia, deixa-la a `imatges/` i fes-la servir pel seu
nom sense extensió: `<img ngSrc=nom-del-fitxer fill sizes=... />`. Si canvies
les amplades, canvia-les també a `IMAGE_CONFIG` (src/app/app.config.ts): Angular
només pot demanar mides que existeixin com a fitxer.

Les tipografies es serveixen des del mateix domini, no des del CDN de Google. Es
baixen amb `node scripts/fonts.mjs`, que també reescriu `src/_fonts.scss`.

## Formulari de contacte

El formulari fa un POST a `/api/contacte`, que és la funció de
`netlify/functions/contacte.mjs`. La funció mira que el que arriba tingui sentit
i el fa arribar per correu amb [Nodemailer](https://nodemailer.com), parlant amb
l'SMTP d'una bústia que ja existeix: no hi ha cap servei d'enviament contractat.

Com que la funció se serveix des del mateix domini que la pàgina, l'adreça és
relativa i no hi ha CORS enlloc.

### Variables d'entorn

Van al panell de Netlify i **mai al repositori**. Sense alguna d'elles la funció
respon un 503 i el formulari ensenya l'avís amable amb l'Instagram, no un error.

| Variable       | Exemple                     |                                                                                                                            |
| -------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `SMTP_HOST`    | `smtp.gmail.com`            |                                                                                                                            |
| `SMTP_PORT`    | `465`                       | el 465 xifra des del primer byte; el 587 puja a TLS pel camí                                                               |
| `SMTP_USER`    | l'adreça de la bústia       | també fa de remitent                                                                                                       |
| `SMTP_PASS`    | contrasenya d'aplicació     | **no** la del correu; a Gmail cal tenir la verificació en dos passos activada i fer-la a myaccount.google.com/apppasswords |
| `CORREU_DESTI` | on han d'arribar els avisos |                                                                                                                            |

### En local

`npm start` només aixeca la pàgina: la funció no hi és i el formulari, en enviar,
ensenya l'avís de sense configurar. Per provar-ho de debò cal
`npx netlify dev`, que aixeca la pàgina i la funció al mateix port, i un `.env`
a l'arrel amb les cinc variables (ja és al `.gitignore`).

### L'spam

El formulari porta un camp esquer: si arriba ple, es diu que tot ha anat bé i no
s'envia res. La comprovació es fa dues vegades i a propòsit —al navegador, que
estalvia el viatge, i a la funció, que és l'única que compta— perquè un robot
que trobi l'adreça del POST no passa pel navegador. La funció també torna a mirar
els camps obligatoris i el consentiment, i talla el que sigui massa llarg.

El límit de peticions per IP encara no hi és: si algun dia apareix spam dirigit,
el lloc de posar-lo és la mateixa funció, amb un comptador a Netlify Blobs.
