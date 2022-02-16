import { NgModule } from '@angular/core';
import { BottomSheetComponent } from './bottom-sheet.component';
import { DraggingHandleDirective } from './dragging-hadle.directive';
import { VerticalDraggingDirective } from './vertical-dragging.directive';

@NgModule({
  declarations: [
    BottomSheetComponent,
    VerticalDraggingDirective,
    DraggingHandleDirective,
  ],
  imports: [],
  exports: [],
})
export class BottomSheetModule {}
