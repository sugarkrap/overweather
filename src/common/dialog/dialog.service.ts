import { Injectable, InjectionToken, signal, Type } from '@angular/core';
import { DialogRef } from './dialog-ref';

export const DIALOG_DATA = new InjectionToken<Record<string, unknown>>('DIALOG_DATA');

export interface DialogConfig {
  header?: string;
  icon?: string;
  data?: Record<string, unknown>;
  closable?: boolean;
  dismissableMask?: boolean;
}

export interface ActiveDialog {
  id: string;
  component: Type<unknown>;
  config: DialogConfig;
  ref: DialogRef;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly activeDialogs = signal<ActiveDialog[]>([]);

  open<T = void>(component: Type<unknown>, config: DialogConfig = {}): DialogRef<T> {
    const id = crypto.randomUUID();
    const ref = new DialogRef<T>();

    ref._setCloseCallback(() => {
      this.activeDialogs.update(ds => ds.filter(d => d.id !== id));
    });

    const dialog: ActiveDialog = {
      id,
      component,
      config,
      ref: ref as unknown as DialogRef,
    };

    this.activeDialogs.update(ds => [...ds, dialog]);
    return ref;
  }
}
