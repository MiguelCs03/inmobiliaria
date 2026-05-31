import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ClientsKPI {
  total_clients: number;
  avg_budget: number;
  avg_searches: number;
  avg_interactions: number;
  by_segment: { segmento_id: number; segmento_nombre: string; count: number; avg_budget: number }[];
  by_zone: { zona_pref: string; count: number }[];
  by_type: { tipo_prop_pref: string; count: number }[];
}

export interface ClientFilters {
  zona_pref?: string;
  tipo_prop_pref?: string;
  segmento_id?: number;
}

export interface SegmentInput {
  presupuesto_max: number;
  tipo_prop_pref: string;
  habitaciones_pref: number;
  zona_pref: string;
  n_busquedas?: number;
  interacciones?: number;
}

export interface SegmentOutput {
  segmento_id: number;
  segmento_nombre: string;
  descripcion: string;
  recomendaciones: string[];
  modo: string;
}

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = `${environment.apiRestUri}/clients`;

  private get headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Token ${token}` } : {});
  }

  getKPI(filters?: ClientFilters): Observable<ClientsKPI | { error: string }> {
    let params = new HttpParams();
    if (filters?.zona_pref) params = params.set('zona_pref', filters.zona_pref);
    if (filters?.tipo_prop_pref) params = params.set('tipo_prop_pref', filters.tipo_prop_pref);
    if (filters?.segmento_id != null) params = params.set('segmento_id', filters.segmento_id);

    return this.http.get<ClientsKPI | { error: string }>(`${this.baseUrl}/kpi/`, {
      headers: this.headers,
      params,
    });
  }

  segmentClient(data: SegmentInput): Observable<SegmentOutput> {
    return this.http.post<SegmentOutput>(`${this.baseUrl}/segmentar/`, data, {
      headers: this.headers,
    });
  }

  listClients(): Observable<any> {
    return this.http.get(this.baseUrl + '/', { headers: this.headers });
  }
}
