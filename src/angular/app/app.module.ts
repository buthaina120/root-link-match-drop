import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';
import { RootsComponent } from './roots/roots/roots.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { AntonymsComponent } from './antonyms/antonyms/antonyms.component';
//import { TranslationsComponent } from './translations/translations/translations.component';
@NgModule({
  declarations: [
    
    ],
  imports: [BrowserModule, HttpClientModule, SynonymsComponent,RootsComponent, BrowserAnimationsModule],
  providers: []
})
export class AppModule {}
