import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ActiveDialog, DialogService, DIALOG_DATA } from './dialog.service';
import { DialogRef } from './dialog-ref';

@Component({
  selector: 'ow-dialog-outlet',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './dialog-outlet.html',
  styleUrl: './dialog-outlet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogOutlet {
  private readonly injectorCache = new Map<string, Injector>();

  constructor(
    readonly dialogService: DialogService,
    private injector: Injector,
  ) {}

  getInjector(dialog: ActiveDialog): Injector {
    let cached = this.injectorCache.get(dialog.id);
    if (!cached) {
      cached = Injector.create({
        parent: this.injector,
        providers: [
          { provide: DialogRef, useValue: dialog.ref },
          { provide: DIALOG_DATA, useValue: dialog.config.data ?? {} },
        ],
      });
      this.injectorCache.set(dialog.id, cached);
    }
    return cached;
  }

  dismiss(dialog: ActiveDialog): void {
    if (dialog.config.dismissableMask !== false) {
      dialog.ref.close();
      this.injectorCache.delete(dialog.id);
    }
  }
}
