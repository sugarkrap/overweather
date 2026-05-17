import { Injectable, signal, computed } from '@angular/core';
import { Match, MatchStats, MatchResult, CreateMatchPayload, MatchType } from '../models/models';

const STORAGE_KEY = 'ow_matches';

@Injectable({ providedIn: 'root' })
export class MatchStorageService {
  private readonly _matches = signal<Match[]>(this.loadFromStorage());

  readonly matches = this._matches.asReadonly();

  readonly stats = computed((): MatchStats => {
    const all = this._matches();
    const wins = all.filter(m => m.result === 'WIN').length;
    const losses = all.filter(m => m.result === 'LOSS').length;
    const draws = all.filter(m => m.result === 'DRAW').length;
    const total = all.length;
    const ranked = wins + losses;
    const winRate = ranked > 0 ? Math.round((wins / ranked) * 100) : 0;

    const sorted = [...all].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
    const recentFive = sorted.slice(0, 5);
    const recentLosses = recentFive.filter(m => m.result === 'LOSS').length;

    const lastPlayedByRole: Record<string, string | null> = { TANK: null, DPS: null, SUPPORT: null };
    for (const m of sorted) {
      if (m.role && lastPlayedByRole[m.role] === null) {
        lastPlayedByRole[m.role] = m.playedAt;
      }
    }

    return {
      total,
      wins,
      losses,
      draws,
      winRate,
      predictionAccuracy: null,
      recentLosses,
      lastPlayedByRole,
      recent: sorted.slice(0, 10).map(m => ({
        result: m.result as MatchResult,
        playedAt: m.playedAt,
      })),
    };
  });

  getPage(limit = 20, offset = 0, accountID?: string): Match[] {
    let all = this._matches();
    if (accountID) all = all.filter(m => m.accountID === accountID);
    return [...all]
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
      .slice(offset, offset + limit);
  }

  getAll(accountID?: string): Match[] {
    let all = this._matches();
    if (accountID) all = all.filter(m => m.accountID === accountID);
    return [...all].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  }

  create(payload: CreateMatchPayload): Match {
    const match: Match = {
      id: crypto.randomUUID(),
      result: payload.result,
      playedAt: payload.playedAt ?? new Date().toISOString(),
      role: payload.role,
      queueSize: payload.queueSize,
      gameMode: payload.gameMode ?? 'COMPETITIVE',
      matchType: payload.matchType,
      queueDuration: payload.queueDuration,
      notes: payload.notes,
      accountID: payload.accountID,
      modifiers: payload.modifiers?.length ? payload.modifiers : undefined,
      currentRank: payload.currentRank,
      createdAt: new Date().toISOString(),
    };
    this._matches.update(ms => [...ms, match]);
    this.persist();
    return match;
  }

  updateMatchType(id: string, matchType: MatchType): void {
    this._matches.update(ms => ms.map(m => m.id === id ? { ...m, matchType } : m));
    this.persist();
  }

  delete(id: string): void {
    this._matches.update(ms => ms.filter(m => m.id !== id));
    this.persist();
  }

  importMatches(incoming: Match[]): number {
    const existing = this._matches();
    const existingIDs = new Set(existing.map(m => m.id));
    const toAdd = incoming.filter(m => m.id && !existingIDs.has(m.id));
    if (toAdd.length > 0) {
      this._matches.update(ms => [...ms, ...toAdd]);
      this.persist();
    }
    return toAdd.length;
  }

  private loadFromStorage(): Match[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._matches()));
  }
}
