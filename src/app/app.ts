import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { DialogOutlet } from '../common/dialog/dialog-outlet';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'ow-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage, DialogOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  servicesOpen = signal(false);

  readonly services = [
    { label: 'Keep Your Trash', url: 'http://localhost:4200', icon: 'pi pi-car' },
    { label: 'Gift Villain',    url: 'http://localhost:4300', icon: 'pi pi-gift' },
    { label: 'Admin Panel',     url: 'http://localhost:4400', icon: 'pi pi-shield' },
    { label: 'Aegis',           url: 'http://localhost:4600', icon: 'pi pi-bolt' },
    { label: 'DevOps',          url: 'http://localhost:4800', icon: 'pi pi-server' },
  ];

  constructor(readonly settings: SettingsService) {}

  @HostListener('document:click')
  onDocumentClick(): void {
    this.servicesOpen.set(false);
  }
}
