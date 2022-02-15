import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Inject,
  Injectable,
  Injector,
  Renderer2,
  RendererFactory2,
  Type,
} from '@angular/core';
import { fromEvent, Subject, SubscriptionLike } from 'rxjs';
import { IBottomSheetConfig } from './bottom-sheet-config.interface';
import { BottomSheetRef } from './bottom-sheet-ref.class';
import { BottomSheetComponent } from './bottom-sheet.component';
import { BOTTOM_SHEET_DEFAULT_CONFIG } from './bottom-sheet-default-config.const';

@Injectable({ providedIn: 'root' })
export class BottomSheetService {
  private _bottomSheetComponentRef: ComponentRef<BottomSheetComponent> | null =
    null;
  private _bottomSheetComponentClickSub: SubscriptionLike | null = null;
  private _config = BOTTOM_SHEET_DEFAULT_CONFIG;
  private readonly _bottomSheetOnHidden$ = new Subject<void>();
  private readonly renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly applicationRef: ApplicationRef,
    private readonly injector: Injector,
    readonly rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  show<T>(component: Type<T>, config?: IBottomSheetConfig<T>): BottomSheetRef {
    if (config) {
      this._config = { ...BOTTOM_SHEET_DEFAULT_CONFIG, ...config };
    }

    this._initBottomSheetComponent();
    this._initTargetComponent<T>(component);
    this._addBottomSheetComponentToBody();

    return new BottomSheetRef({
      onHidden: this._bottomSheetOnHidden$.asObservable(),
    });
  }

  hide(): void {
    this._removeBottomSheetComponentFromBody();
    this._bottomSheetOnHidden$.next();
  }

  private _initBottomSheetComponent(): void {
    this._bottomSheetComponentRef = this.componentFactoryResolver
      .resolveComponentFactory(BottomSheetComponent)
      .create(this.injector);

    this._bottomSheetComponentRef.instance.animationTime = `${this._config.animationTimeSeconds}s`;

    this.renderer.setStyle(
      this._bottomSheetContentElement,
      'max-height',
      this._config.maxHeight
    );
  }

  private _initTargetComponent<T>(component: Type<T>): void {
    const componentRef =
      this._bottomSheetComponentRef!.instance.contentViewContainerRef.createComponent(
        component
      );

    if (this._config.initialState) {
      Object.entries(this._config.initialState).forEach(([key, value]) => {
        (componentRef.instance as any)[key] = value;
      });
    }

    componentRef.changeDetectorRef.detectChanges();
  }

  private _addBottomSheetComponentToBody(): void {
    this.applicationRef.attachView(this._bottomSheetComponentRef!.hostView);
    this.renderer.appendChild(
      this.document.body,
      this._bottomSheetComponentElement
    );
    this._addListenersToBottomSheetComponent(this._bottomSheetComponentElement);
  }

  private _removeBottomSheetComponentFromBody(): void {
    this._removeListenersFromBottomSheetComponent();
    this.applicationRef.detachView(this._bottomSheetComponentRef!.hostView);
    this._bottomSheetComponentRef!.instance.contentViewContainerRef.clear();
    this._bottomSheetComponentRef!.destroy();
  }

  private _addListenersToBottomSheetComponent(
    bottomSheetComponentElement: HTMLElement
  ): void {
    this._bottomSheetComponentClickSub = fromEvent(
      bottomSheetComponentElement,
      'click'
    ).subscribe((event: Event) => {
      const isClickInside =
        (event.target as HTMLElement).parentElement !== this.document.body;
      if (isClickInside && !this._config.closeOnClickInside) {
        return;
      }

      this.hide();
    });
  }

  private _removeListenersFromBottomSheetComponent(): void {
    this._bottomSheetComponentClickSub?.unsubscribe();
  }

  private get _bottomSheetComponentElement(): HTMLElement {
    return (this._bottomSheetComponentRef?.hostView as EmbeddedViewRef<unknown>)
      ?.rootNodes[0] as HTMLElement;
  }

  private get _bottomSheetContentElement(): HTMLElement {
    return this._bottomSheetComponentElement?.firstChild as HTMLElement;
  }
}
