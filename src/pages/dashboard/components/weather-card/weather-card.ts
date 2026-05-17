import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { QualityPrediction, WeatherCondition } from '../../../../models/models';
import { QualityService } from '../../../../services/quality.service';
import { Spinner } from '../../../../common/spinner/spinner';

@Component({
  selector: 'ow-weather-card',
  standalone: true,
  imports: [Spinner],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherCard {
  @Input() current: QualityPrediction | null = null;
  @Input() loading = false;
  @Output() refresh = new EventEmitter<void>();

  constructor(private qualityService: QualityService) {}

  getWeatherIcon(weather: WeatherCondition): string {
    return this.qualityService.getWeatherIcon(weather);
  }

  getWeatherClass(weather: WeatherCondition): string {
    return weather.toLowerCase().replace('_', '-');
  }

  formatWeatherName(weather: WeatherCondition): string {
    return weather.replace('_', ' ');
  }

  formatWeatherLabel(weather: WeatherCondition): string {
    const labels: Record<WeatherCondition, string> = {
      SUNNY: 'Excellent conditions for ranked',
      PARTLY_CLOUDY: 'Good conditions for ranked',
      CLOUDY: 'Mixed conditions',
      RAINY: 'Poor conditions',
      STORMY: 'Avoid ranked if possible',
    };
    return labels[weather];
  }

  formatPlayerCount(count: number): string {
    if (count === 0) return 'Unknown';
    return count.toLocaleString();
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
