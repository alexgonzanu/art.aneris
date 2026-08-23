import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Idiomes } from '../idioma';

interface Dia {
  readonly iso: string;
  readonly numero: number;
  readonly delMes: boolean;
  readonly passat: boolean;
  readonly avui: boolean;
}

/** Una data en local i en format AAAA-MM-DD, que és com escriu les dates el suec. */
function isoDe(data: Date): string {
  return data.toLocaleDateString('sv-SE');
}

function desDIso(iso: string): Date {
  // Amb l'hora explícita es llegeix en local; sense, el navegador ho faria en
  // UTC i aquí la data saltaria un dia enrere.
  return new Date(`${iso}T00:00:00`);
}

/* Els noms dels mesos i dels dies no van al diccionari: els posa Intl a
 * partir de l'idioma actiu, que ja els sap en tots dos i en qualsevol que
 * s'afegeixi demà.
 */
const MES = (idioma: string) => new Intl.DateTimeFormat(idioma, { month: 'long', year: 'numeric' });
const COMPLETA = (idioma: string) =>
  new Intl.DateTimeFormat(idioma, { day: 'numeric', month: 'long', year: 'numeric' });
const DIA_SETMANA = (idioma: string) => new Intl.DateTimeFormat(idioma, { weekday: 'long' });

/**
 * Un calendari amb la cara de la resta de la pàgina.
 *
 * El del navegador funciona bé, però el pinta cada sistema al seu gust i
 * desentonava. Aquest és un camp de formulari com qualsevol altre —parla amb
 * formControlName i el valor continua sent AAAA-MM-DD— però el que es veu és
 * nostre.
 *
 * De teclat: les fletxes mouen dia a dia i setmana a setmana, Inici i Fi van
 * als extrems de la setmana, Re Pàg i Av Pàg canvien de mes, Enter o Espai
 * trien i Escape tanca sense triar res.
 */
@Component({
  selector: 'app-calendari',
  templateUrl: './calendari.html',
  styleUrl: './calendari.scss',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Calendari),
      multi: true,
    },
  ],
  host: {
    class: 'calendari',
    '(document:click)': 'clicaFora($event)',
    '(keydown.escape)': 'tanca()',
    '(keydown)': 'navega($event)',
    '(focusout)': 'perdElFoc($event)',
  },
})
export class Calendari implements ControlValueAccessor {
  /** L'id del botó que obre el calendari, per lligar-hi l'etiqueta del camp. */
  readonly identificador = input.required<string>();

  /** El primer dia que es pot triar. Els anteriors surten apagats. */
  readonly minim = input(isoDe(new Date()));

  readonly descripcio = input<string>();

  protected readonly obert = signal(false);
  protected readonly valor = signal('');
  protected readonly deshabilitat = signal(false);

