// Identifies this fork build of the atmosphere package, so a consumer can check
// the atmosphere's own fork-only semantics instead of inferring them from core.
// r186Kernels: the atmosphere LUT kernels compile correctly on three r186.
export const forkBuild = {
  release: 7,
  r186Kernels: true
} as const
