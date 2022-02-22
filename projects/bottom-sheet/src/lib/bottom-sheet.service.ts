import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { IBottomSheetConfig } from './config.interface';
import { BottomSheetRef } from './bottom-sheet-ref.class';
import { BottomSheetComponent } from './bottom-sheet.component';
import { ConfigService } from './config.service';
import { DomService } from './dom.service';
import { StoreService } from './store.service';

@Injectable({ providedIn: 'root' })
export class BottomSheetService {
  private _bottomSheetComponentRef: ComponentRef<BottomSheetComponent> | null =
    null;

  private readonly _bottomSheetOnHidden$ = new Subject<void>();

  constructor(
    private readonly injector: Injector,
    private readonly domService: DomService,
    private readonly storeService: StoreService,
    private readonly configService: ConfigService,
    private readonly applicationRef: ApplicationRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver
  ) {
    this._initListeners();
  }

  show<T>(component: Type<T>, config?: IBottomSheetConfig<T>): BottomSheetRef {
    if (config) {
      this.configService.config = config;
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

  private _initListeners(): void {
    this.storeService.bottomSheetHideSub?.unsubscribe();
    this.storeService.bottomSheetHideSub = this.storeService.hide$.subscribe(
      () => this.hide()
    );
  }

  private _initBottomSheetComponent(): void {
    this._bottomSheetComponentRef = this.componentFactoryResolver
      .resolveComponentFactory(BottomSheetComponent)
      .create(this.injector);

    this._bottomSheetComponentRef.instance.animationTime = `${this._config.animationsTimeMs}ms`;
    this._bottomSheetComponentRef.instance.initialIndentFromTop = `${this._config.initialTopPercentage}%`;
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
      this._bottomSheetHostElement
    );
    this._addListenersToBottomSheetComponent();
  }

  private _removeBottomSheetComponentFromBody(): void {
    this.storeService.isDraggableElementProcessing = false;
    this.storeService.bottomSheetHostClickSub?.unsubscribe();
    this.applicationRef.detachView(this._bottomSheetComponentRef!.hostView);

    this.storeService.bottomSheetHostAnimationDoneSub =
      this._bottomSheetComponentRef!.instance.hostAnimationDone$.subscribe(
        () => {
          this.storeService.bottomSheetHostAnimationDoneSub?.unsubscribe();
          this._bottomSheetComponentRef!.instance.contentViewContainerRef.clear();
          this._bottomSheetComponentRef!.destroy();
        }
      );
  }

  private _addListenersToBottomSheetComponent(): void {
    this.storeService.bottomSheetHostClickSub = fromEvent<MouseEvent>(
      this._bottomSheetHostElement,
      'click'
    ).subscribe((event) => {
      if (!this.storeService.canHide) {
        return;
      }

      const isClickInside =
        (event.target as HTMLElement) !== this._bottomSheetBackdropElement;
      if (isClickInside && !this._config.hideOnClickInside) {
        return;
      }

      this.hide();
    });
  }

  private get _config(): IBottomSheetConfig {
    return this.configService.config;
  }

  private get _bottomSheetHostElement(): HTMLElement {
    return (this._bottomSheetComponentRef!.hostView as EmbeddedViewRef<unknown>)
      ?.rootNodes[0] as HTMLElement;
  }

  private get _bottomSheetBackdropElement(): HTMLElement {
    return this._bottomSheetComponentRef!.instance.backdropRef.nativeElement;
  }
}
