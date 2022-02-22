import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BottomSheetComponent } from './bottom-sheet.component';
import { DraggingHandleDirective } from './dragging-handle.directive';
import { VerticalDraggingDirective } from './vertical-dragging.directive';

@NgModule({
  declarations: [
    BottomSheetComponent,
    VerticalDraggingDirective,
    DraggingHandleDirective,
  ],
  imports: [BrowserAnimationsModule],
  exports: [DraggingHandleDirective],
})
export class BottomSheetModule {}
