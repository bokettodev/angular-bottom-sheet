import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'bd-bottom-sheet',
  template: `
    <div #contentRef verticalDragging class="content">
      <ng-container #containerRef></ng-container>
    </div>

    <div #backdropRef class="backdrop"></div>
  `,
  styleUrls: ['./bottom-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent {
  @ViewChild('containerRef', { read: ViewContainerRef, static: true })
  readonly contentViewContainerRef!: ViewContainerRef;

  @ViewChild('contentRef', { static: true })
  readonly contentRef!: ElementRef<HTMLElement>;

  @ViewChild('backdropRef', { static: true })
  readonly backdropRef!: ElementRef<HTMLElement>;

  @HostBinding('style.--animationTime')
  animationTime: string | null = null;

  @HostBinding('style.--initialIndentFromTop')
  initialIndentFromTop: string | null = null;
}
