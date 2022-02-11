import { Dispatch, useCallback } from 'react';
import type { Cmd } from './Cmd';
import type { NoProps, Sub } from './Sub';
import type { UseTeaUpdateProps } from './useTea';
import { useTea } from './useTea';

export type InitProps<Props = NoProps> = {
  props: Props;
};
export type Init<Model, Msg, Props = NoProps> = (
  initProps: InitProps<Props>
) => [Model, Cmd<Msg>];

export type UpdateProps<Model, Msg, Props = NoProps> = UseTeaUpdateProps<
  Model,
  Msg
> & {
  props: Props;
};
export type Update<Model, Msg, Props = NoProps> = (
  updateProps: UpdateProps<Model, Msg, Props>
) => [Model, Cmd<Msg>];

export type ViewProps<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};

export type WithViewProps<Model, Msg, Props = NoProps> = ViewProps<Model, Msg> &
  Props;
export type WithoutViewProps<Props> = Omit<Props, 'model' | 'dispatch'>;

export type TeaProps<Model, Msg, Props extends ViewProps<Model, Msg>> = {
  init: Init<Model, Msg, WithoutViewProps<Props>>;
  update: Update<Model, Msg, WithoutViewProps<Props>>;
  subscriptions: Sub<Model, Msg, WithoutViewProps<Props>>;
  view: React.VFC<Props>;
};

export const Tea = <Model, Msg, Props extends ViewProps<Model, Msg>>({
  init: initWithoutProps,
  update: updateWithoutProps,
  subscriptions: subscriptionsWithoutProps,
  view,
}: TeaProps<Model, Msg, Props>) => {
  const TeaComponent = (propsWithoutViewProps: WithoutViewProps<Props>) => {
    const init = () => initWithoutProps({ props: propsWithoutViewProps });
    const update = useCallback(
      ({ model, msg }: UseTeaUpdateProps<Model, Msg>) =>
        updateWithoutProps({ model, msg, props: propsWithoutViewProps }),
      [propsWithoutViewProps]
    );
    const subscriptions = (() => {
      if (subscriptionsWithoutProps == null) {
        return [];
      }
      if (Array.isArray(subscriptionsWithoutProps)) {
        return subscriptionsWithoutProps.map((sub) =>
          sub(propsWithoutViewProps)
        );
      }
      return [subscriptionsWithoutProps(propsWithoutViewProps)];
    })();
    const [model, dispatch] = useTea({ init, update, subscriptions });

    const props = { ...propsWithoutViewProps, model, dispatch } as Props;
    return view({ ...props });
  };
  return TeaComponent;
};
