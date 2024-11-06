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
  private apiUrl = 'https://siwar.ksaa.gov.sa/api/v1/external/public/synonyms';
  private apiKey = 'd9cfaf7-8e92-4f62-908a-5074dc82a4c6';
  private synonymsApiUrl = 'URL_للحصول_على_المرادفات';
  private antonymsApiUrl = 'URL_للحصول_على_الأضداد';
  private translationsApiUrl = 'URL_للحصول_على_الترجمات';

  constructor(private http: HttpClient) {}
  getSynonyms(): Observable<{ word: string; synonym: string }[]> {
    return this.http.get<{ word: string; synonym: string }[]>(this.synonymsApiUrl);
  }

  getAntonyms(): Observable<{ word: string; antonym: string }[]> {
    return this.http.get<{ word: string; antonym: string }[]>(this.antonymsApiUrl);
  }

  getTranslations(): Observable<{ word: string; translation: string }[]> {
    return this.http.get<{ word: string; translation: string }[]>(this.translationsApiUrl);
  }
}
