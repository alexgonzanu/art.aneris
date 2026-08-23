import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Calendari } from '../../shared/calendari/calendari';
import { Enviament } from '../../shared/enviament';
import { IconaInstagram } from '../../shared/icona-instagram/icona-instagram';
import { Idiomes } from '../../shared/idioma';
import { Intencions, Tipus } from '../../shared/intencions';
import { Progres } from '../../shared/progres';
import { Reveal } from '../../shared/reveal';
import { Triador } from '../../shared/triador/triador';

/** El text de l'opció és una clau del diccionari; qui la tradueix és el triador. */
interface Opcio {
  readonly valor: Tipus;
  readonly text: string;
}

/** L'id de l'element de cada control, quan no coincideix amb el seu nom. */
const IDENTIFICADORS: Record<string, string> = { contacte: 'contacte-directe' };

/** L'avís que es veu després d'enviar, també com a clau del diccionari. */
interface Estat {
  readonly to: 'avis' | 'fet' | 'error';
  readonly clau: string;
}

@Component({
  selector: 'app-contacte',
  templateUrl: './contacte.html',
  styleUrl: './contacte.scss',
  imports: [
    ReactiveFormsModule,
    Reveal,
    Progres,
    IconaInstagram,
    Calendari,
    Triador,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contacte {
  private readonly fb = inject(FormBuilder);
  private readonly intencions = inject(Intencions);
  private readonly document = inject(DOCUMENT);
  private readonly enviament = inject(Enviament);
  private readonly traduccions = inject(TranslateService);
  private readonly idiomes = inject(Idiomes);

  protected readonly opcions: readonly Opcio[] = [
    { valor: 'record-obra', text: 'contacte.tipus.recordObra' },
    { valor: 'ruta', text: 'contacte.tipus.ruta' },
    { valor: 'moment-vital', text: 'contacte.tipus.momentVital' },
    { valor: 'taller', text: 'contacte.tipus.taller' },
    { valor: 'cocreacio', text: 'contacte.tipus.cocreacio' },
    { valor: 'altra', text: 'contacte.tipus.altra' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    contacte: ['', Validators.required],
    tipus: ['', Validators.required],
    detalls: ['', Validators.required],
    data: [''],
    privacitat: [false, Validators.requiredTrue],

    // El camp esquer de l'antispam: ha d'arribar sempre buit.
    web: [''],
  });

  /* El calendari no deixa triar un dia que ja ha passat. La data va en hora
   * d'aquí i no en UTC: passada la mitjanit, a Espanya l'UTC encara és ahir.
   */
  protected readonly avui = new Date().toLocaleDateString('sv-SE');

  protected readonly enviant = signal(false);
  protected readonly estat = signal<Estat | null>(null);

  constructor() {
    /* Qui ha arribat clicant «Vull venir a un taller» o «Envia'm una ruta» ja
     * ha dit què vol: el desplegable ho recull i no li torna a preguntar.
     */
    effect(() => {
      const peticio = this.intencions.darrera();

      if (peticio) this.form.controls.tipus.setValue(peticio.tipus);
    });
  }

  /** Un camp només es queixa quan ja s'ha intentat enviar o s'ha visitat. */
  protected malament(nom: string): boolean {
    const camp: AbstractControl | null = this.form.get(nom);

    return !!camp && camp.invalid && camp.touched;
  }

  protected async envia(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.estat.set({ to: 'error', clau: 'contacte.estatRevisa' });
      this.enfocaPrimerError();
      return;
    }

    this.enviant.set(true);
    this.estat.set(null);

    const resultat = await this.enviament.envia(this.missatge());

    this.enviant.set(false);

    if (resultat === 'enviat') {
      this.form.reset();
      this.estat.set({ to: 'fet', clau: 'contacte.estatFet' });
      return;
    }

    this.estat.set(
      resultat === 'sense-configurar'
        ? { to: 'avis', clau: 'contacte.estatSenseConfigurar' }
        : { to: 'error', clau: 'contacte.estatError' },
    );
  }

  /* El correu l'ha de llegir una persona: hi ha de dir «Participar en un
   * taller» i no «taller». Qui sap passar de l'un a l'altre és el component,
   * que és qui té les opcions i el diccionari a mà; el transport només porta.
   * També hi va l'idioma en què s'ha omplert, per saber en quin respondre.
   */
  private missatge() {
    const valors = this.form.getRawValue();
    const opcio = this.opcions.find((una) => una.valor === valors.tipus);

    return {
      ...valors,
      tipusText: opcio ? this.traduccions.instant(opcio.text) : valors.tipus,
      idioma: this.idiomes.actual(),
    };
  }

  /* Marcar els camps en vermell no serveix de res a qui no els veu: el focus va
   * al primer que falla, que és qui porta l'aria-describedby amb el motiu.
   */
  private enfocaPrimerError(): void {
    const primer = Object.keys(this.form.controls).find((nom) => this.form.get(nom)?.invalid);

    if (!primer) return;

    this.document.getElementById(IDENTIFICADORS[primer] ?? primer)?.focus();
  }
}
