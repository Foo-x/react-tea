import type { Dispatch, EffectCallback } from 'react';
import { useEffect } from 'react';

export type NoProps = {
  readonly _NoPropsBrand: unique symbol;
};

export type Effect<Model, Msg> = (
  model: Model,
  dispatch: Dispatch<Msg>
) => void;
export type EffectWithProps<Model, Msg, Props = NoProps> = Props extends NoProps
  ? () => Effect<Model, Msg>
  : (props: Props) => Effect<Model, Msg>;

export type Sub<Model, Msg, Props = NoProps> = EffectWithProps<
  Model,
  Msg,
  Props
>[];

export type EffectorProps<Model, Msg, Props = NoProps> = Props extends NoProps
  ? {
      model: Model;
      dispatch: Dispatch<Msg>;
    }
  : {
      model: Model;
      dispatch: Dispatch<Msg>;
      props: Props;
    };
export type Effector<Model, Msg, Props = NoProps> = (
  effectorProps: EffectorProps<Model, Msg, Props>
) => [EffectCallback, unknown[]] | [EffectCallback];

const none = <Model, Msg, Props = NoProps>(): Sub<Model, Msg, Props> => {
  return [];
};

const of = <Model, Msg, Props = NoProps>(
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
  return [useSub] as Sub<Model, Msg, Props>;
};

const batch = <Model, Msg, Props = NoProps>(
  ...subs: Sub<Model, Msg, Props>[]
): Sub<Model, Msg, Props> => {
  return subs.flat() as Sub<Model, Msg, Props>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Sub = { none, of, batch };
