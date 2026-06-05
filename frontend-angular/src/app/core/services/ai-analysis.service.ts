import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AmbienteResult {
  clase: string;
  confianza: number;
  probabilidades: { [key: string]: number };
}

export interface ConservacionResult {
  clase: string;
  confianza: number;
  probabilidades: { [key: string]: number };
}

export interface AiAnalysisResponse {
  ambiente: AmbienteResult | null;
  conservacion: ConservacionResult | null;
  modo: string;
}

@Injectable({ providedIn: 'root' })
export class AiAnalysisService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiRestUri}/tf`;

  analyzeImageUrl(url: string): Observable<AiAnalysisResponse> {
    return this.http.post<AiAnalysisResponse>(`${this.baseUrl}/predict-url/`, { url });
  }
}
