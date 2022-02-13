import { useCallback, useMemo } from 'react';

export const exhaustiveCheck = (_: never): never => {
  throw new Error('Exhaustive check failed.');
};

export const hook = <P extends unknown[], R>(
  hookToUse: (...params: P) => R,
  ...params: P
): R => {
  return hookToUse(...params);
};

export const memo = <T>(factory: () => T, deps: unknown[] | undefined): T => {
  return hook(useMemo, factory, deps);
};

export const memoCallback = <T extends (...args: any[]) => unknown>(
  callback: T,
  deps: unknown[]
): T => {
  return hook(useCallback, callback, deps);
};
