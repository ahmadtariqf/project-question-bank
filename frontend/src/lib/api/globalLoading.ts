let setGlobalLoading: (loading: boolean) => void = () => {};

export function registerGlobalLoadingSetter(fn: (loading: boolean) => void) {
  setGlobalLoading = fn;
}

export function setGlobalLoadingState(loading: boolean) {
  setGlobalLoading(loading);
}