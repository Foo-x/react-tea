import type { Dispatch } from 'react';

export type Action<Msg> = (dispatch: Dispatch<Msg>) => void;
export type PromiseAction<Msg> = (dispatch: Dispatch<Msg>) => Promise<void>;
export type Cmd<Msg> =
  | Action<Msg>
  | PromiseAction<Msg>
  | Array<Action<Msg> | PromiseAction<Msg>>
  | null;

const none = () => {
  return null;
};

const delay = <Msg>(action: Action<Msg>, timeout: number): Action<Msg> => {
  return (dispatch) => setTimeout(() => action(dispatch), timeout);
};

const promise = <Msg>(
  promiseAction: PromiseAction<Msg>
): PromiseAction<Msg> => {
  return promiseAction;
};

const batch = <Msg>(
  ...cmds: Array<Action<Msg> | PromiseAction<Msg>>
): Array<Action<Msg> | PromiseAction<Msg>> => {
  return cmds;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Cmd = { none, delay, promise, batch };
