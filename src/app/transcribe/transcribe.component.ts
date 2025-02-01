import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { TranscriptionService } from './transcription.service';
import { catchError, throwError } from 'rxjs';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-transcribe',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './transcribe.component.html',
  styleUrl: './transcribe.component.css',
  providers: [TranscriptionService],
  animations: [
    trigger('buttonState', [
      state('idle', style({ transform: 'scale(1)' })),
      state('active', style({ transform: 'scale(0.95)' })),
      transition('idle => active', animate('100ms ease-in')),
      transition('active => idle', animate('100ms ease-out')),
    ]),
  ],
})
export class TranscribeComponent {
  audioFile: File | null = null;
  audioUrl: string = '';
  isTranscribing = false;
  transcriptResult: { text: string; formatted_text: string } | null = null;
  error: string | null = null;
  maxFileSize = 100 * 1024 * 1024; // 100MB
  isYouTubeUrl = false;

  supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];
  selectedLanguage = 'en';
  supportedFormats = ['.mp3', '.wav', '.mp4', '.m4a'];
  supportedDirectUrlDomains = [
    'drive.google.com',
    'dropbox.com',
    's3.amazonaws.com',
  ]; // Add more as needed

  constructor(private transcriptionService: TranscriptionService) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred during transcription. ';

    if (error.status === 500) {
      errorMessage +=
        'Server error. Please ensure the URL is directly downloadable. For YouTube videos, please download the audio first.';
    } else if (error.status === 413) {
      errorMessage += 'File size too large. Please upload a smaller file.';
    } else if (error.status === 415) {
      errorMessage +=
        'Unsupported file format. Please use MP3, WAV, MP4, or M4A.';
    } else if (error.status === 0) {
      errorMessage += 'Network error. Please check your connection.';
    } else {
      errorMessage += error.message || 'Unknown error occurred.';
    }

    return throwError(() => new Error(errorMessage));
  }

  private isYouTubeVideo(url: string): boolean {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/');
  }

  onUrlInput() {
    this.isYouTubeUrl = this.isYouTubeVideo(this.audioUrl);
    if (this.isYouTubeUrl) {
      this.error =
        'YouTube URLs cannot be processed directly. Please download the audio file first and then upload it.';
    } else {
      this.error = null;
    }
  }

  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);

      // Check if it's a YouTube URL
      if (this.isYouTubeVideo(url)) {
        return false;
      }

      // For other URLs, check if they're from supported domains
      const domain = urlObj.hostname;
      const isSupported = this.supportedDirectUrlDomains.some((d) =>
        domain.includes(d)
      );

      if (!isSupported) {
        this.error =
          'Please provide a direct download URL from a supported service (Google Drive, Dropbox, S3) or upload a file directly';
        return false;
      }

      // Check file extension
      const extension = url.split('.').pop()?.toLowerCase();
      if (!extension || !this.supportedFormats.includes('.' + extension)) {
        this.error = `URL must point to a supported audio format: ${this.supportedFormats.join(
          ', '
        )}`;
        return false;
      }

      return true;
    } catch {
      this.error = 'Please provide a valid URL';
      return false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.audioFile = file;
      this.audioUrl = ''; // Clear URL when file is selected
    }
  }

  async startTranscription() {
    if (!this.audioFile && !this.audioUrl) {
      this.error = 'Please provide either an audio file or URL';
      return;
    }

    this.isTranscribing = true;
    this.error = null;
    this.transcriptResult = null;

    try {
      if (this.audioFile) {
        this.transcriptionService
          .transcribeFile(this.audioFile, this.selectedLanguage)
          .subscribe({
            next: (result) => {
              this.transcriptResult = result;
              this.isTranscribing = false;
            },
            error: (error) => {
              this.error = error.message;
              this.isTranscribing = false;
            },
          });
      } else if (this.audioUrl) {
        this.transcriptionService
          .transcribeUrl(this.audioUrl, this.selectedLanguage)
          .subscribe({
            next: (result) => {
              this.transcriptResult = result;
              this.isTranscribing = false;
            },
            error: (error) => {
              this.error = error.message;
              this.isTranscribing = false;
            },
          });
      }
    } catch (err: any) {
      this.error = err.message;
      this.isTranscribing = false;
    }
  }

  copyButtonState = 'idle';
  downloadButtonState = 'idle';
  copyText = 'Copy';

  async copyTranscript() {
    if (this.transcriptResult) {
      this.copyButtonState = 'active';
      try {
        await navigator.clipboard.writeText(
          this.transcriptResult.formatted_text
        );
        this.copyText = 'Copied!';
        setTimeout(() => {
          this.copyText = 'Copy';
        }, 2000);
      } catch (err) {
        this.copyText = 'Failed to copy';
      }
      setTimeout(() => {
        this.copyButtonState = 'idle';
      }, 200);
    }
  }

  downloadTranscript() {
    if (this.transcriptResult) {
      this.downloadButtonState = 'active';
      const blob = new Blob([this.transcriptResult.formatted_text], {
        type: 'text/plain',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transcript.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setTimeout(() => {
        this.downloadButtonState = 'idle';
      }, 200);
    }
  }
}
