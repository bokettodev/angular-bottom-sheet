import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DomService {
  constructor(@Inject(DOCUMENT) public readonly document: Document) {}

  get body(): HTMLBodyElement {
    return this.document.body as HTMLBodyElement;
  }
}
