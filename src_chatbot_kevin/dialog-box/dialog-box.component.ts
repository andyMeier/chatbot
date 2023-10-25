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
  showFeedback: boolean = false;
  questionText: string = "Is this a laptop you would buy?";
  inputPlaceholder: string = "Please type here...";
  isInputValid = false;
  feedbackInput = "";

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
    this.showFeedback = true;
    this.questionText = "Please describe why you would not buy the laptop.";
  }

  handleInput(event: any) {
    this.feedbackInput = event.target.value;
    this.isInputValid = this.feedbackInput.trim() !== '';
  }

  handleSubmit(feedback: string) {
    // Send 'feedback' to the DialogCommunicationService
    this.dialogCommunicationService.sendResponse(feedback);
    this.activeModal.close('No');
  }
}
