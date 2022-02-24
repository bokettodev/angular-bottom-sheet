import {
  animate,
  animateChild,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * FADE ANIMATION
 */
// Styles
const FADE_IN = { opacity: 1 };
const FADE_OUT = { opacity: 0 };

// Transitions
const FADE_IN_TRANSITION = transition(':enter', [
  style(FADE_OUT),
  animate(`{{ animationTime }} ease-in`, style(FADE_IN)),
]);
const FADE_OUT_TRANSITION = transition(':leave', [
  style(FADE_IN),
  animate(`{{ animationTime }} ease-in`, style(FADE_OUT)),
]);

// Animations
export const FADE_IN_ANIMATION = trigger('fadeInAnimation', [
  FADE_IN_TRANSITION,
]);
export const FADE_OUT_ANIMATION = trigger('fadeOutAnimation', [
  FADE_OUT_TRANSITION,
]);
export const FADE_IN_OUT_ANIMATION = trigger('fadeInOutAnimation', [
  FADE_IN_TRANSITION,
  FADE_OUT_TRANSITION,
]);

/**
 * SLIDE ANIMATION
 */
// Styles
const SLIDE_IN = { top: '*' };
const SLIDE_OUT = { top: '100%' };

// Transitions
const SLIDE_IN_TRANSITION = transition(':enter', [
  style(SLIDE_OUT),
  animate('{{ animationTime }} ease', style(SLIDE_IN)),
]);
const SLIDE_OUT_TRANSITION = transition(':leave', [
  style(SLIDE_IN),
  animate('{{ animationTime }} ease', style(SLIDE_OUT)),
]);

// Animations
export const SLIDE_IN_ANIMATION = trigger('slideInAnimation', [
  SLIDE_IN_TRANSITION,
]);
export const SLIDE_OUT_ANIMATION = trigger('slideOutAnimation', [
  SLIDE_OUT_TRANSITION,
]);
export const SLIDE_IN_OUT_ANIMATION = trigger('slideInOutAnimation', [
  SLIDE_IN_TRANSITION,
  SLIDE_OUT_TRANSITION,
]);

/**
 * BOTTOM SHEET HOST ANIMATION
 */
export const BOTTOM_SHEET_HOST_ANIMATION = [
  SLIDE_IN_OUT_ANIMATION,
  FADE_IN_OUT_ANIMATION,

  trigger('bottomSheetHostAnimation', [
    transition('* => *', [
      group([
        query('@slideInOutAnimation', animateChild()),
        query('@fadeInOutAnimation', animateChild()),
      ]),
    ]),
  ]),
];
