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
      [@slideInOutAnimation]="animationDefault"
    >
      <ng-container #containerRef></ng-container>
    </div>

    <!-- Backdrop -->
    <div
      #backdropRef
      class="backdrop"
      [@fadeInOutAnimation]="animationDefault"
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

  readonly hostAnimationDone$ = new Subject<void>();

  @HostListener('@bottomSheetHostAnimation.done')
  private hostAnimationDone(): void {
    this.hostAnimationDone$.next();
  }

  get animationDefault() {
    return {
      value: true,
      params: { animationTime: this.animationTime },
    };
  }
}
