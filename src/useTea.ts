import type { Dispatch } from 'react';
import { useEffect, useReducer } from 'react';
import type { Cmd } from './Cmd';
import type {
  AppendIfExists,
  MergeIfExists,
  WithHooksResult,
} from './commonTypes';
import type { Effect, EffectorProps } from './Sub';

export type UseTeaInit<Model, Msg> = () => [Model, Cmd<Msg>];

export type UseTeaUpdateProps<
  Model,
  Msg,
  HooksResult = never
> = WithHooksResult<
  {
    model: Model;
    msg: Msg;
  },
  HooksResult
>;
export type UseTeaUpdate<Model, Msg, HooksResult = never> = (
  useTeaUpdateProps: UseTeaUpdateProps<Model, Msg, HooksResult>
) => [Model, Cmd<Msg>];

export type UseTeaUseHooks<HooksResult> = () => HooksResult;

export type UseTeaProps<Model, Msg, HooksResult = never> = MergeIfExists<
  HooksResult,
  {
    init: UseTeaInit<Model, Msg>;
    update: UseTeaUpdate<Model, Msg, HooksResult>;
    subscriptions: Effect<Model, Msg, HooksResult>[];
  },
  'useHooks',
  UseTeaUseHooks<HooksResult>
>;

export type UseTeaResult<Model, Msg, HooksResult = never> = AppendIfExists<
  HooksResult,
  [Model, Dispatch<Msg>],
  HooksResult
>;

export const useTea = <Model, Msg, HooksResult = never>(
  useTeaProps: UseTeaProps<Model, Msg, HooksResult>
): UseTeaResult<Model, Msg, HooksResult> => {
  const { init, update, subscriptions } = useTeaProps;
  const hooksResult = (() => {
    if ('useHooks' in useTeaProps) {
      return useTeaProps.useHooks();
    }
    return undefined;
  })();

  const reducer = ([model]: [Model, Cmd<Msg>], msg: Msg): [Model, Cmd<Msg>] =>
    update({ model, msg, hooksResult } as UseTeaUpdateProps<
      Model,
      Msg,
      HooksResult
    >);

  const [[model, cmd], dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    if (typeof cmd === 'symbol') {
      return;
    }
    [cmd].flat().forEach((cmdUnit) => cmdUnit(dispatch));
  }, [cmd]);

  subscriptions.forEach((sub) =>
    sub({ model, dispatch, hooksResult } as EffectorProps<
      Model,
      Msg,
      HooksResult
    >)
  );

  if (hooksResult) {
    return [model, dispatch, hooksResult] as UseTeaResult<
      Model,
      Msg,
      HooksResult
    >;
  }
  return [model, dispatch] as UseTeaResult<Model, Msg, HooksResult>;
};
