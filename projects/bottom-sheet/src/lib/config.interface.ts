export interface BottomSheetConfig<T = unknown> {
  animationsTimeMs: number;
  canHide: boolean;
  collapseAfterTopPercentage: number;
  expandAfterTopPercentage: number;
  hideOnClickInside: boolean;
  initialTopPercentage: number;
  initialState?: Partial<T>;
}
