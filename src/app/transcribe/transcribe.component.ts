import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-transcribe',
  imports: [CommonModule],
  templateUrl: './transcribe.component.html',
  styleUrl: './transcribe.component.css',
})
export class TranscribeComponent {
  audioFile: File | null = null;
  audioUrl: string = '';
  isTranscribing = false;
  transcriptResult: any = null;
  error: string | null = null;

  supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];
  selectedLanguage = 'en';
}
