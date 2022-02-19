import { Directive, ElementRef } from '@angular/core';
import { StoreService } from './store.service';

@Directive({
  selector: '[bottomSheetDraggingHandle]',
})
export class DraggingHandleDirective {
  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly storeService: StoreService
  ) {
    this.storeService.draggingHandleElement = this.elementRef.nativeElement;
  }
}
