import { Component, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';

@Component({
  selector: 'app-scroll-button',
  templateUrl: './scroll-button.component.html',
  styleUrls: ['./scroll-button.component.css']
})
export class ScrollButtonComponent {
  isButtonFixed: boolean = true;
  originalPosition: { top: string, right: string };

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private modalService: NgbModal
  ) {
    this.originalPosition = {
      top: this.el.nativeElement.style.top,
      right: this.el.nativeElement.style.right
    };
  }

  @HostListener('window:scroll', [])
  @HostListener('window:scroll', [])
  onWindowScroll() {
  const scrollOffset = window.scrollY;
  const offsetTop = 180; // Set the desired offset from the top
  const offsetRight = 20; // Set the desired offset from the right

  if (scrollOffset > 200) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'fixed');
    this.renderer.setStyle(this.el.nativeElement, 'top', `${offsetTop}px`);
    this.renderer.setStyle(this.el.nativeElement, 'right', `${offsetRight}px`);
    this.isButtonFixed = true;
  } else if (!this.isButtonFixed && scrollOffset <= 200) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'static');
    this.renderer.setStyle(this.el.nativeElement, 'top', this.originalPosition.top);
    this.renderer.setStyle(this.el.nativeElement, 'right', this.originalPosition.right);
    this.isButtonFixed = false;
  }
  }

  openDialog() {
    const modalRef = this.modalService.open(DialogBoxComponent);
  }
}
