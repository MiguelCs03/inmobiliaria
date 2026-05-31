import { Component, Input, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-kpi-chart-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-chart-bar.component.html',
  styleUrls: ['./kpi-chart-bar.component.css'],
})
export class KpiChartBarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() series2: number[] | null = null;
  @Input() label1 = '';
  @Input() label2 = '';
  @Input() colors: string[] = [];
  @Input() horizontal = false;
  @Input() height = 220;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    if (!this.canvas?.nativeElement) return;

    const defaultColors = ['#2563eb', '#0ea5e9', '#8b5cf6', '#059669', '#d97706', '#dc2626', '#14b8a6', '#f43f5e'];
    const bgColors = this.colors.length ? this.colors : this.labels.map((_, i) => defaultColors[i % defaultColors.length]);
    const borderColors = bgColors.map(c => c);

    const datasets: any[] = [{
      label: this.label1 || 'Valor',
      data: this.values,
      backgroundColor: this.horizontal ? bgColors : bgColors[0] || '#2563eb',
      borderColor: this.horizontal ? borderColors : borderColors[0] || '#2563eb',
      borderWidth: 1,
      borderRadius: 4,
    }];

    if (this.series2) {
      datasets.push({
        label: this.label2 || 'Serie 2',
        data: this.series2,
        backgroundColor: '#f43f5e',
        borderColor: '#e11d48',
        borderWidth: 1,
        borderRadius: 4,
      });
    }

    this.chart = new Chart(this.canvas.nativeElement, {
      type: this.horizontal ? 'bar' : 'bar',
      data: { labels: this.labels, datasets },
      options: {
        indexAxis: this.horizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: datasets.length > 1, position: 'top', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
          tooltip: {
            backgroundColor: '#1e293b',
            titleFont: { size: 11 },
            bodyFont: { size: 12 },
            cornerRadius: 6,
            padding: 10,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, color: '#94a3b8' },
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 10 }, color: '#94a3b8' },
          },
        },
      },
    });
  }
}
