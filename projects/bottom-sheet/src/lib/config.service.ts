import { Injectable } from '@angular/core';
import { IBottomSheetConfig } from './config.interface';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private _config: IBottomSheetConfig = {
    animationsTimeMs: 300,
    canHide: true,
    collapseAfterTopPercentage: 85,
    expandAfterTopPercentage: 35,
    hideOnClickInside: false,
    initialTopPercentage: 65,
  };

  get config(): IBottomSheetConfig {
    return this._config;
  }

  set config(config: IBottomSheetConfig) {
    if (!config) {
      return;
    }
    this._config = { ...this._config, ...config };
  }
}