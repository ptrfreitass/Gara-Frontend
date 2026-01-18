import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pri-footer',
  imports: [
    RouterLink    
  ],
  templateUrl: './pri-footer.html',
  styleUrl: './pri-footer.scss',
})
export class PriFooter {

  currentYear = new Date().getFullYear();

}
