import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatchStorageService } from '../../services/match-storage.service';
import { AccountStorageService } from '../../services/account-storage.service';
import { DialogService } from '../../common/dialog/dialog.service';
import { Match, MatchType } from '../../models/models';
import { ExportDialog } from './components/export-dialog/export-dialog';
import { ImportDialog } from './components/import-dialog/import-dialog';

const PAGE_SIZE = 30;

@Component({
  selector: 'ow-history',
  standalone: true,
  imports: [],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History {
  private readonly pageCount = signal(1);
  readonly filterAccountID = signal<string>('');

  private readonly allFiltered = computed(() => {
    const accountID = this.filterAccountID() || undefined;
    return this.matchStorage.getAll(accountID);
  });

  readonly matches = computed(() => this.allFiltered().slice(0, this.pageCount() * PAGE_SIZE));
  readonly hasMore = computed(() => this.allFiltered().length > this.pageCount() * PAGE_SIZE);
  readonly totalCount = computed(() => this.allFiltered().length);

  readonly accountOptions = computed(() => [
    { label: 'All accounts', value: '' },
    ...this.accountStorage.accounts().map(a => ({ label: a.name, value: a.id })),
  ]);

  constructor(
    private matchStorage: MatchStorageService,
    private accountStorage: AccountStorageService,
    private dialog: DialogService,
  ) {}

  onAccountChange(value: string): void {
    this.filterAccountID.set(value);
    this.pageCount.set(1);
  }

  loadMore(): void {
    this.pageCount.update(n => n + 1);
  }

  cycleMatchType(match: Match): void {
    const order: MatchType[] = ['NOT_SURE', 'FAIR', 'UNFAIR'];
    const current = match.matchType ?? 'NOT_SURE';
    const next = order[(order.indexOf(current) + 1) % order.length];
    this.matchStorage.updateMatchType(match.id, next);
  }

  deleteMatch(id: string): void {
    this.matchStorage.delete(id);
  }

  openExport(): void {
    const matches = this.allFiltered();
    this.dialog.open(ExportDialog, { header: 'Export Matches', icon: 'pi pi-download', data: { matches } });
  }

  openImport(): void {
    this.dialog.open(ImportDialog, { header: 'Import Matches', icon: 'pi pi-upload' });
  }

  getResultIcon(result: string): string {
    if (result === 'WIN') return 'pi pi-check';
    if (result === 'DRAW') return 'pi pi-minus';
    return 'pi pi-times';
  }

  getMatchTypeLabel(type: MatchType | undefined): string {
    if (type === 'FAIR') return 'Fair';
    if (type === 'UNFAIR') return 'Unfair';
    return '?';
  }

  getMatchTypeClass(type: MatchType | undefined): string {
    if (type === 'FAIR') return 'type-fair';
    if (type === 'UNFAIR') return 'type-unfair';
    return 'type-not-sure';
  }

  getRoleIcon(role: string | undefined): string {
    if (role === 'TANK') return 'pi pi-shield';
    if (role === 'DPS') return 'pi pi-bolt';
    if (role === 'SUPPORT') return 'pi pi-heart';
    return '';
  }

  getGameModeIcon(mode: string): string {
    if (mode === 'COMPETITIVE') return 'pi pi-trophy';
    if (mode === 'QUICKPLAY') return 'pi pi-bolt';
    return 'pi pi-star';
  }

  getModifierLabel(mod: string): string {
    return mod.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  getModifierClass(mod: string): string {
    return `tag mod-tag mod-${mod.toLowerCase().replace(/_/g, '-')}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
