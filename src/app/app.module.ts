import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';
import { RootsComponent } from './roots/roots/roots.component';

@NgModule({
  declarations: [],
  imports: [BrowserModule, HttpClientModule, SynonymsComponent,RootsComponent],
  providers: [],
})
export class AppModule {}
