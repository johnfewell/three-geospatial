// Identifies this fork build, so a consumer that depends on fork-only
// semantics can check them at load time instead of rendering wrong output.
// raySpheresIntersectionsLanes is the number of radius lanes the mask covers.
// r186Kernels: the atmosphere LUT kernels compile correctly on three r186.
export const forkBuild = {
  release: 8,
  raySpheresIntersectionsLanes: 4,
  r186Kernels: true
} as const
