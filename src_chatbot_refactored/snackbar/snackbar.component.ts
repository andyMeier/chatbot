import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-snackbar',
  template: `
    <div class="snackbar" [ngClass]="{'show': isVisible}">{{ message }}</div>
  `,
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent {
  @Input() message: string = '';
  isVisible: boolean = false;

  ngOnChanges(): void {
    if (this.message) {
      this.isVisible = true;
      setTimeout(() => this.isVisible = false, 3000); // Hide after 3 seconds (0.3s for slide in + 2.7s for display)
    }
  }
}
