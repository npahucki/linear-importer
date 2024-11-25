export const ESTIMATION_SCALES = {
  exponential: [0, 1, 2, 4, 8, 16],
  fibonacci: [0, 1, 2, 3, 5, 8],
  linear: [0, 1, 2, 3, 4, 5],
};

export const ISSUE_ESTIMATION_OPTIONS = [
  {
    value: "exponential",
    name: `Exponential (${ESTIMATION_SCALES.exponential})`,
    scale: ESTIMATION_SCALES.exponential,
  },
  {
    value: "fibonacci",
    name: `Fibonacci (${ESTIMATION_SCALES.fibonacci})`,
    scale: ESTIMATION_SCALES.fibonacci,
  },
  {
    value: "linear",
    name: `Linear (${ESTIMATION_SCALES.linear})`,
    scale: ESTIMATION_SCALES.linear,
  },
];
