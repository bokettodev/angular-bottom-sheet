import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DomService {
  readonly renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) public readonly document: Document,
    private readonly rendererFactory: RendererFactory2
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  setTop(element: HTMLElement, value: number | string): void {
    this.renderer.setStyle(element, 'top', value);
  }

  setTopWithAnimation(
    element: HTMLElement,
    value: number | string,
    animationTimeMs: number,
    onAnimationEnd?: () => void
  ): void {
    this.renderer.addClass(element, 'top-transition');
    this.setTop(element, value);

    setTimeout(() => {
      this.renderer.removeClass(element, 'top-transition');
      onAnimationEnd ? onAnimationEnd() : null;
    }, animationTimeMs);
  }

  setOpacityWithAnimation(
    element: HTMLElement,
    value: number | string,
    animationTimeMs: number,
    onAnimationEnd?: () => void
  ): void {
    this.renderer.addClass(element, 'opacity-transition');
    this.renderer.setStyle(element, 'opacity', value);

    setTimeout(() => {
      this.renderer.removeClass(element, 'opacity-transition');
      onAnimationEnd ? onAnimationEnd() : null;
    }, animationTimeMs);
  }

  get body(): HTMLBodyElement {
    return this.document.body as HTMLBodyElement;
  }
}
