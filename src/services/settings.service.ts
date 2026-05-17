import { Injectable, signal } from '@angular/core';
import { AppSettings } from '../models/models';

const STORAGE_KEY = 'ow_settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly settings = signal<AppSettings>(this.loadFromStorage());

  readonly username = (() => {
    const s = this.settings;
    return { get: () => s().username };
  })();

  getUsername(): string {
    return this.settings().username;
  }

  setUsername(username: string): void {
    this.settings.update(s => ({ ...s, username: username.trim() }));
    this.persist();
  }

  private loadFromStorage(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { username: '' };
    } catch {
      return { username: '' };
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings()));
  }
}
