import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';
import { fromEvent, Subject, SubscriptionLike } from 'rxjs';
import { IBottomSheetConfig } from './bottom-sheet-config.interface';
import { BottomSheetRef } from './bottom-sheet-ref.class';
import { BottomSheetComponent } from './bottom-sheet.component';
import { BOTTOM_SHEET_DEFAULT_CONFIG } from './bottom-sheet-default-config.const';
import { DomService } from './dom.service';

@Injectable({ providedIn: 'root' })
export class BottomSheetService {
  private _bottomSheetComponentRef: ComponentRef<BottomSheetComponent> | null =
    null;
  private _bottomSheetComponentClickSub: SubscriptionLike | null = null;
  private _config = BOTTOM_SHEET_DEFAULT_CONFIG;
  private readonly _bottomSheetOnHidden$ = new Subject<void>();

  constructor(
    private readonly injector: Injector,
    private readonly domService: DomService,
    private readonly applicationRef: ApplicationRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver
  ) {}

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
    this._bottomSheetComponentRef.instance.initialIndentFromTop = `${this._config.initialIndentFromTopPercentage}%`;

    this.domService.renderer.setStyle(
      this._bottomSheetContentElement,
      'top',
      `${this._config.initialIndentFromTopPercentage}%`
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
    this.domService.renderer.appendChild(
      this.domService.body,
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
    this._bottomSheetComponentClickSub = fromEvent<MouseEvent>(
      bottomSheetComponentElement,
      'click'
    ).subscribe((event) => {
      const isClickInside =
        (event.target as HTMLElement).parentElement !== this.domService.body;
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
