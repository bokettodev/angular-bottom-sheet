export interface IBottomSheetConfig<T> {
  animationTimeSeconds?: number;
  closeOnClickInside?: boolean;
  initialState?: Partial<T>;
  maxHeight?: string;
}
