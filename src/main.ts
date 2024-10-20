import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './angular/app/app.component';
import { appConfig } from './angular/app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
