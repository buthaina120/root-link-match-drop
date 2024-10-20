import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';
import { RootsComponent } from './roots/roots/roots.component';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [],
  imports: [    
    BrowserModule, 
    HttpClientModule, 
    SynonymsComponent,
    RootsComponent,
    BrowserAnimationsModule,
    DragDropModule,
    AppComponent],
  providers: [],
})
export class AppModule {}
