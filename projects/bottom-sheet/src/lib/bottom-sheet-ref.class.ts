import { Observable } from 'rxjs';

export class BottomSheetRef {
  onHidden: Observable<void> | null = null;

  constructor(init: Partial<BottomSheetRef>) {
    Object.assign(this, init);
  }
}