  /** El mes que s'està mirant i el dia que té el focus dins de la graella. */
  protected readonly ancora = signal(new Date());
  protected readonly focus = signal('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly idiomes = inject(Idiomes);
  private canviat: (valor: string) => void = () => undefined;
  private tocat: () => void = () => undefined;

  /* La data escrita ja ve de l'idioma i no s'ha de tornar a traduir; el text
   * de quan no n'hi ha cap, sí. La plantilla ho distingeix amb aquesta marca.
   */
  protected readonly etiqueta = computed(() => {
    const valor = this.valor();

    return valor ? COMPLETA(this.idiomes.actual()).format(desDIso(valor)) : '';
  });

  protected readonly titolMes = computed(() => MES(this.idiomes.actual()).format(this.ancora()));

  /** Els encapçalaments de la graella, de dilluns a diumenge. */
  protected readonly capcaleres = computed(() => {
    // El 5 de gener de 2026 va ser dilluns. Serveix de referència per treure els
    // noms dels dies sense haver-los d'escriure a mà.
    const dilluns = new Date(2026, 0, 5);
    const format = DIA_SETMANA(this.idiomes.actual());

    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(dilluns);
      dia.setDate(dilluns.getDate() + i);
      const nom = format.format(dia);

      return { nom, inicial: nom.slice(0, 2) };
    });
  });

  protected readonly setmanes = computed<readonly (readonly Dia[])[]>(() => {
    const ancora = this.ancora();
    const avui = isoDe(new Date());
    const minim = this.minim();
    const primer = new Date(ancora.getFullYear(), ancora.getMonth(), 1);

    // La graella sempre arrenca en dilluns, i getDay() compta a partir de
    // diumenge: cal girar-ho.
    const desplacament = (primer.getDay() + 6) % 7;
    const inici = new Date(primer);
    inici.setDate(primer.getDate() - desplacament);

    const setmanes: Dia[][] = [];

    for (let s = 0; s < 6; s++) {
      const setmana: Dia[] = [];

      for (let d = 0; d < 7; d++) {
        const data = new Date(inici);
        data.setDate(inici.getDate() + s * 7 + d);
        const iso = isoDe(data);

        setmana.push({
          iso,
          numero: data.getDate(),
          delMes: data.getMonth() === ancora.getMonth(),
          passat: iso < minim,
          avui: iso === avui,
        });
      }

      setmanes.push(setmana);
    }

    return setmanes;
  });

  constructor() {
    // El dia que té el focus lògic l'ha de tenir també de debò: si no, el
    // teclat mouria una cosa que el lector de pantalla no segueix.
    afterRenderEffect(() => {
      const iso = this.focus();

      if (!this.obert() || !iso) return;

      this.host.nativeElement
        .querySelector<HTMLButtonElement>(`[data-dia="${iso}"]`)
        ?.focus({ preventScroll: true });
    });
  }

  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');

    if (valor) this.ancora.set(desDIso(valor));
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.canviat = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.tocat = fn;
  }

  setDisabledState(deshabilitat: boolean): void {
    this.deshabilitat.set(deshabilitat);
  }

  protected commuta(): void {
    if (this.obert()) {
      this.tanca();
      return;
    }

    this.obre();
  }

  protected tria(dia: Dia): void {
    if (dia.passat) return;

    this.valor.set(dia.iso);
    this.canviat(dia.iso);
    this.tanca();
  }

  protected esborra(): void {
    this.valor.set('');
    this.canviat('');
    this.tanca();
  }

  protected mouMes(quants: number): void {
    const ancora = this.ancora();
    const seguent = new Date(ancora.getFullYear(), ancora.getMonth() + quants, 1);

    this.ancora.set(seguent);

    // El focus es queda al mateix dia del mes nou, o a l'últim que hi hagi.
    const actual = this.focus() ? desDIso(this.focus()) : seguent;
    const dies = new Date(seguent.getFullYear(), seguent.getMonth() + 1, 0).getDate();
    const dia = new Date(seguent);
    dia.setDate(Math.min(actual.getDate(), dies));

    this.focus.set(isoDe(dia));
  }

  /** Les fletxes i companyia mouen el focus per la graella. */
  protected navega(event: KeyboardEvent): void {
    // Només mentre el calendari és obert i el focus és en un dia: a les fletxes
    // del mes o al botó d'esborrar, les tecles han de fer el que facin sempre.
    if (!this.obert()) return;
    if (!(event.target as HTMLElement).matches('[data-dia]')) return;

    const salts: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key in salts) {
      event.preventDefault();
      this.moguDies(salts[event.key]);
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();

      const dins = (desDIso(this.focus()).getDay() + 6) % 7;
      this.moguDies(event.key === 'Home' ? -dins : 6 - dins);
      return;
    }

    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      this.mouMes(event.key === 'PageUp' ? -1 : 1);
    }
  }

  protected clicaFora(event: Event): void {
    if (!this.obert()) return;
    if (this.host.nativeElement.contains(event.target as Node)) return;

    this.tanca(false);
  }

  /* Si el focus se'n va del component —amb el tabulador, per exemple— el
   * calendari no s'ha de quedar obert al darrere.
   */
  protected perdElFoc(event: FocusEvent): void {
    if (!this.obert()) return;

    const cap = event.relatedTarget as Node | null;
    if (cap && this.host.nativeElement.contains(cap)) return;

    this.tanca(false);
  }

  protected tanca(tornaElFoc = true): void {
    if (!this.obert()) return;

    this.obert.set(false);
    this.focus.set('');
    this.tocat();

    if (tornaElFoc) {
      this.host.nativeElement.querySelector<HTMLButtonElement>('.calendari__camp')?.focus();
    }
  }

  private obre(): void {
    const partida = this.valor() || this.minim();

    this.ancora.set(desDIso(partida));
    this.focus.set(partida);
    this.obert.set(true);
  }

  private moguDies(quants: number): void {
    const data = desDIso(this.focus());
    data.setDate(data.getDate() + quants);

    this.focus.set(isoDe(data));

    // Si el salt ha canviat de mes, la vista el segueix.
    const ancora = this.ancora();

    if (data.getMonth() !== ancora.getMonth() || data.getFullYear() !== ancora.getFullYear()) {
      this.ancora.set(new Date(data.getFullYear(), data.getMonth(), 1));
    }
  }
}
