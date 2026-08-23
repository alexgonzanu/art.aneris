/* Baixa de Google Fonts les tipografies que fem servir i les deixa a
 * `public/fonts/`, amb el CSS corresponent a `src/_fonts.scss`.
 *
 * Servir-les des del nostre domini treu dues connexions a un tercer del camí
 * crític i, sobretot, evita enviar la IP de qui visita la pàgina a Google sense
 * haver-ho demanat.
 *
 * Només es baixa el que es fa servir: Playfair Display en variable —un sol
 * fitxer per a tots els pesos— i les tres instàncies de Poppins, en els
 * subconjunts latin i latin-ext, que són els que necessita el català.
 *
 *   node scripts/fonts.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';

const DEMANA =
  'https://fonts.googleapis.com/css2' +
  '?family=Playfair+Display:ital,wght@0,400..700;1,400..700' +
  '&family=Poppins:wght@300;400;500' +
  '&display=swap';

// Sense un User-Agent de navegador modern, Google serveix TTF en comptes de WOFF2.
const NAVEGADOR =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const SUBCONJUNTS = new Set(['latin', 'latin-ext']);

const resposta = await fetch(DEMANA, { headers: { 'User-Agent': NAVEGADOR } });
if (!resposta.ok) throw new Error(`Google Fonts ha respost ${resposta.status}`);
const css = await resposta.text();

await mkdir('public/fonts', { recursive: true });

const faces = [];

for (const [, subconjunt, bloc] of css.matchAll(/\/\* ([a-z-]+) \*\/\s*(@font-face \{[^}]+\})/g)) {
  if (!SUBCONJUNTS.has(subconjunt)) continue;

  const camp = (nom) => bloc.match(new RegExp(`${nom}: ([^;]+);`))?.[1].trim();
  const familia = camp('font-family').replace(/'/g, '');
  const estil = camp('font-style');
  const pes = camp('font-weight');

  faces.push({
    familia,
    estil,
    pes,
    rang: camp('unicode-range'),
    url: bloc.match(/url\((https:[^)]+\.woff2)\)/)[1],
    nom: `${familia.toLowerCase().replaceAll(' ', '-')}-${pes.replaceAll(' ', '-')}${
      estil === 'italic' ? '-italic' : ''
    }-${subconjunt}.woff2`,
  });
}

for (const face of faces) {
  const fitxer = await fetch(face.url);
  if (!fitxer.ok) throw new Error(`${face.url} -> ${fitxer.status}`);
  await writeFile(`public/fonts/${face.nom}`, Buffer.from(await fitxer.arrayBuffer()));
}

const regles = faces
  .map(
    (f) => `@font-face {
  font-family: '${f.familia}';
  font-style: ${f.estil};
  font-weight: ${f.pes};
  font-display: swap;
  src: url('/fonts/${f.nom}') format('woff2');
  unicode-range: ${f.rang};
}`,
  )
  .join('\n\n');

await writeFile(
  'src/_fonts.scss',
  `/* Generat per scripts/fonts.mjs. No l'editis a mà: torna a executar l'script.
 *
 * Les tipografies es serveixen des del nostre domini i no des del CDN de
 * Google. Els fitxers són a public/fonts/, sota llicència OFL (vegeu-hi
 * LLICENCIA.txt).
 */

${regles}
`,
);

console.log(`${faces.length} fitxers a public/fonts/ i src/_fonts.scss actualitzat.`);
