import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogCommunicationService } from '../dialog-communication.service'; // Update this import path

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent {
  @Input() dialogTitle: string = "";

  constructor(
    public activeModal: NgbActiveModal,
    private dialogCommunicationService: DialogCommunicationService
  ) {}

  handleYes() {
    // Handle 'Yes' button click
    this.dialogCommunicationService.sendResponse('Yes');
    this.activeModal.close('Yes');
  }

  handleNo() {
    // Handle 'No' button click
    this.dialogCommunicationService.sendResponse('No');
    this.activeModal.close('No');
  }
}
