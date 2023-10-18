import { Component, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-scroll-button',
  templateUrl: './scroll-button.component.html',
  styleUrls: ['./scroll-button.component.css']
})
export class ScrollButtonComponent {
  isButtonFixed: boolean = true; // Set to true to make the button visible from the start

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.scrollY;
    if (scrollOffset > 200) {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'fixed');
      this.renderer.setStyle(this.el.nativeElement, 'top', '20px');
      this.renderer.setStyle(this.el.nativeElement, 'right', '20px');
      this.isButtonFixed = true;
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'static');
      this.isButtonFixed = false;
    }
  }

  handleClick() {
    // Handle button click logic here (if any)
    // For example, you can emit an event if you want to notify parent components about the button click
  }
}