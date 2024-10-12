import { Routes } from '@angular/router';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';

export const routes: Routes = [
  { path: 'synonyms', component: SynonymsComponent },
  { path: '', redirectTo: '/synonyms', pathMatch: 'full' },
];
