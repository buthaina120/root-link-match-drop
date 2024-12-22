import { Routes } from '@angular/router';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';
import { RootsComponent } from './roots/roots/roots.component';
import { GamesListComponent } from './games-list/games-list.component';
import { DropComponent } from './drop/drop.component';

export const routes: Routes = [
  { path: 'games-list', component: GamesListComponent },  // تعريف المسار
  { path: 'synonyms', component: SynonymsComponent },
  { path: 'roots', component: RootsComponent },
  { path: '', component: GamesListComponent },
 {path:'drop',component:DropComponent},
];
