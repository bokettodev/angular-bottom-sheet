export interface IBottomSheetConfig<T> {
  animationTimeSeconds?: number;
  closeOnClickInside?: boolean;
  initialIndentFromTopPercentage: number;
  initialState?: Partial<T>;
}
