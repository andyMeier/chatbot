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
  showLikelyScale: boolean = true;
  showConfidenceScale: boolean = false;
  questionText: string = "How likely is it that you would buy this laptop?";
  inputPlaceholder: string = "Please type here...";
  isInputValid = false;
  feedbackInput = "";
  likelyOptions: string[] = ["Extremely likely", "Likely", "Neutral", "Unlikely", "Extremely unlikely"];
  confidenceOptions: string[] = ["Extremely confident", "Moderately confident", "Somewhat confident", "Slightly confident", "Not at all confident"];
  selectedLikelyOption: string = "";
  selectedConfidenceOption: string = "";

  constructor(
    public activeModal: NgbActiveModal,
    private dialogCommunicationService: DialogCommunicationService
  ) {}

  handleLikelyChange(index: number) {
    this.selectedLikelyOption = this.likelyOptions[index];
    this.questionText = "How confident are you in your purchase decision?";
    this.showLikelyScale = false;
    this.showConfidenceScale = true;
  }

  handleConfidenceChange(index: number) {
    this.selectedConfidenceOption = this.confidenceOptions[index];
    if (this.selectedLikelyOption === 'Unlikely') {
      this.showFeedback = true;
      this.questionText = "Please describe why you would rather not buy the laptop.";
    } else if (this.selectedLikelyOption === 'Extremely unlikely') {
      this.showFeedback = true;
      this.questionText = "Please describe why you would not buy the laptop.";
    } else {
      const response = JSON.stringify({likely: this.selectedLikelyOption, confidence: this.selectedConfidenceOption});
      this.dialogCommunicationService.sendResponse(response);
      this.activeModal.close(this.selectedLikelyOption);
    }
  }

  handleInput(event: any) {
    this.feedbackInput = event.target.value;
    this.isInputValid = this.feedbackInput.trim() !== '';
  }

  handleSubmit(feedbackInput: HTMLTextAreaElement) {
    const feedback = feedbackInput.value;
    const response = JSON.stringify({likely: this.selectedLikelyOption, confidence: this.selectedConfidenceOption, feedback});
    this.dialogCommunicationService.sendResponse(response);
    this.activeModal.close(this.selectedLikelyOption);
  }
}
