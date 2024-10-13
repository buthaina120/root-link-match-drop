import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';
import { RootsComponent } from './roots/roots/roots.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SynonymsComponent, RootsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'siwar-games';
}
