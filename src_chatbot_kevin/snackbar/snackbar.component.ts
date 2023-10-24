import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent implements OnInit {
  @Input() message: string = '';

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.message = '';
    }, 3000); // The message will disappear after 3 seconds
  }
}