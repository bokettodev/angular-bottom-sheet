export interface IBottomSheetConfig<T = unknown> {
  animationTimeMs?: number;
  autoCollapse?: boolean;
  autoCollapseIndentPercentage?: number;
  autoExpand?: boolean;
  autoExpandIndentPercentage?: number;
  closeOnClickInside?: boolean;
  initialIndentFromTopPercentage?: number;
  initialState?: Partial<T>;
}
