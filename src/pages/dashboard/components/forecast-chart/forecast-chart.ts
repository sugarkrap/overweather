import { ChangeDetectionStrategy, Component, Input, computed, signal, OnChanges } from '@angular/core';
import { QualityPrediction, WeatherCondition } from '../../../../models/models';
import { QualityService } from '../../../../services/quality.service';

interface ChartPoint {
  x: number;
  y: number;
  value: number;
  label: string;
  icon: string;
  isCurrent: boolean;
  isPast: boolean;
}

@Component({
  selector: 'ow-forecast-chart',
  standalone: true,
  templateUrl: './forecast-chart.html',
  styleUrl: './forecast-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForecastChart implements OnChanges {
  @Input() data: QualityPrediction[] = [];

  private readonly W = 960;
  private readonly H = 160;
  private readonly PAD_X = 24;
  private readonly PAD_TOP = 20;
  private readonly PAD_BOTTOM = 40;

  readonly viewBox = `0 0 ${this.W} ${this.H}`;
  points: ChartPoint[] = [];
  linePath = '';
  fillPath = '';

  constructor(private qualityService: QualityService) {}

  ngOnChanges(): void {
    this.computeChart();
  }

  private computeChart(): void {
    if (this.data.length === 0) {
      this.points = [];
      this.linePath = '';
      this.fillPath = '';
      return;
    }

    const chartW = this.W - this.PAD_X * 2;
    const chartH = this.H - this.PAD_TOP - this.PAD_BOTTOM;

    const values = this.data.map(d => d.overallScore);
    const minVal = Math.max(0, Math.min(...values) - 5);
    const maxVal = Math.min(100, Math.max(...values) + 5);
    const range = maxVal - minVal || 1;

    const getX = (i: number) =>
      this.data.length <= 1
        ? this.PAD_X + chartW / 2
        : this.PAD_X + (i / (this.data.length - 1)) * chartW;

    const getY = (v: number) =>
      this.PAD_TOP + (1 - (v - minVal) / range) * chartH;

    this.points = this.data.map((d, i) => {
      const ts = new Date(d.timestamp);
      const now = new Date();
      return {
        x: getX(i),
        y: getY(d.overallScore),
        value: d.overallScore,
        label: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: this.qualityService.getWeatherIcon(d.weather),
        isCurrent: ts.getHours() === now.getHours() && ts.getDate() === now.getDate(),
        isPast: ts < now,
      };
    });

    const rawPoints = this.points.map(p => ({ x: p.x, y: p.y }));
    this.linePath = this.buildCurvePath(rawPoints);
    this.fillPath = this.linePath
      + ` L ${rawPoints[rawPoints.length - 1].x} ${this.H - this.PAD_BOTTOM}`
      + ` L ${rawPoints[0].x} ${this.H - this.PAD_BOTTOM} Z`;
  }

  private buildCurvePath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return `M ${pts[0]?.x ?? 0} ${pts[0]?.y ?? 0}`;
    const parts = [`M ${pts[0].x} ${pts[0].y}`];
    const tension = 0.35;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      parts.push(`C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`);
    }
    return parts.join(' ');
  }
}
