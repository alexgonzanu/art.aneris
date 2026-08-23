import { ImageLoaderConfig } from '@angular/common';

/** Les amplades que genera `npm run imatges`. Han de coincidir amb el script. */
export const AMPLADES = [400, 800, 1200, 1600];

/**
 * Tradueix el nom d'una imatge a la mida que toca: `ngSrc="obra-bosc"` acaba
 * essent `/img/obra-bosc-800.webp` si el navegador demana 800 px d'amplada.
 *
 * Els originals viuen fora de `public/` i no es despleguen mai; aquí només hi
 * ha els WebP que en surten.
 */
export function carregadorImatges({ src, width }: ImageLoaderConfig): string {
  return `/img/${src}-${width ?? AMPLADES[AMPLADES.length - 1]}.webp`;
}
