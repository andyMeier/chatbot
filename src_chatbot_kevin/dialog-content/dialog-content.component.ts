import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-content',
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.css']
})
export class DialogContentComponent {
  @Output() yesClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() noClicked: EventEmitter<void> = new EventEmitter<void>();

  handleYes() {
    this.yesClicked.emit();
  }

  handleNo() {
    this.noClicked.emit();
  }
}