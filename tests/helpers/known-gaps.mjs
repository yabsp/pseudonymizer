// For tests of correct behavior the code doesn't have yet: reported as TODO instead of failing, so the
// suite stays a regression guard. STRICT_KNOWN_GAPS=1 runs them as normal tests.
export const knownGap = (reason) => (process.env.STRICT_KNOWN_GAPS ? {} : { todo: reason });
