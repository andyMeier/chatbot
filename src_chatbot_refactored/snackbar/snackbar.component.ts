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
      setTimeout(() => {
        this.isVisible = false;
        this.message = '';
      }, 3000);
    }
  }
}
