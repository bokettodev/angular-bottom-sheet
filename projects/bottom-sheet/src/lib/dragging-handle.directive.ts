import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[bottomSheetDraggingHandle]',
})
export class DraggingHandleDirective {
  constructor(public elementRef: ElementRef<HTMLElement>) {}
}
