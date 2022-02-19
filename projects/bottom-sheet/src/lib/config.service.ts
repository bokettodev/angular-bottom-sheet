import { Injectable } from '@angular/core';
import { IBottomSheetConfig } from './bottom-sheet-config.interface';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private _config: IBottomSheetConfig = {
    animationTimeMs: 300,
    initialIndentFromTopPercentage: 65,
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
