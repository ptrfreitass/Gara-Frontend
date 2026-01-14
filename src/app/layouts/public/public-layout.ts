import { Component } from '@angular/core';

import { PubHeader } from './pub-header/pub-header';
import { RouterOutlet } from "@angular/router";
import { PubFooter } from './pub-footer/pub-footer';
import { ThemeToggleComponent } from "../../shared/theme/theme";
import { ThemeService } from '../../core/services/theme/theme';

@Component({
  selector: 'app-public',
  imports: [
    PubHeader,
    RouterOutlet,
    PubFooter,
    ThemeToggleComponent
],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class Public {

  constructor(private themeService: ThemeService) {
    this.themeService.initTheme();
  }
}
