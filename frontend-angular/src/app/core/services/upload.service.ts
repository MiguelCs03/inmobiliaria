import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);

  uploadImage(file: File): Observable<{ success: boolean; url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadUrl = environment.apiRestUri.replace(/\/ia$/, '/gestion/upload');
    
    return this.http.post<{ success: boolean; url: string; message: string }>(
      uploadUrl,
      formData
    );
  }
}
