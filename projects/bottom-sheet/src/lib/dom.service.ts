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

  get body(): HTMLBodyElement {
    return this.document.body as HTMLBodyElement;
  }
}
