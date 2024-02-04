import { Directive, ElementRef, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appReadMore]'
})
export class ReadMoreDirective implements AfterViewInit {
  @Input('appReadMore') maxLength: number = 100;
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    if (this.el.nativeElement.textContent.length > this.maxLength) {
      this.toggle.emit(false);
    }
  }
}
