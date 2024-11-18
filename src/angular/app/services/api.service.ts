import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WordService {
  // تعريف الخدمات والوظائف هنا
}
export class ApiService {
  private apiUrl = 'https://siwar.ksaa.gov.sa/api/v1/external/public';
  private apiKey = 'd9cfaf7-8e92-4f62-908a-5074dc82a4c6'
 
  constructor(private http: HttpClient) {}
 
  getSynonyms(query: string): Observable<any> {
    const headers = new HttpHeaders({
      apikey: this.apiKey,
    });
 
    return this.http.get(this.apiUrl+'/synonyms' + `?query=${query}`, { headers });
  }
 
 
  getRoot(query: string): Observable<any> {
    const headers = new HttpHeaders({
      apikey: this.apiKey,
    });
 
    return this.http.get(this.apiUrl+'/root' + `?query=${query}`, { headers });
  }
}
