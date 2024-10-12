import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-synonyms',
  standalone: true,
  imports: [],
  templateUrl: './synonyms.component.html',
  styleUrls: ['./synonyms.component.css'],
})
export class SynonymsComponent implements OnInit {
  synonyms: string[] = [];

  constructor(private rest: ApiService) {}

  ngOnInit(): void {
    this.getSynonyms('سعيد').then((synonyms) => {
      this.synonyms = synonyms;
    });
  }

  async getSynonyms(query: string): Promise<string[]> {
    return await firstValueFrom(this.rest.getSynonyms(query));
  }
}
