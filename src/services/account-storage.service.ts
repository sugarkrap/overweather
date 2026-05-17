import { Injectable, signal } from '@angular/core';
import { Account } from '../models/models';

const STORAGE_KEY = 'ow_accounts';

@Injectable({ providedIn: 'root' })
export class AccountStorageService {
  private readonly _accounts = signal<Account[]>(this.loadFromStorage());

  readonly accounts = this._accounts.asReadonly();

  create(name: string): Account {
    const account: Account = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    this._accounts.update(as => [...as, account]);
    this.persist();
    return account;
  }

  update(id: string, name: string): void {
    this._accounts.update(as => as.map(a => a.id === id ? { ...a, name: name.trim() } : a));
    this.persist();
  }

  delete(id: string): void {
    this._accounts.update(as => as.filter(a => a.id !== id));
    this.persist();
  }

  private loadFromStorage(): Account[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._accounts()));
  }
}
