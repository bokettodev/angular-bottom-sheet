import { Observable } from 'rxjs';

export class BottomSheetRef {
  constructor(public onHidden: Observable<void>) {}
}
