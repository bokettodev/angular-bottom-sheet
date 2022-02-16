import {
  AfterViewInit,
  ContentChild,
  Directive,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { fromEvent, Subscription, takeUntil } from 'rxjs';
import { DomService } from './dom.service';
import { DraggingHandleDirective } from './dragging-hadle.directive';

@Directive({
  selector: '[verticalDragging]',
})
export class VerticalDraggingDirective implements AfterViewInit, OnDestroy {
  @ContentChild(DraggingHandleDirective)
  private readonly _draggingHandle?: DraggingHandleDirective;

  private _verticalBoundaries?: { min: number; max: number };
  private _dragSubscription?: Subscription;
  private readonly _subscriptions: Subscription[] = [];

  constructor(
    private readonly domService: DomService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    this._initVariables();
    this._initListeners();
  }

  ngOnDestroy(): void {
    this._dragSubscription?.unsubscribe();
    this._subscriptions.forEach((s) => s?.unsubscribe());
  }

  private _initVariables(): void {
    this._verticalBoundaries = {
      min: this._borderContainer.offsetTop,
      max:
        this._borderContainer.offsetTop +
        this._borderContainer.offsetHeight -
        this._hostElement.offsetHeight,
    };
  }

  private _initListeners(): void {
    this._subscriptions.push(
      fromEvent<MouseEvent>(this._handleElement!, 'mousedown').subscribe(
        (event) => {
          event.preventDefault();
          this._initDragListener();
        }
      )
    );

    this._subscriptions.push(
      fromEvent<MouseEvent>(this.domService.document, 'mouseup').subscribe(
        () => {
          this._dragSubscription?.unsubscribe();
        }
      )
    );
  }

  private _initDragListener(): void {
    this._dragSubscription?.unsubscribe();

    this._dragSubscription = fromEvent<MouseEvent>(
      this.domService.document,
      'mousemove'
    ).subscribe((event) => {
      this._hostElement.style.top = `${event.y}px`;
    });
  }

  private get _borderContainer(): HTMLElement {
    return this.domService.body;
  }

  private get _hostElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  private get _handleElement(): HTMLElement {
    return this._draggingHandle?.elementRef?.nativeElement || this._hostElement;
  }
}
