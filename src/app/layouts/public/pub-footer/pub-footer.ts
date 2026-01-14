import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-pub-footer',
  imports: [
    RouterLink
  ],
  templateUrl: './pub-footer.html',
  styleUrl: './pub-footer.scss',
})
export class PubFooter {
  currentYear = new Date().getFullYear();
}
