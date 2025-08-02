let isRefreshing = false;
let setLoading: ((loading: boolean) => void) | null = null;

export function setRefreshLoadingSetter(fn: (loading: boolean) => void) {
  setLoading = fn;
}

export function setRefreshLoading(loading: boolean) {
  isRefreshing = loading;
  if (setLoading) setLoading(loading);
}

export function getRefreshLoading() {
  return isRefreshing;
}