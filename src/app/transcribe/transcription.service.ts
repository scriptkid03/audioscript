import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TranscriptionResult {
  text: string;
  formatted_text: string;
}

@Injectable()
export class TranscriptionService {
  private apiUrl = environment.apiUrl; // This will be 'http://localhost:8000'

  constructor(private http: HttpClient) {}

  transcribeFile(
    file: File,
    language: string
  ): Observable<TranscriptionResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    return this.http.post<TranscriptionResult>(
      `${this.apiUrl}/transcribe/file`,
      formData
    );
  }

  transcribeUrl(
    url: string,
    language: string
  ): Observable<TranscriptionResult> {
    return this.http.post<TranscriptionResult>(
      `${this.apiUrl}/transcribe/url`,
      {
        url,
        language,
      }
    );
  }
}
