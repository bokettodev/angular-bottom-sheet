import { Directive, ElementRef } from '@angular/core';
import { DraggingService } from './dragging.service';

@Directive({
  selector: '[bottomSheetDraggingHandle]',
})
export class DraggingHandleDirective {
  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly draggingService: DraggingService
  ) {
    this.draggingService.draggingHandleElementRef = this.elementRef;
  }
}
