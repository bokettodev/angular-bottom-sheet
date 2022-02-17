import {
  AfterViewInit,
  ContentChild,
  Directive,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
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
      min:
        this._borderElement.offsetTop + this._borderElement.offsetHeight * 0.1,
      max:
        this._borderElement.offsetTop + this._borderElement.offsetHeight * 0.9,
    };
  }

  private _initListeners(): void {
    this._subscriptions.push(
      fromEvent<MouseEvent>(this._handleElement, 'mousedown').subscribe(
        (event) => {
          event.preventDefault();
          this._initDragListener(event);
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

  private _initDragListener(dragStartEvent: MouseEvent): void {
    this._dragSubscription?.unsubscribe();

    const indentFromHandleElementTop =
      dragStartEvent.y - this._handleElement.offsetTop;

    this._dragSubscription = fromEvent<MouseEvent>(
      this.domService.document,
      'mousemove'
    ).subscribe((event) => {
      let top = event.y - indentFromHandleElementTop;

      top = Math.max(
        this._verticalBoundaries!.min,
        Math.min(top, this._verticalBoundaries!.max)
      );

      this._draggableElement.style.top = `${top}px`;
    });
  }

  private get _borderElement(): HTMLElement {
    return this.domService.body;
  }

  private get _draggableElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  private get _handleElement(): HTMLElement {
    console.log(this._draggingHandle);

    return (
      this._draggingHandle?.elementRef?.nativeElement || this._draggableElement
    );
  }
}
