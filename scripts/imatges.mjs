/* Converteix els originals de `imatges/` a WebP en diverses amplades dins de
 * `public/img/`.
 *
 * Els originals no es despleguen: són fotografies de 1000 a 1500 px de costat i
 * fins a 4 MB, i el hero era la primera cosa que es descarregava. Aquí surten
 * les mides que serveix el navegador, i el carregador d'imatges de l'aplicació
 * (src/app/shared/imatges.ts) és qui tria quina toca a cada pantalla.
 *
 * Les amplades han de ser exactament les mateixes que `IMAGE_CONFIG.breakpoints`
 * a app.config.ts: Angular demana una d'aquestes i el fitxer ha d'existir.
 *
 *   npm run imatges
 */
import { readdir, stat, mkdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const ORIGEN = 'imatges';
const DESTI = 'public/img';
const AMPLADES = [400, 800, 1200, 1600];

/* La imatge de previsualització en compartir l'enllaç. Va en JPEG i no en WebP
 * perquè alguns robots de xarxes socials encara no el llegeixen. */
const SOCIAL = { origen: 'hero-obra-granats.png', desti: 'social.jpg', amplada: 1200 };
const QUALITAT = 78;

async function esVella(desti, origen) {
  try {
    const [d, o] = await Promise.all([stat(desti), stat(origen)]);
    return d.mtimeMs < o.mtimeMs;
  } catch {
    return true; // Encara no existeix.
  }
}

await mkdir(DESTI, { recursive: true });

const originals = (await readdir(ORIGEN)).filter((nom) => /\.(jpe?g|png)$/i.test(nom));
let fetes = 0;

for (const nom of originals) {
  const origen = join(ORIGEN, nom);
  const { name } = parse(nom);

  for (const amplada of AMPLADES) {
    const desti = join(DESTI, `${name}-${amplada}.webp`);

    if (!(await esVella(desti, origen))) continue;

    // withoutEnlargement: cap original passa dels 1536 px, així que les amplades
    // grans es queden a la mida real en comptes d'inventar-se píxels.
    await sharp(origen)
      .resize({ width: amplada, withoutEnlargement: true })
      .webp({ quality: QUALITAT, effort: 6 })
      .toFile(desti);

    fetes++;
  }
}

const social = join(DESTI, SOCIAL.desti);

if (await esVella(social, join(ORIGEN, SOCIAL.origen))) {
  await sharp(join(ORIGEN, SOCIAL.origen))
    .resize({ width: SOCIAL.amplada, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(social);
  fetes++;
}

console.log(
  fetes === 0
    ? `Res a fer: ${originals.length} originals ja convertits.`
    : `${fetes} imatges generades a partir de ${originals.length} originals.`,
);
