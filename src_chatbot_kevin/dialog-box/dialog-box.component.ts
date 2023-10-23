import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogCommunicationService } from '../dialog-communication.service';

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})

export class DialogBoxComponent {
  @Input() dialogTitle: string = "";
  showFeedback: boolean = false; // Add this line
  questionText: string = "Is this a laptop you would buy?"; // Add this line
  inputPlaceholder: string = "Please describe why you would not buy the laptop"; // Add this line

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
    this.showFeedback = true; // Add this line
    this.questionText = "Please describe why you would not buy the laptop."; // Add this line
    this.inputPlaceholder = "Please type here..."; // Add this line
  }

  handleSubmit(feedback: string) {
    // Handle feedback submission
    console.log(feedback);
    // Send 'feedback' to the DialogCommunicationService
    this.dialogCommunicationService.sendResponse(feedback);
    this.activeModal.close('No');
  }
}
