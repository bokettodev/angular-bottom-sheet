export interface IBottomSheetConfig<T = unknown> {
  animationsTimeMs?: number;
  canHide?: boolean;
  hideOnClickInside?: boolean;
  collapseAfterTopPercentage?: number;
  expandAfterTopPercentage?: number;
  initialTopPercentage?: number;
  initialState?: Partial<T>;
}
