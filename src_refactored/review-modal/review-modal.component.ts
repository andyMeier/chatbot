import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface Review {
  reviewTitle: string;
  reviewText: string;
  reviewRating: number;
  reviewDate: string;
  // Add more fields as needed
}

@Component({
  selector: 'app-review-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{review.reviewTitle}}</h5>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">×</span>
      </button>
    </div>
    <div class="modal-body">
      <p>{{review.reviewText}}</p>
      <p><strong>Rating: </strong>
        <span *ngFor="let ii of [1,2,3,4,5]; let i = index">
          <img *ngIf="review.reviewRating>=ii" src="assets/star_full.png" width="3%" alt="full star">
          <img *ngIf="review.reviewRating<ii-0.5" src="assets/star_empty.png" width="3%" alt="empty star">
          <img *ngIf="review.reviewRating>=ii-0.5 && review.reviewRating<ii" src="assets/star_half.png"
            width="3%" alt="half star">
        </span>
      </p>
      <p><strong>Date:</strong> {{review.reviewDate}}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `,
})
export class ReviewModalComponent {
  @Input() review: Review;

  constructor(public activeModal: NgbActiveModal) {
    this.review = {
      reviewTitle: '',
      reviewText: '',
      reviewRating: 0,
      reviewDate: ''
      // Initialize other fields as needed
    };
  }
}
