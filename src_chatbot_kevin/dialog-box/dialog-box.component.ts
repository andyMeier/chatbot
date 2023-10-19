import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent {
  @Input() dialogTitle: string = "";

  constructor(public activeModal: NgbActiveModal) {}

  handleYes() {
    // Handle 'Yes' button click
    // You can perform actions or close the modal if needed
    this.activeModal.close('Yes');
  }

  handleNo() {
    // Handle 'No' button click
    // You can perform actions or close the modal if needed
    this.activeModal.close('No');
  }
}
