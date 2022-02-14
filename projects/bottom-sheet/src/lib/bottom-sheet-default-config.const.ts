import { IBottomSheetConfig } from './bottom-sheet-config.interface';

export const BOTTOM_SHEET_DEFAULT_CONFIG: IBottomSheetConfig<unknown> = {
  animationTimeSeconds: 0.3,
  closeOnClickInside: false,
  maxHeight: '75%',
};
