import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'  // هذا يعني أن الخدمة ستكون متاحة في جميع أنحاء التطبيق
})

export class ApiService {
  private apiUrl = 'https://siwar.ksaa.gov.sa/api/';
  private apiKey = '5a0b8a82-f82e-47ab-b8f7-b102435053f9'
 
  constructor(private http: HttpClient) {}
 
  getSynonyms(query: string): Observable<any> {
    const headers = new HttpHeaders({
      apikey: this.apiKey,
    });
 
    return this.http.get(this.apiUrl+'v1/external/public/synonyms' + `?query=${query}`, { headers });
  }
  getTransulation(query: string): Observable<any> {
    const headers = new HttpHeaders({
      apikey: this.apiKey,
    });
 
    return this.http.get(this.apiUrl+'v1/external/public/senses' + `?query=${query}`, { headers });
  }
  getAntonyms(query: string): Observable<any> {
    const headers = new HttpHeaders({
      apikey: this.apiKey,
    });
 
    return this.http.get(this.apiUrl+'v1/external/public/opposites' + `?query=${query}`, { headers });
  }

  getRoot(query: string): Observable<any> {
    const headers = new HttpHeaders({
      apikey: this.apiKey,
    });
 
    return this.http.get(this.apiUrl+'v1/external/public/root' + `?query=${query}`, { headers });
  }


  getLemma(): Observable<any> {
    const headers = new HttpHeaders({
      apikey: this.apiKey,
    });
 
    return this.http.get(this.apiUrl + `lexicalentries/findAll`, { headers });
  }
}
