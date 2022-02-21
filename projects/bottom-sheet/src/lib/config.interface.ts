export interface IBottomSheetConfig<T = unknown> {
  animationsTimeMs?: number;
  closeOnClickInside?: boolean;
  collapseAfterTopPercentage?: number;
  expandAfterTopPercentage?: number;
  initialTopPercentage?: number;
  initialState?: Partial<T>;
}
