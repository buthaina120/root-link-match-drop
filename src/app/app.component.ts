import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SynonymsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'siwar-games';
}
