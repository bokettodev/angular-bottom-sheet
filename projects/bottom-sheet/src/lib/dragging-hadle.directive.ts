import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[draggingHandle]',
})
export class DraggingHandleDirective {
  constructor(public elementRef: ElementRef<HTMLElement>) {}
}
