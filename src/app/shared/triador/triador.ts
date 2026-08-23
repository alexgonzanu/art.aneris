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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

export interface Opcio {
  readonly valor: string;

  /** Clau del diccionari; qui la tradueix és la plantilla. */
  readonly text: string;
}

/**
 * Un desplegable amb la cara de la resta de la pàgina.
 *
 * El <select> del navegador el pinta cada sistema al seu gust —a Windows encara
 * és la llista grisa de sempre— i al costat del calendari, que ja és nostre,
 * cantava. Aquest és un camp de formulari com qualsevol altre —parla amb
 * formControlName i el valor continua sent el de l'opció— però el que es veu és
 * nostre.
 *
 * De teclat: les fletxes obren la llista i s'hi mouen, Inici i Fi van als
 * extrems, teclejar una lletra salta a l'opció següent que hi comenci, Enter o
 * Espai trien i Escape tanca sense triar res.
 */
@Component({
  selector: 'app-triador',
  templateUrl: './triador.html',
  styleUrl: './triador.scss',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Triador),
      multi: true,
    },
  ],
  host: {
    class: 'triador',
    '(document:click)': 'clicaFora($event)',
    '(keydown.escape)': 'tanca()',
    '(keydown)': 'navega($event)',
    '(focusout)': 'perdElFoc($event)',
  },
})
export class Triador implements ControlValueAccessor {
  /** L'id del botó que obre la llista, per lligar-hi l'etiqueta del camp. */
  readonly identificador = input.required<string>();

  readonly opcions = input.required<readonly Opcio[]>();

  /** La clau del que es llegeix al camp mentre no s'ha triat res. */
  readonly marcador = input('triador.marcador');

  /* Un <button> no pren el nom del <label for>: se'l treu del que hi ha a
   * dins, que aquí és el valor triat. L'id de l'etiqueta visible ve per aquí
   * perquè el camp s'anunciï pel que pregunta i no per la resposta.
   */
  readonly etiquetadaPer = input<string>();

  readonly descripcio = input<string>();

  readonly incorrecte = input(false);

  protected readonly obert = signal(false);
  protected readonly valor = signal('');
  protected readonly deshabilitat = signal(false);

  /** L'opció que té el focus mentre la llista és oberta. */
  protected readonly actiu = signal('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly traduccions = inject(TranslateService);
  private canviat: (valor: string) => void = () => undefined;
  private tocat: () => void = () => undefined;

  protected readonly triada = computed(() =>
    this.opcions().find((opcio) => opcio.valor === this.valor()),
  );

  protected readonly text = computed(() => this.triada()?.text ?? this.marcador());

  protected readonly llista = computed(() => `${this.identificador()}-llista`);

  constructor() {
    /* El focus de la llista és virtual —el de debò no es mou del camp— i per
     * tant no arrossega la vista: si l'opció activa queda fora, la hi portem.
     */
    afterRenderEffect(() => {
      const valor = this.actiu();

      if (!this.obert() || !valor) return;

      this.host.nativeElement
        .querySelector<HTMLElement>(`[data-valor="${valor}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
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

  protected idOpcio(valor: string): string {
    return `${this.identificador()}-${valor}`;
  }

  protected commuta(): void {
    if (this.obert()) {
      this.tanca();
      return;
    }

    this.obre();
  }

  protected tria(opcio: Opcio): void {
    this.valor.set(opcio.valor);
    this.canviat(opcio.valor);
    this.tanca();
  }

  /** Les fletxes i companyia mouen l'opció activa per la llista. */
  protected navega(event: KeyboardEvent): void {
    if (this.deshabilitat()) return;

    /* Amb la llista tancada, les fletxes l'obren. Enter i Espai no: el botó ja
     * els converteix en un clic, i tornar-los a mirar aquí l'obriria i el
     * tancaria de seguida.
     */
    if (!this.obert()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.obre();
      }

      return;
    }

    const opcions = this.opcions();
    const actual = opcions.findIndex((opcio) => opcio.valor === this.actiu());
    const salts: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

    if (event.key in salts) {
      event.preventDefault();
      this.mou(actual + salts[event.key]);
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.mou(event.key === 'Home' ? 0 : opcions.length - 1);
      return;
    }

    /* Amb la llista oberta, Enter i Espai trien: aturar-los aquí és el que evita
     * que el botó els converteixi en un clic i la torni a obrir.
     */
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      const opcio = opcions[actual];
      if (opcio) this.tria(opcio);

      return;
    }

    /* Teclejar una lletra salta a l'opció següent que hi comenci i torna a
     * començar per dalt en arribar al final, com el desplegable del navegador.
     * Es busca pel text traduït i no per la clau: la lletra que es prem és la
     * que es veu.
     */
    if (event.key.length === 1) {
      const lletra = event.key.toLowerCase();
      const desde = actual + 1;
      const ordre = [...opcions.slice(desde), ...opcions.slice(0, desde)];
      const trobada = ordre.find((opcio) =>
        String(this.traduccions.instant(opcio.text)).toLowerCase().startsWith(lletra),
      );

      if (trobada) {
        event.preventDefault();
        this.actiu.set(trobada.valor);
      }
    }
  }

  protected clicaFora(event: Event): void {
    if (!this.obert()) return;
    if (this.host.nativeElement.contains(event.target as Node)) return;

    this.tanca(false);
  }

  /* Si el focus se'n va del component —amb el tabulador, per exemple— la llista
   * no s'ha de quedar oberta al darrere.
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
    this.actiu.set('');
    this.tocat();

    if (tornaElFoc) {
      this.host.nativeElement.querySelector<HTMLButtonElement>('.triador__camp')?.focus();
    }
  }

  private obre(): void {
    // S'obre per l'opció que ja hi ha triada; si encara no n'hi ha cap, per la
    // primera de la llista.
    this.actiu.set(this.valor() || (this.opcions()[0]?.valor ?? ''));
    this.obert.set(true);
  }

  private mou(index: number): void {
    const opcions = this.opcions();
    const acotat = Math.max(0, Math.min(index, opcions.length - 1));

    this.actiu.set(opcions[acotat]?.valor ?? '');
  }
}
