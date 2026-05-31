import { Component, Input, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-kpi-chart-doughnut',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-chart-doughnut.component.html',
  styleUrls: ['./kpi-chart-doughnut.component.css'],
})
export class KpiChartDoughnutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() colors: string[] = [];
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

    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.values,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#ffffff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 12, font: { size: 11 }, color: '#64748b' },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleFont: { size: 11 },
            bodyFont: { size: 12 },
            cornerRadius: 6,
            padding: 10,
            callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}` },
          },
        },
      },
    });
  }
}
