import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  teamMembers = [
    {
      name: 'Emma Rodriguez',
      role: 'Founder & CEO',
      bio: 'AI and speech recognition expert with 10+ years of experience.',
      image: 'assets/img/emma.jpg',
    },
    {
      name: 'Alex Chen',
      role: 'Chief Technology Officer',
      bio: 'Machine learning specialist with background in natural language processing.',
      image: 'assets/img/alex.jpeg',
    },
    {
      name: 'Sarah Kim',
      role: 'Head of Product',
      bio: 'User experience designer passionate about making technology accessible.',
      image: 'assets/img/sarah.jpg',
    },
  ];

  milestones = [
    { year: 2020, event: 'Company Founded' },
    { year: 2021, event: 'First AI Transcription Algorithm' },
    { year: 2022, event: 'Launched Public Beta' },
    { year: 2023, event: 'Reached 100,000 Users' },
  ];
}
