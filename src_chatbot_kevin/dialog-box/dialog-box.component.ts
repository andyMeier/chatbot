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
  selectedOption: string = "";

  constructor(
    public activeModal: NgbActiveModal,
    private dialogCommunicationService: DialogCommunicationService
  ) {}

  handleYes() {
    this.selectedOption = 'Yes';
    // Directly send the response to the DialogCommunicationService
    const response = JSON.stringify({option: this.selectedOption, feedback: "User selected 'Yes'."});
    this.dialogCommunicationService.sendResponse(response);
    this.activeModal.close(this.selectedOption);
  }

  handleNo() {
    this.selectedOption = 'No';
    this.showFeedback = true;
    this.questionText = "Please describe why you would not buy the laptop.";
  }

  handleInput(event: any) {
    this.feedbackInput = event.target.value;
    this.isInputValid = this.feedbackInput.trim() !== '';
  }

  handleSubmit(feedbackInput: HTMLTextAreaElement) {
    const feedback = feedbackInput.value;
    // Convert 'feedback' and 'selectedOption' into a JSON string
    const response = JSON.stringify({option: this.selectedOption, feedback});
    
    // Send the JSON string to the DialogCommunicationService
    this.dialogCommunicationService.sendResponse(response);
    this.activeModal.close(this.selectedOption);
  }
}
