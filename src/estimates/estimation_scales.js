export const ESTIMATION_SCALES = {
  exponential: {
    regular: [0, 1, 2, 4, 8, 16],
    extended: [0, 1, 2, 4, 8, 16, 32, 64],
  },
  fibonacci: {
    regular: [0, 1, 2, 3, 5, 8],
    extended: [0, 1, 2, 3, 5, 8, 13, 21],
  },
  linear: {
    regular: [0, 1, 2, 3, 4, 5],
    extended: [0, 1, 2, 3, 4, 5, 6, 7],
  },
};

export const ISSUE_ESTIMATION_OPTIONS = [
  {
    value: "exponential",
    name: `Exponential (${ESTIMATION_SCALES.exponential.regular})`,
    scale: ESTIMATION_SCALES.exponential,
  },
  {
    value: "fibonacci",
    name: `Fibonacci (${ESTIMATION_SCALES.fibonacci.regular})`,
    scale: ESTIMATION_SCALES.fibonacci,
  },
  {
    value: "linear",
    name: `Linear (${ESTIMATION_SCALES.linear.regular})`,
    scale: ESTIMATION_SCALES.linear,
  },
];
