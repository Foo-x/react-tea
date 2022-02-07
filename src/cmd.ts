export type Dispatch<Msg> = (msg: Msg) => void;
export type Action<Msg> = (dispatch: Dispatch<Msg>) => void;
export type PromiseAction<Msg> = (dispatch: Dispatch<Msg>) => Promise<void>;
export type Cmd<Msg> = Set<Action<Msg> | PromiseAction<Msg>>;

export const none = <Msg>(): Cmd<Msg> => {
  return new Set();
};

export const delay = <Msg>(action: Action<Msg>, timeout: number): Cmd<Msg> => {
  return new Set([(dispatch) => setTimeout(() => action(dispatch), timeout)]);
};

export const promise = <Msg>(promiseAction: PromiseAction<Msg>): Cmd<Msg> => {
  return new Set([(dispatch) => promiseAction(dispatch)]);
};

export const batch = <Msg>(...cmds: Cmd<Msg>[]): Cmd<Msg> => {
  return cmds.reduce((pre, cur) => new Set([...pre, ...cur]), new Set());
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Cmd = { none, delay, promise, batch };
