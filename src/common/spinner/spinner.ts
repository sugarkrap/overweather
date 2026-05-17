import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ow-spinner',
  standalone: true,
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spinner {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
