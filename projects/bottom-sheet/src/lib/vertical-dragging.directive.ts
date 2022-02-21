import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';
import { fromEvent, Subscription, SubscriptionLike } from 'rxjs';
import { IBottomSheetConfig } from './bottom-sheet-config.interface';
import { ConfigService } from './config.service';
import { DomService } from './dom.service';
import { StoreService } from './store.service';
import { isDefined } from './value-utils';

@Directive({
  selector: '[verticalDragging]',
})
export class VerticalDraggingDirective implements AfterViewInit, OnDestroy {
  private _verticalBoundaries?: { min: number; max: number };
  private _dragSubscription?: SubscriptionLike;
  private readonly _subscriptions: Subscription[] = [];

  constructor(
    private readonly domService: DomService,
    private readonly storeService: StoreService,
    private readonly configService: ConfigService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    this._initVariables();
    this._addDraggingStartListener();
    this._addDraggingEndListener();
  }

  ngOnDestroy(): void {
    this._removeDraggingListener();
    this._subscriptions.forEach((s) => s?.unsubscribe());
  }

  private _initVariables(): void {
    this._verticalBoundaries = {
      min: this._borderElement.offsetTop,
      max: this._borderElement.offsetTop + this._borderElement.offsetHeight,
    };
  }

  private _addDraggingStartListener(): void {
    this._subscriptions.push(
      fromEvent<MouseEvent>(this._draggingHandleElement, 'mousedown').subscribe(
        (event) => {
          event.preventDefault();
          if (
            this.storeService.isDraggableElementExpanding ||
            this.storeService.isDraggableElementCollapsing
          ) {
            return;
          }
          this._addDraggingListener(event);
        }
      )
    );
  }

  private _addDraggingEndListener(): void {
    this._subscriptions.push(
      fromEvent<MouseEvent>(this.domService.document, 'mouseup').subscribe(
        () => {
          if (
            this.storeService.isDraggableElementExpanding ||
            this.storeService.isDraggableElementCollapsing
          ) {
            return;
          }
          this._removeDraggingListener();
        }
      )
    );
  }

  private _addDraggingListener(dragStartEvent: MouseEvent): void {
    this._removeDraggingListener();

    const indentFromHandleElementTop =
      (dragStartEvent.target as HTMLElement).getBoundingClientRect().top -
      this._draggableElement.getBoundingClientRect().top +
      dragStartEvent.offsetY;

    this._dragSubscription = fromEvent<MouseEvent>(
      this.domService.document,
      'mousemove'
    ).subscribe((event) => {
      let topPx = event.y - indentFromHandleElementTop;

      topPx = Math.max(
        this._verticalBoundaries!.min,
        Math.min(topPx, this._verticalBoundaries!.max)
      );

      if (this._shouldToExpand) {
        this._expandDraggableElement();
      } else if (this._shouldToCollapse) {
        this._collapseDraggableElement();
      } else {
        this.domService.setTop(this._draggableElement, `${topPx}px`);
      }
    });
  }

  private _removeDraggingListener(): void {
    this._dragSubscription?.unsubscribe();
  }

  private _expandDraggableElement(): void {
    this._removeDraggingListener();
    this.storeService.isDraggableElementExpanding = true;

    this.domService.setTopWithAnimation(
      this._draggableElement,
      0,
      this._config.animationsTimeMs || 0,
      () => (this.storeService.isDraggableElementExpanding = false)
    );
  }

  private _collapseDraggableElement(): void {
    this._removeDraggingListener();
    this.storeService.isDraggableElementCollapsing = true;
    this.storeService.hide$.next();
  }

  private get _shouldToExpand(): boolean {
    if (!isDefined(this._config.expandAfterTopPercentage)) {
      return false;
    }

    const isAutoExpandIndentInvalid = isNaN(
      this._config.expandAfterTopPercentage!
    );
    if (isAutoExpandIndentInvalid) {
      return false;
    }

    const autoExpandIndentPx =
      (this._borderElement.offsetHeight / 100) *
      this._config.expandAfterTopPercentage!;
    return this._draggableElement.offsetTop <= autoExpandIndentPx;
  }

  private get _shouldToCollapse(): boolean {
    if (!isDefined(this._config.collapseAfterTopPercentage)) {
      return false;
    }

    const isAutoCollapseIndentInvalid = isNaN(
      this._config.collapseAfterTopPercentage!
    );
    if (isAutoCollapseIndentInvalid) {
      return false;
    }

    const autoCollapseIndentPx =
      (this._borderElement.offsetHeight / 100) *
      this._config.collapseAfterTopPercentage!;
    return this._draggableElement.offsetTop >= autoCollapseIndentPx;
  }

  private get _config(): IBottomSheetConfig {
    return this.configService.config;
  }

  private get _borderElement(): HTMLElement {
    return this.domService.body;
  }

  private get _draggableElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  private get _draggingHandleElement(): HTMLElement {
    return this.storeService.draggingHandleElement || this._draggableElement;
  }
}
