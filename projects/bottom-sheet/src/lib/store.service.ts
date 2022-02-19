import { Injectable, OnDestroy } from '@angular/core';
import { Subject, SubscriptionLike } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StoreService implements OnDestroy {
  readonly hide$ = new Subject<void>();

  draggingHandleElement: HTMLElement | null = null;
  isDraggableElementExpanding = false;
  isDraggableElementCollapsing = false;

  bottomSheetBackdropClickSub: SubscriptionLike | null = null;
  bottomSheetHideSub: SubscriptionLike | null = null;

  ngOnDestroy(): void {
    this.bottomSheetBackdropClickSub?.unsubscribe();
    this.bottomSheetHideSub?.unsubscribe();
  }
}
