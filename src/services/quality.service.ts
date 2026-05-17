import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { QualityPrediction, WeatherCondition } from '../models/models';

@Injectable({ providedIn: 'root' })
export class QualityService {
  private readonly baseURL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getCurrent(): Observable<QualityPrediction> {
    return this.http.get<QualityPrediction>(`${this.baseURL}/quality/current`);
  }

  getForecast(hours = 10, before = 5): Observable<QualityPrediction[]> {
    return this.http.get<QualityPrediction[]>(`${this.baseURL}/quality/forecast?hours=${hours}&before=${before}`);
  }

  getWeatherIcon(weather: WeatherCondition): string {
    const icons: Record<WeatherCondition, string> = {
      SUNNY: '☀️',
      PARTLY_CLOUDY: '⛅',
      CLOUDY: '☁️',
      RAINY: '🌧️',
      STORMY: '⛈️',
    };
    return icons[weather];
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#a855f7';
    if (score >= 40) return '#fbbf24';
    if (score >= 20) return '#f97316';
    return '#f87171';
  }

  scoreToWeather(score: number): WeatherCondition {
    if (score >= 80) return 'SUNNY';
    if (score >= 60) return 'PARTLY_CLOUDY';
    if (score >= 40) return 'CLOUDY';
    if (score >= 20) return 'RAINY';
    return 'STORMY';
  }
}
