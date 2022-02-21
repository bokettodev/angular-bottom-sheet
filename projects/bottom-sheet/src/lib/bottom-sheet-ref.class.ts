import { Observable } from 'rxjs';

export class BottomSheetRef {
  onHidden!: Observable<void>;

  constructor(init: Partial<BottomSheetRef>) {
    Object.assign(this, init);
  }
}
