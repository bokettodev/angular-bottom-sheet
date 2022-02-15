import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'bd-bottom-sheet',
  template: `
    <div class="content">
      <ng-container #containerRef></ng-container>
    </div>
  `,
  styleUrls: ['./bottom-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent {
  @ViewChild('containerRef', { read: ViewContainerRef, static: true })
  readonly contentViewContainerRef!: ViewContainerRef;

  @HostBinding('style.--animationTime')
  animationTime: string | null = null;
}
