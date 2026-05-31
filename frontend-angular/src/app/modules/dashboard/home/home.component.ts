import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClientsService, ClientsKPI, ClientFilters } from '../../../core/services/clients.service';
import { ValuationService, ValuationsKPI, ValuationFilters } from '../../../core/services/valuation.service';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { KpiChartBarComponent } from '../../../shared/components/kpi-chart-bar/kpi-chart-bar.component';
import { KpiChartDoughnutComponent } from '../../../shared/components/kpi-chart-doughnut/kpi-chart-doughnut.component';

const SEGMENT_COLORS = ['#2563eb', '#0ea5e9', '#8b5cf6', '#059669', '#d97706'];

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    KpiCardComponent,
    KpiChartBarComponent,
    KpiChartDoughnutComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private valuationService = inject(ValuationService);
  private cdr = inject(ChangeDetectorRef);

  userRole: number | null = null;
  roleName = '';

  clientsKPI: ClientsKPI | null = null;
  valuationsKPI: ValuationsKPI | null = null;
  loadingClients = true;
  loadingValuations = true;
  clientsError = '';
  valuationsError = '';

  Math = Math;
  clientFilters: ClientFilters = {};
  valuationFilters: ValuationFilters = {};

  constructor() {
    afterNextRender(() => {
      this.loadClientsKPI();
      this.loadValuationsKPI();
    });
  }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.roleName = this.userRole === 1 ? 'Administrador' : 'Agente Inmobiliario';
  }

  navigateTo(module: string): void {
    const prefix = this.userRole === 1 ? '/admin' : '/agente';
    this.router.navigate([`${prefix}/${module}`]);
  }

  loadClientsKPI(): void {
    this.loadingClients = true;
    this.clientsError = '';
    this.clientsService.getKPI(this.clientFilters).subscribe({
      next: (res) => {
        if ('error' in res) {
          this.clientsError = res.error;
          this.clientsKPI = null;
        } else {
          this.clientsKPI = res;
        }
        this.loadingClients = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.clientsError = 'Error al cargar KPIs de clientes';
        this.loadingClients = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadValuationsKPI(): void {
    this.loadingValuations = true;
    this.valuationsError = '';
    this.valuationService.getKPI(this.valuationFilters).subscribe({
      next: (res) => {
        if ('error' in res) {
          this.valuationsError = res.error;
          this.valuationsKPI = null;
        } else {
          this.valuationsKPI = res;
        }
        this.loadingValuations = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.valuationsError = 'Error al cargar KPIs de valuaciones';
        this.loadingValuations = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyClientFilters(): void {
    this.loadClientsKPI();
  }

  resetClientFilters(): void {
    this.clientFilters = {};
    this.loadClientsKPI();
  }

  applyValuationFilters(): void {
    this.loadValuationsKPI();
  }

  resetValuationFilters(): void {
    this.valuationFilters = {};
    this.loadValuationsKPI();
  }

  get uniqueZones(): string[] {
    if (!this.valuationsKPI?.by_zone) return [];
    return this.valuationsKPI.by_zone.map(z => z.label).sort();
  }

  get uniqueTypes(): string[] {
    if (!this.valuationsKPI?.by_type) return [];
    return this.valuationsKPI.by_type.map(t => t.label).sort();
  }

  get uniqueClientZones(): string[] {
    if (!this.clientsKPI?.by_zone) return [];
    return this.clientsKPI.by_zone.map(z => z.zona_pref).filter(Boolean).sort();
  }

  get uniqueClientTypes(): string[] {
    if (!this.clientsKPI?.by_type) return [];
    return this.clientsKPI.by_type.map(t => t.tipo_prop_pref).filter(Boolean).sort();
  }

  get segmentLabels(): string[] {
    return this.clientsKPI?.by_segment.map(s => s.segmento_nombre) || [];
  }

  get segmentValues(): number[] {
    return this.clientsKPI?.by_segment.map(s => s.count) || [];
  }

  get zoneLabels(): string[] {
    return this.valuationsKPI?.by_zone.map(z => z.label) || [];
  }

  get zoneCounts(): number[] {
    return this.valuationsKPI?.by_zone.map(z => z.count) || [];
  }

  get zonePrices(): number[] {
    return this.valuationsKPI?.by_zone.map(z => Math.round(z.avg_price)) || [];
  }

  get typeLabels(): string[] {
    return this.valuationsKPI?.by_type.map(t => t.label) || [];
  }

  get typeCounts(): number[] {
    return this.valuationsKPI?.by_type.map(t => t.count) || [];
  }

  get roomsLabels(): string[] {
    return this.valuationsKPI?.by_rooms.map(r => r.label.toString()) || [];
  }

  get roomsCounts(): number[] {
    return this.valuationsKPI?.by_rooms.map(r => r.count) || [];
  }

  get roomsPrices(): number[] {
    return this.valuationsKPI?.by_rooms.map(r => Math.round(r.avg_price)) || [];
  }

  clientZoneLabels(): string[] {
    return this.clientsKPI?.by_zone.map(z => z.zona_pref).filter(Boolean) || [];
  }

  clientZoneCounts(): number[] {
    return this.clientsKPI?.by_zone.map(z => z.count) || [];
  }

  formatCurrency(val: number): string {
    return '$' + val.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatNumber(val: number): string {
    return val.toLocaleString('es-BO');
  }
}
