import { Component, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';

@Component({
  selector: 'app-scroll-button',
  templateUrl: './scroll-button.component.html',
  styleUrls: ['./scroll-button.component.css']
})
export class ScrollButtonComponent {
  isButtonFixed: boolean = false; // Set to false initially to hide the button

  constructor(private modalService: NgbModal) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.scrollY;

    if (scrollOffset > 500) {
      this.isButtonFixed = true;
    }
  }

  openDialog() {
    const modalRef = this.modalService.open(DialogBoxComponent);
  }
}
