import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  signal,
  ViewChild,
} from "@angular/core";
import { DialogRef } from "../../../../common/dialog/dialog-ref";
import { DIALOG_DATA } from "../../../../common/dialog/dialog.service";
import { MatchStorageService } from "../../../../services/match-storage.service";
import { AccountStorageService } from "../../../../services/account-storage.service";
import {
  Match,
  MatchModifier,
  QueueDuration,
  CurrentRank,
  RankTier,
} from "../../../../models/models";

type ImportState = "idle" | "success" | "error";

@Component({
  selector: "ow-import-dialog",
  standalone: true,
  imports: [],
  templateUrl: "./import-dialog.html",
  styleUrl: "./import-dialog.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportDialog {
  @ViewChild("jsonArea") jsonAreaRef!: ElementRef<HTMLTextAreaElement>;

  readonly hasText = signal(false);
  readonly state = signal<ImportState>("idle");
  readonly importedCount = signal(0);
  readonly errorMessage = signal("");

  constructor(
    private ref: DialogRef,
    @Inject(DIALOG_DATA) _data: Record<string, unknown>,
    private matchStorage: MatchStorageService,
    private accountStorage: AccountStorageService,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.jsonAreaRef.nativeElement.value = reader.result as string;
      this.hasText.set(true);
      this.state.set("idle");
    };
    reader.readAsText(file);
  }

  import(): void {
    const text = this.jsonAreaRef.nativeElement.value.trim();
    if (!text) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      this.state.set("error");
      this.errorMessage.set("Invalid JSON — could not parse the input.");
      return;
    }

    if (!Array.isArray(parsed)) {
      this.state.set("error");
      this.errorMessage.set("Expected a JSON array of matches.");
      return;
    }

    const matches = (parsed as Record<string, unknown>[]).map((r) =>
      this.normalizeMatch(r),
    );
    const count = this.matchStorage.importMatches(matches);
    this.importedCount.set(count);
    this.state.set("success");
  }

  close(): void {
    this.ref.close();
  }

  private resolveAccountID(
    name: string | null | undefined,
  ): string | undefined {
    if (!name) return undefined;
    const existing = this.accountStorage
      .accounts()
      .find((a) => a.name === name);
    if (existing) return existing.id;
    return this.accountStorage.create(name).id;
  }

  private normalizeMatch(raw: Record<string, unknown>): Match {
    const isLegacy =
      "weather" in raw || "waitTime" in raw || "accountName" in raw;
    if (!isLegacy) return raw as unknown as Match;

    const modifiers: MatchModifier[] = [];
    if (raw["calibrating"]) modifiers.push("CALIBRATION");

    const matchStreak = raw["matchStreak"] as string | null;
    if (matchStreak === "WIN_STREAK") modifiers.push("WIN_STREAK");
    else if (matchStreak === "LOSS_STREAK") modifiers.push("LOSS_STREAK");

    let queueDuration: QueueDuration | undefined;
    const waitTime = raw["waitTime"] as number | null;
    if (typeof waitTime === "number") {
      queueDuration = waitTime < 30 ? "SHORT" : "LONG";
    }

    let currentRank: CurrentRank | undefined;
    const rankTier = raw["rankTier"] as string | null;
    if (rankTier) {
      currentRank = {
        tier: rankTier as RankTier,
        subrank: (raw["rankSubrank"] as number | null) ?? undefined,
        percentage: (raw["rankPercentage"] as number | null) ?? 0,
      };
    }

    return {
      id: raw["id"] as string,
      result: raw["result"] as Match["result"],
      playedAt: raw["playedAt"] as string,
      createdAt: (raw["createdAt"] as string) ?? new Date().toISOString(),
      gameMode: (raw["gameMode"] as Match["gameMode"]) ?? "COMPETITIVE",
      role: raw["role"] as Match["role"],
      queueSize: raw["queueSize"] as Match["queueSize"],
      matchType: raw["matchType"] as Match["matchType"],
      queueDuration,
      notes: (raw["notes"] as string | null) ?? undefined,
      accountID: this.resolveAccountID(raw["accountName"] as string | null),
      modifiers: modifiers.length ? modifiers : undefined,
      currentRank,
    };
  }
}
