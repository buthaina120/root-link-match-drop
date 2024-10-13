import { Routes } from '@angular/router';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';
import { RootsComponent } from './roots/roots/roots.component';

export const routes: Routes = [
  { path: 'synonyms', component: SynonymsComponent },
  { path: 'roots', component: RootsComponent },

  { path: '', redirectTo: '/synonyms', pathMatch: 'full' },
];
