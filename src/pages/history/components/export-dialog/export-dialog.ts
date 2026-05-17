import { ChangeDetectionStrategy, Component, Inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '../../../../common/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../common/dialog/dialog.service';
import { Match } from '../../../../models/models';

type ExportFormat = 'json' | 'csv';

const CSV_HEADERS = [
  'id', 'result', 'playedAt', 'gameMode', 'role', 'queueSize',
  'matchType', 'queueDuration', 'accountID', 'modifiers',
  'rankTier', 'rankSubrank', 'rankPercentage', 'createdAt',
];

@Component({
  selector: 'ow-export-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './export-dialog.html',
  styleUrl: './export-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportDialog {
  private readonly matches: Match[];

  readonly format = signal<ExportFormat>('json');
  readonly copied = signal(false);

  readonly content = computed(() => {
    return this.format() === 'json'
      ? this.toJSON()
      : this.toCSV();
  });

  readonly filename = computed(() =>
    `overweather-matches-${new Date().toISOString().slice(0, 10)}.${this.format()}`
  );

  constructor(
    private ref: DialogRef,
    @Inject(DIALOG_DATA) data: { matches: Match[] },
  ) {
    this.matches = data.matches ?? [];
  }

  private toJSON(): string {
    return JSON.stringify(this.matches, null, 2);
  }

  private toCSV(): string {
    const escape = (v: unknown): string => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const rows = this.matches.map(m => [
      m.id,
      m.result,
      m.playedAt,
      m.gameMode,
      m.role ?? '',
      m.queueSize ?? '',
      m.matchType ?? '',
      m.queueDuration ?? '',
      m.accountID ?? '',
      m.modifiers?.join(';') ?? '',
      m.currentRank?.tier ?? '',
      m.currentRank?.subrank ?? '',
      m.currentRank?.percentage ?? '',
      m.createdAt,
    ].map(escape).join(','));

    return [CSV_HEADERS.join(','), ...rows].join('\n');
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.content()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  download(): void {
    const blob = new Blob([this.content()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.filename();
    a.click();
    URL.revokeObjectURL(url);
  }

  close(): void {
    this.ref.close();
  }
}
