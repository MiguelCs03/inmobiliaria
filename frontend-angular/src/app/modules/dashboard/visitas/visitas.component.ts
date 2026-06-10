import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VisitaService, Visita } from '../../../core/services/visita.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-visitas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './visitas.component.html',
  styleUrls: ['./visitas.component.css']
})
export class VisitasComponent implements OnInit {
  private visitaService = inject(VisitaService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  visitas: Visita[] = [];
  filteredVisitas: Visita[] = [];
  
  // Lista de agentes única para el filtro del Admin
  agentesFilterList: { id: number; nombreCompleto: string }[] = [];

  // Info de rol actual
  userRole: number | null = null;
  userId: string | null = null;

  // Filtros interactivos
  searchTerm = '';
  filterStatus = 'all';
  filterAgent = 'all';

  // Estados de carga y feedback
  loading = false;
  successMessage = '';
  errorMessage = '';
  updatingStatus = false;

  // Detail panel / drawer
  selectedVisita: Visita | null = null;
  showDetail = false;

  // Métricas rápidas (KPIs)
  kpiTotal = 0;
  kpiPendientes = 0;
  kpiPagadas = 0;
  kpiCompletadas = 0;

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userId = this.authService.getUserId();
    this.loadVisitas();
  }

  loadVisitas(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.visitaService.getVisitas().subscribe({
      next: (data) => {
        this.loading = false;
        
        // Mapear y ordenar por fecha (más recientes primero)
        const allVisits = [...data].sort(
          (a, b) => new Date(b.fechaVisita).getTime() - new Date(a.fechaVisita).getTime()
        );

        // Filtrado por Rol en frontend
        if (this.userRole === 1) {
          // Admin ve todo
          this.visitas = allVisits;
        } else if (this.userRole === 2) {
          // Agente solo ve el personal
          const loggedInId = Number(this.userId);
          this.visitas = allVisits.filter(v => 
            v.empleadoId === loggedInId || 
            v.empleado?.usuarioId === loggedInId
          );
        } else {
          this.visitas = [];
        }

        // Extraer lista única de agentes si somos Admin
        if (this.userRole === 1) {
          const uniqueAgentsMap = new Map<number, string>();
          this.visitas.forEach(v => {
            if (v.empleado) {
              const name = `${v.empleado.nombres} ${v.empleado.apellidos}`.trim();
              uniqueAgentsMap.set(v.empleadoId, name);
            }
          });
          this.agentesFilterList = Array.from(uniqueAgentsMap.entries()).map(([id, nombreCompleto]) => ({
            id,
            nombreCompleto
          }));
        }

        this.calculateKpis();
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar visitas:', err);
        this.errorMessage = 'No se pudieron recuperar las visitas. Verifique el estado del servidor.';
        this.cdr.detectChanges();
      }
    });
  }

  calculateKpis(): void {
    this.kpiTotal = this.visitas.length;
    this.kpiPendientes = this.visitas.filter(v => v.estado.toLowerCase() === 'pendiente').length;
    this.kpiPagadas = this.visitas.filter(v => v.estado.toLowerCase() === 'pagada').length;
    this.kpiCompletadas = this.visitas.filter(v => v.estado.toLowerCase() === 'completada').length;
  }

  applyFilters(): void {
    let result = [...this.visitas];

    // Filtro por Estado
    if (this.filterStatus !== 'all') {
      result = result.filter(v => v.estado.toLowerCase() === this.filterStatus.toLowerCase());
    }

    // Filtro por Agente (solo para Admin)
    if (this.userRole === 1 && this.filterAgent !== 'all') {
      const agentId = Number(this.filterAgent);
      result = result.filter(v => v.empleadoId === agentId);
    }

    // Filtro por Buscador (Cliente, Dirección o ID)
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(v => {
        const clientName = v.cliente?.nombres.toLowerCase() || '';
        const address = this.getDireccionReferencia(v.propiedad?.ubicacion).toLowerCase();
        const visitId = v.id.toString();
        const agentName = v.empleado ? `${v.empleado.nombres} ${v.empleado.apellidos}`.toLowerCase() : '';
        
        return clientName.includes(term) || 
               address.includes(term) || 
               visitId.includes(term) || 
               agentName.includes(term);
      });
    }

    this.filteredVisitas = result;
    this.cdr.detectChanges();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  openDetail(visita: Visita): void {
    this.selectedVisita = visita;
    this.showDetail = true;
    this.cdr.detectChanges();
  }

  closeDetail(): void {
    this.showDetail = false;
    // Pequeño delay para limpiar la visita una vez se cierre la animación
    setTimeout(() => {
      this.selectedVisita = null;
      this.cdr.detectChanges();
    }, 300);
  }

  cambiarEstado(nuevoEstado: string): void {
    if (!this.selectedVisita) return;
    
    this.updatingStatus = true;
    this.cdr.detectChanges();

    this.visitaService.updateVisita(this.selectedVisita.id, nuevoEstado).subscribe({
      next: (res) => {
        this.updatingStatus = false;
        if (res.success) {
          this.showSuccess(`¡Visita #${this.selectedVisita?.id} actualizada a ${nuevoEstado}!`);
          this.loadVisitas();
          this.closeDetail();
        } else {
          this.showError(res.message || 'Error al actualizar el estado de la visita.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.updatingStatus = false;
        console.error('Error al actualizar visita:', err);
        this.showError('No se pudo completar el cambio de estado por un error de red.');
        this.cdr.detectChanges();
      }
    });
  }

  // --- Helpers de visualización ---
  getDireccionReferencia(ubicacionJsonStr: string | null | undefined): string {
    if (!ubicacionJsonStr) return 'Sin dirección registrada';
    if (!ubicacionJsonStr.startsWith('{')) return ubicacionJsonStr;
    try {
      const parsed = JSON.parse(ubicacionJsonStr);
      return parsed.direccion || 'Sin dirección';
    } catch {
      return ubicacionJsonStr;
    }
  }

  getStatusClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'badge-success';
      case 'pagada':
        return 'badge-info';
      case 'pendiente':
        return 'badge-warning';
      case 'cancelada':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }) + ' Hrs';
    } catch {
      return '';
    }
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 4500);
  }

  showError(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 4500);
  }
}
