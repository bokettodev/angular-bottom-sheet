import { Injectable } from '@angular/core';
import { BottomSheetConfig } from './config.interface';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private configState: BottomSheetConfig = {
    animationsTimeMs: 300,
    canHide: true,
    collapseAfterTopPercentage: 85,
    expandAfterTopPercentage: 35,
    hideOnClickInside: false,
    initialTopPercentage: 65,
  };

  get config(): BottomSheetConfig {
    return this.configState;
  }

  set config(config: BottomSheetConfig) {
    if (!config) {
      return;
    }
    this.configState = { ...this.configState, ...config };
  }
}
