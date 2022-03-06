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
import { BottomSheetConfig } from './config.interface';
import { BottomSheetRef } from './bottom-sheet-ref.class';
import { BottomSheetComponent } from './bottom-sheet.component';
import { ConfigService } from './config.service';
import { DomService } from './dom.service';
import { StoreService } from './store.service';

@Injectable({ providedIn: 'root' })
export class BottomSheetService {
  private bottomSheetComponentRef: ComponentRef<BottomSheetComponent> | null =
    null;

  private readonly bottomSheetOnHidden$ = new Subject<void>();

  constructor(
    private readonly injector: Injector,
    private readonly domService: DomService,
    private readonly storeService: StoreService,
    private readonly configService: ConfigService,
    private readonly applicationRef: ApplicationRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.initListeners();
  }

  show<T>(
    component: Type<T>,
    config?: Partial<BottomSheetConfig<T>>
  ): BottomSheetRef {
    if (config) {
      this.configService.config = config as BottomSheetConfig;
    }

    this.initBottomSheetComponent();
    this.initTargetComponent<T>(component);
    this.addBottomSheetComponentToBody();

    return new BottomSheetRef({
      onHidden: this.bottomSheetOnHidden$.asObservable(),
    });
  }

  hide(): void {
    this.removeBottomSheetComponentFromBody();
    this.bottomSheetOnHidden$.next();
  }

  private initListeners(): void {
    this.storeService.bottomSheetHideSub?.unsubscribe();
    this.storeService.bottomSheetHideSub = this.storeService.hide$.subscribe(
      () => this.hide()
    );
  }

  private initBottomSheetComponent(): void {
    this.bottomSheetComponentRef = this.componentFactoryResolver
      .resolveComponentFactory(BottomSheetComponent)
      .create(this.injector);

    this.bottomSheetComponentRef.instance.animationTime = `${this.config.animationsTimeMs}ms`;
    this.bottomSheetComponentRef.instance.initialIndentFromTop = `${this.config.initialTopPercentage}%`;
  }

  private initTargetComponent<T>(component: Type<T>): void {
    const componentRef =
      this.bottomSheetComponentRef!.instance.contentViewContainerRef.createComponent(
        component
      );

    if (this.config.initialState) {
      Object.entries(this.config.initialState).forEach(([key, value]) => {
        (componentRef.instance as any)[key] = value;
      });
    }

    componentRef.changeDetectorRef.detectChanges();
  }

  private addBottomSheetComponentToBody(): void {
    this.applicationRef.attachView(this.bottomSheetComponentRef!.hostView);
    this.domService.renderer.appendChild(
      this.domService.body,
      this.bottomSheetHostElement
    );
    this.addListenersToBottomSheetComponent();
  }

  private removeBottomSheetComponentFromBody(): void {
    this.storeService.isDraggableElementProcessing = false;
    this.storeService.bottomSheetHostClickSub?.unsubscribe();
    this.applicationRef.detachView(this.bottomSheetComponentRef!.hostView);

    this.storeService.bottomSheetHostAnimationDoneSub =
      this.bottomSheetComponentRef!.instance.hostAnimationDone$.subscribe(
        () => {
          this.storeService.bottomSheetHostAnimationDoneSub?.unsubscribe();
          this.bottomSheetComponentRef!.instance.contentViewContainerRef.clear();
          this.bottomSheetComponentRef!.destroy();
        }
      );
  }

  private addListenersToBottomSheetComponent(): void {
    this.storeService.bottomSheetHostClickSub = fromEvent<MouseEvent>(
      this.bottomSheetHostElement,
      'click'
    ).subscribe((event) => {
      if (!this.storeService.canHide) {
        return;
      }

      const isClickInside =
        (event.target as HTMLElement) !== this.bottomSheetBackdropElement;
      if (isClickInside && !this.config.hideOnClickInside) {
        return;
      }

      this.hide();
    });
  }

  private get config(): BottomSheetConfig {
    return this.configService.config;
  }

  private get bottomSheetHostElement(): HTMLElement {
    return (this.bottomSheetComponentRef!.hostView as EmbeddedViewRef<unknown>)
      ?.rootNodes[0] as HTMLElement;
  }

  private get bottomSheetBackdropElement(): HTMLElement {
    return this.bottomSheetComponentRef!.instance.backdropRef.nativeElement;
  }
}
