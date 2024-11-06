import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';
import { RootsComponent } from './roots/roots/roots.component';
import { AppComponent } from './app.component';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [],
  imports: [    
    BrowserModule, 
    HttpClientModule, 
    SynonymsComponent,
    RootsComponent,
    BrowserAnimationsModule,
    DragDropModule,
    AppComponent,
    CardModule,
    TooltipModule
  ],
  providers: [],
})
export class AppModule {}
