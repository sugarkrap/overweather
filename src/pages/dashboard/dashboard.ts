import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatchStorageService } from '../../services/match-storage.service';
import { AccountStorageService } from '../../services/account-storage.service';
import {
  GameMode, MatchModifier, MatchResult, MatchType,
  PlayerRole, QueueDuration, QueueSize, RankTier, CurrentRank,
} from '../../models/models';

const ACCOUNT_KEY = 'ow_selected_account_id';

const MODIFIER_EXCLUSION_GROUPS: MatchModifier[][] = [
  ['WIN_STREAK', 'LOSS_STREAK'],
  ['CALIBRATION', 'VOLATILE'],
  ['UPHILL_BATTLE', 'REVERSAL', 'CONSOLATION', 'EXPECTED'],
];

@Component({
  selector: 'ow-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  submitting = signal(false);

  selectedRole = signal<PlayerRole | null>(null);
  selectedQueueSize = signal<QueueSize | null>(null);
  selectedGameMode = signal<GameMode>('COMPETITIVE');
  selectedMatchType = signal<MatchType>('NOT_SURE');
  selectedQueueDuration = signal<QueueDuration | null>(null);
  selectedModifiers = signal<MatchModifier[]>([]);
  selectedRankTier = signal<RankTier | null>(null);
  selectedSubrank = signal<number | null>(null);
  rankPercentage = signal(0);
  selectedAccountID = signal<string | null>(localStorage.getItem(ACCOUNT_KEY));

  isCompetitive = computed(() => this.selectedGameMode() === 'COMPETITIVE');
  stats = this.matchStorage.stats;

  accountOptions = computed(() => [
    { label: '—', value: '' },
    ...this.accountStorage.accounts().map(a => ({ label: a.name, value: a.id })),
  ]);

  readonly roles: Array<{ value: PlayerRole; label: string; icon: string }> = [
    { value: 'TANK', label: 'Tank', icon: 'pi pi-shield' },
    { value: 'DPS', label: 'DPS', icon: 'pi pi-bolt' },
    { value: 'SUPPORT', label: 'Support', icon: 'pi pi-heart' },
  ];

  readonly queueSizes: Array<{ value: QueueSize; label: string; icon: string }> = [
    { value: 'SOLO', label: 'Solo', icon: 'pi pi-user' },
    { value: 'DUO', label: 'Duo', icon: 'pi pi-users' },
    { value: 'TRIO', label: 'Trio', icon: 'pi pi-users' },
    { value: 'QUAD', label: '4-Stack', icon: 'pi pi-users' },
    { value: 'FIVE', label: '5-Stack', icon: 'pi pi-users' },
  ];

  readonly gameModes: Array<{ value: GameMode; label: string; icon: string }> = [
    { value: 'COMPETITIVE', label: 'Competitive', icon: 'pi pi-trophy' },
    { value: 'QUICKPLAY', label: 'Quickplay', icon: 'pi pi-bolt' },
    { value: 'ARCADE', label: 'Arcade', icon: 'pi pi-star' },
  ];

  readonly matchTypes: Array<{ value: MatchType; label: string; icon: string }> = [
    { value: 'FAIR', label: 'Fair', icon: 'pi pi-check' },
    { value: 'UNFAIR', label: 'Unfair', icon: 'pi pi-ban' },
    { value: 'NOT_SURE', label: 'Not sure', icon: 'pi pi-question-circle' },
  ];

  readonly modifiers: Array<{ value: MatchModifier; label: string; cls: string; desc: string }> = [
    { value: 'WIN_STREAK',    label: 'Win Streak',    cls: 'mod-win-streak',    desc: 'Bonus for a high win rate.' },
    { value: 'LOSS_STREAK',   label: 'Loss Streak',   cls: 'mod-loss-streak',   desc: 'Penalty for a high loss rate.' },
    { value: 'CALIBRATION',   label: 'Calibration',   cls: 'mod-calibration',   desc: 'Your rank is uncertain.' },
    { value: 'VOLATILE',      label: 'Volatile',      cls: 'mod-volatile',      desc: 'You lost calibration matches after ranking up.' },
    { value: 'UPHILL_BATTLE', label: 'Uphill Battle', cls: 'mod-uphill-battle', desc: "You weren't favored but you won." },
    { value: 'REVERSAL',      label: 'Reversal',      cls: 'mod-reversal',      desc: 'You were favored and you lost.' },
    { value: 'CONSOLATION',   label: 'Consolation',   cls: 'mod-consolation',   desc: "You weren't favored and you lost." },
    { value: 'EXPECTED',      label: 'Expected',      cls: 'mod-expected',      desc: 'You were favored and you won.' },
  ];

  hoveredModifier = signal<{ label: string; desc: string } | null>(null);

  readonly rankTiers: Array<{ value: RankTier; label: string; abbr: string }> = [
    { value: 'COPPER',      label: 'Copper',      abbr: 'Cu' },
    { value: 'SILVER',      label: 'Silver',      abbr: 'Si' },
    { value: 'GOLD',        label: 'Gold',        abbr: 'Go' },
    { value: 'PLATINUM',    label: 'Platinum',    abbr: 'Pt' },
    { value: 'DIAMOND',     label: 'Diamond',     abbr: 'Di' },
    { value: 'MASTER',      label: 'Master',      abbr: 'Ma' },
    { value: 'GRANDMASTER', label: 'Grandmaster', abbr: 'GM' },
    { value: 'CHAMPION',    label: 'Champion',    abbr: 'Ch' },
  ];

  readonly subrankNumbers = [5, 4, 3, 2, 1];

  constructor(
    private matchStorage: MatchStorageService,
    private accountStorage: AccountStorageService,
  ) {}

  logMatch(result: MatchResult): void {
    this.submitting.set(true);
    const rankTier = this.selectedRankTier();
    const currentRank: CurrentRank | undefined = rankTier
      ? { tier: rankTier, subrank: this.selectedSubrank() ?? undefined, percentage: this.rankPercentage() }
      : undefined;

    this.matchStorage.create({
      result,
      role: this.selectedRole() ?? undefined,
      queueSize: this.selectedQueueSize() ?? undefined,
      gameMode: this.selectedGameMode(),
      matchType: this.selectedMatchType(),
      queueDuration: this.selectedQueueDuration() ?? undefined,
      accountID: this.selectedAccountID() ?? undefined,
      modifiers: this.selectedModifiers(),
      currentRank,
    });

    this.submitting.set(false);
    this.selectedMatchType.set('NOT_SURE');
    this.selectedQueueDuration.set(null);
    this.selectedModifiers.set([]);
  }

  selectRole(role: PlayerRole): void {
    this.selectedRole.set(this.selectedRole() === role ? null : role);
  }

  selectQueueSize(size: QueueSize): void {
    this.selectedQueueSize.set(this.selectedQueueSize() === size ? null : size);
  }

  selectGameMode(mode: GameMode): void {
    this.selectedGameMode.set(mode);
    if (mode !== 'COMPETITIVE') {
      this.selectedModifiers.set([]);
      this.selectedRankTier.set(null);
      this.selectedSubrank.set(null);
      this.rankPercentage.set(0);
    }
  }

  selectMatchType(type: MatchType): void {
    this.selectedMatchType.set(type);
  }

  selectQueueDuration(d: QueueDuration): void {
    this.selectedQueueDuration.set(this.selectedQueueDuration() === d ? null : d);
  }

  toggleModifier(mod: MatchModifier): void {
    this.selectedModifiers.update(current => {
      if (current.includes(mod)) return current.filter(m => m !== mod);
      const exclusions = MODIFIER_EXCLUSION_GROUPS.find(g => g.includes(mod)) ?? [];
      return [...current.filter(m => !exclusions.includes(m)), mod];
    });
  }

  isModifierSelected(mod: MatchModifier): boolean {
    return this.selectedModifiers().includes(mod);
  }

  getModifierBtnClass(mod: { value: MatchModifier; cls: string }): string {
    return `toggle-btn ${mod.cls}${this.isModifierSelected(mod.value) ? ' selected' : ''}`;
  }

  selectRankTier(tier: RankTier): void {
    this.selectedRankTier.set(this.selectedRankTier() === tier ? null : tier);
    this.selectedSubrank.set(null);
    this.rankPercentage.set(0);
  }

  selectSubrank(n: number): void {
    this.selectedSubrank.set(this.selectedSubrank() === n ? null : n);
  }

  selectAccount(id: string): void {
    const val = id || null;
    this.selectedAccountID.set(val);
    if (val) localStorage.setItem(ACCOUNT_KEY, val);
    else localStorage.removeItem(ACCOUNT_KEY);
  }

  getResultIcon(result: string): string {
    if (result === 'WIN') return 'pi pi-check';
    if (result === 'DRAW') return 'pi pi-minus';
    return 'pi pi-times';
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
