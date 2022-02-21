import { Injectable, OnDestroy } from '@angular/core';
import { Subject, SubscriptionLike } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class StoreService implements OnDestroy {
  readonly hide$ = new Subject<void>();

  draggingHandleElement: HTMLElement | null = null;
  isDraggableElementProcessing = false;
  isDraggableElementExpanded = false;

  bottomSheetHostClickSub: SubscriptionLike | null = null;
  bottomSheetHideSub: SubscriptionLike | null = null;

  constructor(private configService: ConfigService) {}

  ngOnDestroy(): void {
    this.bottomSheetHostClickSub?.unsubscribe();
    this.bottomSheetHideSub?.unsubscribe();
  }

  get canHide(): boolean {
    return (
      !!this.configService.config.canHide && !this.isDraggableElementProcessing
    );
  }
}
