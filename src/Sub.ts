import type { Dispatch, EffectCallback } from 'react';
import { useEffect } from 'react';

export type Effect<Model, Msg> = (
  model: Model,
  dispatch: Dispatch<Msg>
) => void;
export type EffectWithProps<Model, Msg, Props = Record<string, never>> = (
  props: Props
) => Effect<Model, Msg>;

export type Sub<Model, Msg, Props = Record<string, never>> = EffectWithProps<
  Model,
  Msg,
  Props
>[];

export type EffectorProps<
  Model,
  Msg,
  Props = Record<string, never>
> = Props extends Record<string, never>
  ? {
      model: Model;
      dispatch: Dispatch<Msg>;
    }
  : {
      model: Model;
      dispatch: Dispatch<Msg>;
      props: Props;
    };
export type Effector<Model, Msg, Props = Record<string, never>> = (
  effectorProps: EffectorProps<Model, Msg, Props>
) => [EffectCallback, unknown[]] | [EffectCallback];

const none = <Model, Msg, Props = Record<string, never>>(): Sub<
  Model,
  Msg,
  Props
> => {
  return [];
};

const of = <Model, Msg, Props = Record<string, never>>(
  effector: Effector<Model, Msg, Props>
): Sub<Model, Msg, Props> => {
  const useSub = (props: Props) => {
    const useSubWithProps = (model: Model, dispatch: Dispatch<Msg>) => {
      const [effect, deps] = effector({
        model,
        dispatch,
        props,
      } as EffectorProps<Model, Msg, Props>);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useEffect(effect, deps);
    };
    return useSubWithProps;
  };
  return [useSub];
};

const batch = <Model, Msg, Props = Record<string, never>>(
  ...subs: Sub<Model, Msg, Props>[]
): Sub<Model, Msg, Props> => {
  return subs.flat() as Sub<Model, Msg, Props>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Sub = { none, of, batch };
