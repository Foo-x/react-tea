import type { Dispatch } from 'react';
import type { Sub } from './Sub';
import type { Init, Update } from './useTea';
import { useTea } from './useTea';

export type ViewProps<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};

export type WithViewProps<Model, Msg, Props = unknown> = ViewProps<Model, Msg> &
  Props;
export type WithoutViewProps<Props> = Omit<Props, 'model' | 'dispatch'>;

export type TeaProps<Model, Msg, Props extends ViewProps<Model, Msg>> = {
  init: Init<Model, Msg>;
  update: Update<Model, Msg>;
  view: React.VFC<Props>;
  subscriptions: Sub<Model, Msg, WithoutViewProps<Props>>;
};

export const Tea = <Model, Msg, Props extends ViewProps<Model, Msg>>({
  init,
  update,
  view,
  subscriptions: subscriptionsWithoutProps,
}: TeaProps<Model, Msg, Props>) => {
  const TeaComponent = (propsWithoutViewProps: WithoutViewProps<Props>) => {
    const subscriptions = subscriptionsWithoutProps.map((sub) =>
      sub(propsWithoutViewProps)
    );
    const [model, dispatch] = useTea({ init, update, subscriptions });

    const props = { ...propsWithoutViewProps, model, dispatch } as Props;
    return view({ ...props });
  };
  return TeaComponent;
};
