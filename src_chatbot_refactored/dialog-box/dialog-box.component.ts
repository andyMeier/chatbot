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
  showLikertScale: boolean = false;
  questionText: string = "Is this a laptop you would buy?";
  inputPlaceholder: string = "Please type here...";
  isInputValid = false;
  feedbackInput = "";
  selectedOption: string = "";
  likertOptions: string[] = ["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"];
  selectedLikertOption: string = "";

  constructor(
    public activeModal: NgbActiveModal,
    private dialogCommunicationService: DialogCommunicationService
  ) {}

  handleYes() {
    this.selectedOption = 'Yes';
    this.showLikertScale = true;
    this.questionText = "The advisor made me more confident about my decision.";
  }

  handleNo() {
    this.selectedOption = 'No';
    this.showLikertScale = true;
    this.questionText = "The advisor made me more confident about my decision.";
  }

  handleLikertChange(index: number) {
    this.selectedLikertOption = this.likertOptions[index];
    if (this.selectedOption === 'No') {
      this.showFeedback = true;
      this.questionText = "Please describe why you would not buy the laptop.";
    } else {
      const response = JSON.stringify({option: this.selectedOption, likert: this.selectedLikertOption});
      this.dialogCommunicationService.sendResponse(response);
      this.activeModal.close(this.selectedOption);
    }
  }

  handleInput(event: any) {
    this.feedbackInput = event.target.value;
    this.isInputValid = this.feedbackInput.trim() !== '';
  }

  handleSubmit(feedbackInput: HTMLTextAreaElement) {
    const feedback = feedbackInput.value;
    const response = JSON.stringify({option: this.selectedOption, likert: this.selectedLikertOption, feedback});
    this.dialogCommunicationService.sendResponse(response);
    this.activeModal.close(this.selectedOption);
  }
}
