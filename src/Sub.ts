import type { Dispatch, EffectCallback } from 'react';
import { useEffect } from 'react';

export type NoProps = {
  readonly _NoPropsBrand: unique symbol;
};

export const subNoneSymbol = Symbol('Sub.none');

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
export type Effect<Model, Msg, Props = NoProps> = (
  effectProps: EffectorProps<Model, Msg, Props>
) => void;

export type Sub<Model, Msg, Props = NoProps> =
  | Effect<Model, Msg, Props>
  | Effect<Model, Msg, Props>[]
  | typeof subNoneSymbol;

const none = (): typeof subNoneSymbol => {
  return subNoneSymbol;
};

const of = <Model, Msg, Props = NoProps>(
  effector: Effector<Model, Msg, Props>
): Effect<Model, Msg, Props> => {
  const useSub = ({
    model,
    dispatch,
    props,
  }: EffectorProps<Model, Msg> & { props: Props }) => {
    const [effect, deps] = effector({
      model,
      dispatch,
      props,
    } as EffectorProps<Model, Msg, Props>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, deps);
  };
  return useSub as Effect<Model, Msg, Props>;
};

const batch = <Model, Msg, Props = NoProps>(
  ...subs: Effect<Model, Msg, Props>[]
): Effect<Model, Msg, Props>[] => {
  return subs;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Sub = { none, of, batch };
