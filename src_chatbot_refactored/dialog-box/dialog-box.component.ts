import { Component, Input, Renderer2, Inject, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogCommunicationService } from '../dialog-communication.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})

export class DialogBoxComponent implements OnInit, OnDestroy {
  @Input() dialogTitle: string = "";
  showFeedback: boolean = false;
  showLikelyScale: boolean = true;
  showConfidenceScale: boolean = false;
  questionText: string = "How likely is it that you would buy this laptop?";
  inputPlaceholder: string = "Please type here...";
  isInputValid = false;
  feedbackInput = "";
  likelyOptions: string[] = ["Extremely unlikely", "Unlikely", "Neutral", "Likely", "Extremely likely"];
  confidenceOptions: string[] = ["Not at all confident", "Slightly confident", "Somewhat confident", "Moderately confident", "Extremely confident"];
  selectedLikelyOption: string = "";
  selectedConfidenceOption: string = "";

  constructor(
    public activeModal: NgbActiveModal,
    private dialogCommunicationService: DialogCommunicationService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.renderer.setStyle(this.document.body, 'overflow', 'auto');
      this.renderer.setStyle(this.document.body, 'padding-right', '0');
    }, 0);
  }

  ngOnDestroy(): void {
    this.renderer.removeStyle(this.document.body, 'overflow');
    this.renderer.removeStyle(this.document.body, 'padding-right');
  }

  handleLikelyChange(index: number) {
    this.selectedLikelyOption = this.likelyOptions[index];
    this.questionText = "How confident are you in your decision?";
    this.showLikelyScale = false;
    this.showConfidenceScale = true;
  }

  handleConfidenceChange(index: number) {
    this.selectedConfidenceOption = this.confidenceOptions[index];
    if (this.selectedLikelyOption === 'Extremely unlikely' || this.selectedLikelyOption === 'Unlikely') {
      this.showFeedback = true;
      this.questionText = "Please describe why you would rather not buy the laptop.";
    } else {
      const response = JSON.stringify({ likely: this.selectedLikelyOption, confidence: this.selectedConfidenceOption });
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
    const response = JSON.stringify({ likely: this.selectedLikelyOption, confidence: this.selectedConfidenceOption, feedback });
    this.dialogCommunicationService.sendResponse(response);
    this.activeModal.close(this.selectedLikelyOption);
  }
}
