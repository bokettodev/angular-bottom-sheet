import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';
import { fromEvent, SubscriptionLike } from 'rxjs';
import { IBottomSheetConfig } from './config.interface';
import { ConfigService } from './config.service';
import { DomService } from './dom.service';
import { StoreService } from './store.service';
import { isDefined } from './value-utils';

@Directive({
  selector: '[verticalDragging]',
})
export class VerticalDraggingDirective implements AfterViewInit, OnDestroy {
  private _borderElement!: HTMLElement;
  private _draggableElement!: HTMLElement;
  private _draggingHandleElement!: HTMLElement;
  private _verticalBoundaries!: { min: number; max: number };

  private _draggingStartSubscription?: SubscriptionLike;
  private _draggingSubscription?: SubscriptionLike;
  private _draggingEndSubscription?: SubscriptionLike;

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
    this._removeDraggingStartListener();
    this._removeDraggingEndListener();
    this._removeDraggingListener();
  }

  private _initVariables(): void {
    this._borderElement = this.domService.body;
    this._draggableElement = this.elementRef.nativeElement;
    this._draggingHandleElement =
      this.storeService.draggingHandleElement || this._draggableElement;

    this._verticalBoundaries = {
      min: this._borderElement.offsetTop,
      max: this._borderElement.offsetTop + this._borderElement.offsetHeight,
    };
  }

  private _addDraggingStartListener(): void {
    this._removeDraggingStartListener();

    this._draggingStartSubscription = fromEvent<MouseEvent>(
      this._draggingHandleElement,
      'mousedown'
    ).subscribe((event) => {
      event.preventDefault();
      if (this.storeService.isDraggableElementProcessing) {
        return;
      }
      this._addDraggingListener(event);
    });
  }

  private _addDraggingEndListener(): void {
    this._removeDraggingEndListener();

    this._draggingEndSubscription = fromEvent<MouseEvent>(
      this.domService.document,
      'mouseup'
    ).subscribe(() => {
      if (this.storeService.isDraggableElementProcessing) {
        return;
      }
      this._removeDraggingListener();
    });
  }

  private _addDraggingListener(dragStartEvent: MouseEvent): void {
    this._removeDraggingListener();
    this._toggleDraggableElementTransition(true);

    const indentFromHandleElementTop =
      (dragStartEvent.target as HTMLElement).getBoundingClientRect().top -
      this._draggableElement.getBoundingClientRect().top +
      dragStartEvent.offsetY;

    this._draggingSubscription = fromEvent<MouseEvent>(
      this.domService.document,
      'mousemove'
    ).subscribe((event) => {
      let topPx = event.y - indentFromHandleElementTop;

      topPx = Math.max(
        this._verticalBoundaries.min,
        Math.min(topPx, this._verticalBoundaries!.max)
      );

      if (this.storeService.isDraggableElementExpanded && topPx) {
        this._moveDraggableElementToInitialTop();
        return;
      }

      if (this._shouldToExpand) {
        this._expandDraggableElement();
      } else if (this._shouldToCollapse) {
        this._collapseDraggableElement();
      } else {
        this._setDraggableElementTop(`${topPx}px`);
        this.storeService.isDraggableElementExpanded = !topPx;
      }
    });
  }

  private _moveDraggableElementToInitialTop(): void {
    this._removeDraggingListener();
    this.storeService.isDraggableElementProcessing = true;
    this._setDraggableElementTop(`${this._config.initialTopPercentage}%`);

    setTimeout(() => {
      this.storeService.isDraggableElementExpanded = false;
      this.storeService.isDraggableElementProcessing = false;
    }, this._config.animationsTimeMs);
  }

  private _expandDraggableElement(): void {
    this._removeDraggingListener();
    this.storeService.isDraggableElementProcessing = true;
    this._setDraggableElementTop(0);

    setTimeout(() => {
      this.storeService.isDraggableElementExpanded = true;
      this.storeService.isDraggableElementProcessing = false;
    }, this._config.animationsTimeMs);
  }

  private _collapseDraggableElement(): void {
    this._removeDraggingListener();
    this.storeService.isDraggableElementProcessing = true;
    this.storeService.hide$.next();
  }

  private _setDraggableElementTop(top: string | number): void {
    this.domService.setTop(this._draggableElement, top);
  }

  private _toggleDraggableElementTransition(enableTransition: boolean): void {
    const transitionClass = 'content--no-transition';
    if (!enableTransition) {
      this.domService.renderer.removeClass(
        this._draggableElement,
        transitionClass
      );
    } else if (!this._draggableElement.className.includes(transitionClass)) {
      this.domService.renderer.addClass(
        this._draggableElement,
        transitionClass
      );
    }
  }

  private _removeDraggingStartListener(): void {
    this._draggingStartSubscription?.unsubscribe();
  }

  private _removeDraggingListener(): void {
    this._draggingSubscription?.unsubscribe();
    this._toggleDraggableElementTransition(false);
  }

  private _removeDraggingEndListener(): void {
    this._draggingEndSubscription?.unsubscribe();
  }

  private get _shouldToExpand(): boolean {
    if (
      !isDefined(this._config.expandAfterTopPercentage) ||
      isNaN(this._config.expandAfterTopPercentage!)
    ) {
      return false;
    }

    const autoExpandIndentPx =
      (this._borderElement.offsetHeight / 100) *
      this._config.expandAfterTopPercentage!;
    return this._draggableElement.offsetTop <= autoExpandIndentPx;
  }

  private get _shouldToCollapse(): boolean {
    if (
      !isDefined(this._config.collapseAfterTopPercentage) ||
      isNaN(this._config.collapseAfterTopPercentage!)
    ) {
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
}
