import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SynonymsComponent } from './synonyms/synonyms/synonyms.component';
import { RootsComponent } from './roots/roots/roots.component';
import { AppComponent } from './app.component';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ApiService } from './services/api.service';
import { DragDropModule } from 'primeng/dragdrop'; // استيراد DragDropModule
import { CommonModule } from '@angular/common';    // استيراد CommonModule




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
    TooltipModule,
    FormsModule,
    CommonModule,
    DragDropModule,
    ButtonModule,
  ],
  providers: [],
})
export class AppModule {}
