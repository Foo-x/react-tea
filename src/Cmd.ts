import type { Dispatch } from 'react';

export const cmdNoneSymbol = Symbol('Cmd.none');

export type Action<Msg> = (dispatch: Dispatch<Msg>) => void;
export type PromiseAction<Msg> = (dispatch: Dispatch<Msg>) => Promise<void>;
export type Cmd<Msg> =
  | PromiseAction<Msg>
  | PromiseAction<Msg>[]
  | typeof cmdNoneSymbol;

const none = (): typeof cmdNoneSymbol => {
  return cmdNoneSymbol;
};

const delay = <Msg>(
  action: Action<Msg>,
  timeout: number
): PromiseAction<Msg> => {
  return (dispatch) =>
    new Promise((resolve) => {
      setTimeout(() => {
        action(dispatch);
        resolve();
      }, timeout);
    });
};

const promise = <Msg>(
  promiseAction: PromiseAction<Msg>
): PromiseAction<Msg> => {
  return promiseAction;
};

const batch = <Msg>(...cmds: PromiseAction<Msg>[]): PromiseAction<Msg>[] => {
  return cmds;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Cmd = { none, delay, promise, batch };
