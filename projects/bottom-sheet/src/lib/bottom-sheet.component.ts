import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { BOTTOM_SHEET_HOST_ANIMATION } from './animations';

@Component({
  selector: 'bd-bottom-sheet',
  template: `
    <!-- Content -->
    <div
      verticalDragging
      class="content"
      [@slideInOutAnimation]="{
        value: true,
        params: { animationTime: animationTime }
      }"
    >
      <ng-container #containerRef></ng-container>
    </div>

    <!-- Backdrop -->
    <div
      #backdropRef
      class="backdrop"
      [@fadeInOutAnimation]="{
        value: true,
        params: { animationTime: animationTime }
      }"
    ></div>
  `,
  styleUrls: ['./bottom-sheet.component.scss'],
  animations: [BOTTOM_SHEET_HOST_ANIMATION],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent {
  @ViewChild('containerRef', { read: ViewContainerRef, static: true })
  readonly contentViewContainerRef!: ViewContainerRef;

  @ViewChild('backdropRef', { static: true })
  readonly backdropRef!: ElementRef<HTMLElement>;

  @HostBinding('style.--animationTime')
  animationTime: string | null = null;

  @HostBinding('style.--initialIndentFromTop')
  initialIndentFromTop: string | null = null;

  @HostBinding('@bottomSheetHostAnimation')
  hostAnimation = null;

  @HostListener('@bottomSheetHostAnimation.done')
  hostAnimationDone(): void {
    this.hostAnimationDone$.next();
  }
  readonly hostAnimationDone$ = new Subject<void>();
}
