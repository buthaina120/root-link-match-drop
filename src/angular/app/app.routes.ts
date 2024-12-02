import { Routes } from '@angular/router';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';
import { RootsComponent } from './roots/roots/roots.component';
import { GamesListComponent } from './games-list/games-list.component';
import { LinkComponent } from './link/link.component';

export const routes: Routes = [
  { path: 'synonyms', component: SynonymsComponent },
  { path: 'roots', component: RootsComponent },
  { path: '', component: GamesListComponent },
  { path: 'link', component: LinkComponent },

];
