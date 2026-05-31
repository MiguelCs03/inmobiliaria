import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ValuationsKPI {
  total_properties: number;
  avg_price: number;
  avg_price_m2: number;
  price_range: { min: number; max: number };
  avg_surface: { total: number; construida: number };
  avg_rooms: number;
  avg_bathrooms: number;
  by_zone: { label: string; count: number; avg_price: number }[];
  by_type: { label: string; count: number; avg_price: number }[];
  by_rooms: { label: number; count: number; avg_price: number }[];
}

export interface ValuationFilters {
  zona?: string;
  tipo_propiedad?: string;
}

export interface PredictInput {
  metros_cuad: number;
  habitaciones: number;
  banos: number;
  anio_construc: number;
  barrio: string;
  ciudad?: string;
  anillo_vial?: number;
  tipo_propiedad?: string;
  tipo_operacion?: string;
  propiedad_id?: string;
}

export interface PredictOutput {
  precio_estimado: number;
  rango_min: number;
  rango_max: number;
  modo: string;
}

@Injectable({ providedIn: 'root' })
export class ValuationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = `${environment.apiRestUri}/valuations`;

  private get headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Token ${token}` } : {});
  }

  getKPI(filters?: ValuationFilters): Observable<ValuationsKPI | { error: string }> {
    let params = new HttpParams();
    if (filters?.zona) params = params.set('zona', filters.zona);
    if (filters?.tipo_propiedad) params = params.set('tipo_propiedad', filters.tipo_propiedad);

    return this.http.get<ValuationsKPI | { error: string }>(`${this.baseUrl}/kpi/`, {
      headers: this.headers,
      params,
    });
  }

  predict(data: PredictInput): Observable<PredictOutput> {
    return this.http.post<PredictOutput>(`${this.baseUrl}/predict/`, data, {
      headers: this.headers,
    });
  }
}
