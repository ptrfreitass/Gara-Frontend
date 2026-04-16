// src/app/core/services/seo.service.ts
import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title
  ) {}

  updateTitle(title: string): void {
    this.title.setTitle(`${title} | GARA`);
  }

  updateMetaTags(tags: { name: string; content: string }[]): void {
    tags.forEach(tag => {
      this.meta.updateTag({ name: tag.name, content: tag.content });
    });
  }
}