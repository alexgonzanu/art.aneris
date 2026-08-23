import nodemailer from 'nodemailer';

/* El que hi ha a l'altra banda del formulari de contacte.
 *
 * Viu al servidor i no al navegador per dos motius. El primer és que les
 * credencials de la bústia no poden sortir mai al bundle. El segon és que les
 * comprovacions que aturen l'spam només valen si es fan aquí: el navegador ja
 * en fa unes quantes, però qui les vulgui saltar només ha de fer el POST a mà.
 */

/** Els camps que s'accepten, amb el màxim de caràcters de cadascun. */
const CAMPS = {
  nom: 200,
  contacte: 200,
  tipus: 60,
  tipusText: 200,
  detalls: 5000,
  data: 40,
  idioma: 10,
};

/** Sense aquests no hi ha res a enviar. La resta poden arribar buits. */
const OBLIGATORIS = ['nom', 'contacte', 'tipus', 'detalls'];

/** Sense això no es pot enviar res, i cal dir-ho d'una manera diferent d'un error. */
const CONFIGURACIO = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CORREU_DESTI'];

/* El camp de contacte és «Email o Instagram»: pot ser @usuari. El Respondre a
 * només es posa quan és una adreça de debò, perquè si no la resposta rebotaria.
 */
const SEMBLA_CORREU = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function resposta(estat, cos) {
  return new Response(JSON.stringify(cos), {
    status: estat,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Text d'un camp, retallat i sense res que no sigui text. */
function net(valor, maxim) {
  if (typeof valor !== 'string') return '';

  return valor.trim().slice(0, maxim);
}

/** L'assumpte va en una capçalera: els salts de línia no hi poden entrar. */
function unaLinia(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function cosDelCorreu(dades) {
  return [
    `Nom: ${dades.nom}`,
    `Contacte: ${dades.contacte}`,
    `Què vol: ${dades.tipusText || dades.tipus}`,
    `Data: ${dades.data || 'no n’ha dit cap'}`,
    `Idioma del formulari: ${dades.idioma || 'ca'}`,
    '',
    'Detalls:',
    dades.detalls,
    '',
    '—',
    'Enviat des del formulari d’art.aneris.',
  ].join('\n');
}

export default async function contacte(peticio) {
  if (peticio.method !== 'POST') return resposta(405, { motiu: 'metode' });

  let rebut;

  try {
    rebut = await peticio.json();
  } catch {
    return resposta(400, { motiu: 'cos-illegible' });
  }

  if (!rebut || typeof rebut !== 'object') return resposta(400, { motiu: 'cos-illegible' });

  /* El camp esquer és invisible i no es pot tabular: una persona no l'omple
   * mai. Si arriba ple, és un robot: se li diu que tot ha anat bé i no s'envia
   * res, que és el que fa que no ho torni a provar d'una altra manera.
   */
  if (net(rebut.web, 200)) return resposta(200, { resultat: 'enviat' });

  const dades = Object.fromEntries(
    Object.entries(CAMPS).map(([camp, maxim]) => [camp, net(rebut[camp], maxim)]),
  );

  const buits = OBLIGATORIS.filter((camp) => !dades[camp]);

  if (buits.length) return resposta(400, { motiu: 'camps', camps: buits });

  // El consentiment no és una casella que es pugui donar per suposada.
  if (rebut.privacitat !== true) return resposta(400, { motiu: 'privacitat' });

  const falta = CONFIGURACIO.filter((clau) => !process.env[clau]);

  if (falta.length) {
    console.error(`Falten variables d'entorn: ${falta.join(', ')}`);

    return resposta(503, { motiu: 'sense-configurar' });
  }

  const port = Number(process.env.SMTP_PORT);

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // El 465 xifra des del primer byte; el 587 comença en clar i puja a TLS.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  try {
    await transport.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CORREU_DESTI,
      subject: unaLinia(`art.aneris — ${dades.tipusText || dades.tipus} — ${dades.nom}`),
      text: cosDelCorreu(dades),
      ...(SEMBLA_CORREU.test(dades.contacte) ? { replyTo: dades.contacte } : {}),
    });
  } catch (error) {
    console.error(error);

    return resposta(502, { motiu: 'enviament' });
  }

  return resposta(200, { resultat: 'enviat' });
}
