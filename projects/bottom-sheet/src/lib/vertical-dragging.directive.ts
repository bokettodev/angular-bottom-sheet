import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';
import { fromEvent, SubscriptionLike } from 'rxjs';
import { BottomSheetConfig } from './config.interface';
import { ConfigService } from './config.service';
import { DomService } from './dom.service';
import { StoreService } from './store.service';
import { isDefined } from './value-utils';

@Directive({
  selector: '[verticalDragging]',
})
export class VerticalDraggingDirective implements AfterViewInit, OnDestroy {
  private borderElement!: HTMLElement;
  private draggableElement!: HTMLElement;
  private draggingHandleElement!: HTMLElement;
  private verticalBoundaries!: { min: number; max: number };

  private draggingStartSubscription?: SubscriptionLike;
  private draggingSubscription?: SubscriptionLike;
  private draggingEndSubscription?: SubscriptionLike;

  constructor(
    private readonly domService: DomService,
    private readonly storeService: StoreService,
    private readonly configService: ConfigService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    this.initVariables();
    this.addDraggingStartListener();
    this.addDraggingEndListener();
  }

  ngOnDestroy(): void {
    this.removeDraggingStartListener();
    this.removeDraggingEndListener();
    this.removeDraggingListener();
  }

  private initVariables(): void {
    this.borderElement = this.domService.body;
    this.draggableElement = this.elementRef.nativeElement;
    this.draggingHandleElement =
      this.storeService.draggingHandleElement || this.draggableElement;

    this.verticalBoundaries = {
      min: this.borderElement.offsetTop,
      max: this.borderElement.offsetTop + this.borderElement.offsetHeight * 0.9,
    };
  }

  private addDraggingStartListener(): void {
    this.removeDraggingStartListener();

    this.draggingStartSubscription = fromEvent<MouseEvent>(
      this.draggingHandleElement,
      'mousedown'
    ).subscribe((event) => {
      event.preventDefault();
      if (this.storeService.isDraggableElementProcessing) {
        return;
      }
      this.addDraggingListener(event);
    });
  }

  private addDraggingEndListener(): void {
    this.removeDraggingEndListener();

    this.draggingEndSubscription = fromEvent<MouseEvent>(
      this.domService.document,
      'mouseup'
    ).subscribe(() => {
      if (this.storeService.isDraggableElementProcessing) {
        return;
      }
      this.removeDraggingListener();
    });
  }

  private addDraggingListener(dragStartEvent: MouseEvent): void {
    this.removeDraggingListener();
    this.toggleDraggableElementTransition(true);

    const indentFromHandleElementTop =
      (dragStartEvent.target as HTMLElement).getBoundingClientRect().top -
      this.draggableElement.getBoundingClientRect().top +
      dragStartEvent.offsetY;

    this.draggingSubscription = fromEvent<MouseEvent>(
      this.domService.document,
      'mousemove'
    ).subscribe((event) => {
      let topPx = event.y - indentFromHandleElementTop;

      topPx = Math.max(
        this.verticalBoundaries.min,
        Math.min(topPx, this.verticalBoundaries!.max)
      );

      if (this.shouldToExpand) {
        if (this.storeService.isDraggableElementAutoExpandable) {
          this.expandDraggableElement();
        } else {
          this.setDraggableElementTop(`${topPx}px`);
        }
      } else if (this.shouldToCollapse && this.storeService.canHide) {
        this.collapseDraggableElement();
      } else {
        this.storeService.isDraggableElementAutoExpandable = true;
        this.setDraggableElementTop(`${topPx}px`);
      }
    });
  }

  private expandDraggableElement(): void {
    this.removeDraggingListener();
    this.storeService.isDraggableElementAutoExpandable = false;
    this.storeService.isDraggableElementProcessing = true;
    this.setDraggableElementTop(0);

    setTimeout(() => {
      this.storeService.isDraggableElementProcessing = false;
    }, this.config.animationsTimeMs);
  }

  private collapseDraggableElement(): void {
    this.removeDraggingListener();
    this.storeService.isDraggableElementProcessing = true;
    this.storeService.hide$.next();
  }

  private setDraggableElementTop(top: string | number): void {
    this.domService.setTop(this.draggableElement, top);
  }

  private toggleDraggableElementTransition(enableTransition: boolean): void {
    const transitionClass = 'content--no-transition';
    if (!enableTransition) {
      this.domService.renderer.removeClass(
        this.draggableElement,
        transitionClass
      );
    } else if (!this.draggableElement.className.includes(transitionClass)) {
      this.domService.renderer.addClass(this.draggableElement, transitionClass);
    }
  }

  private removeDraggingStartListener(): void {
    this.draggingStartSubscription?.unsubscribe();
  }

  private removeDraggingListener(): void {
    this.draggingSubscription?.unsubscribe();
    this.toggleDraggableElementTransition(false);
  }

  private removeDraggingEndListener(): void {
    this.draggingEndSubscription?.unsubscribe();
  }

  private get shouldToExpand(): boolean {
    if (
      !isDefined(this.config.expandAfterTopPercentage) ||
      isNaN(this.config.expandAfterTopPercentage!)
    ) {
      return false;
    }

    const autoExpandIndentPx =
      (this.borderElement.offsetHeight / 100) *
      this.config.expandAfterTopPercentage!;
    return this.draggableElement.offsetTop <= autoExpandIndentPx;
  }

  private get shouldToCollapse(): boolean {
    if (
      !isDefined(this.config.collapseAfterTopPercentage) ||
      isNaN(this.config.collapseAfterTopPercentage!)
    ) {
      return false;
    }

    const autoCollapseIndentPx =
      (this.borderElement.offsetHeight / 100) *
      this.config.collapseAfterTopPercentage!;
    return this.draggableElement.offsetTop >= autoCollapseIndentPx;
  }

  private get config(): BottomSheetConfig {
    return this.configService.config;
  }
}
