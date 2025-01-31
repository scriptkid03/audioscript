import { Routes } from '@angular/router';
import { TranscribeComponent } from './transcribe/transcribe.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'transcribe', component: TranscribeComponent },
  { path: 'about', component: AboutComponent },
];
