import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { AccountStorageService } from '../../services/account-storage.service';
import { Account } from '../../models/models';

@Component({
  selector: 'ow-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  readonly usernameInput = signal(this.settingsService.getUsername());
  readonly usernameSaved = signal(false);

  readonly accounts = this.accountStorage.accounts;
  readonly newAccountName = signal('');

  readonly editingID = signal<string | null>(null);
  readonly editingName = signal('');

  constructor(
    private settingsService: SettingsService,
    private accountStorage: AccountStorageService,
  ) {}

  saveUsername(): void {
    this.settingsService.setUsername(this.usernameInput());
    this.usernameSaved.set(true);
    setTimeout(() => this.usernameSaved.set(false), 2000);
  }

  addAccount(): void {
    const name = this.newAccountName().trim();
    if (!name) return;
    this.accountStorage.create(name);
    this.newAccountName.set('');
  }

  startEdit(account: Account): void {
    this.editingID.set(account.id);
    this.editingName.set(account.name);
  }

  saveEdit(): void {
    const id = this.editingID();
    if (!id) return;
    const name = this.editingName().trim();
    if (name) this.accountStorage.update(id, name);
    this.editingID.set(null);
  }

  cancelEdit(): void {
    this.editingID.set(null);
  }

  deleteAccount(id: string): void {
    this.accountStorage.delete(id);
    if (this.editingID() === id) this.editingID.set(null);
  }
}
