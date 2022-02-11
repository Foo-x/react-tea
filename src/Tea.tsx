import { Dispatch, useCallback } from 'react';
import type { Cmd } from './Cmd';
import type { EffectorProps, Sub } from './Sub';
import type { UseTeaUpdateProps } from './useTea';
import { useTea } from './useTea';

export type InitProps<Props = never> = {
  props: Props;
};
export type Init<Model, Msg, Props = never> = (
  initProps: InitProps<Props>
) => [Model, Cmd<Msg>];

export type UpdateProps<Model, Msg, Props = never> = UseTeaUpdateProps<
  Model,
  Msg
> & {
  props: Props;
};
export type Update<Model, Msg, Props = never> = (
  updateProps: UpdateProps<Model, Msg, Props>
) => [Model, Cmd<Msg>];

export type ViewProps<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};

export type WithViewProps<Model, Msg, Props = never> = ViewProps<Model, Msg> &
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
      if (typeof subscriptionsWithoutProps === 'symbol') {
        return [];
      }
      if (Array.isArray(subscriptionsWithoutProps)) {
        return subscriptionsWithoutProps.map(
          (sub) =>
            ({ model, dispatch }: EffectorProps<Model, Msg>) =>
              sub({
                model,
                dispatch,
                props: propsWithoutViewProps,
              } as EffectorProps<Model, Msg, WithoutViewProps<Props>>)
        );
      }
      return [
        ({ model, dispatch }: EffectorProps<Model, Msg>) =>
          subscriptionsWithoutProps({
            model,
            dispatch,
            props: propsWithoutViewProps,
          } as EffectorProps<Model, Msg, WithoutViewProps<Props>>),
      ];
    })();
    const [model, dispatch] = useTea({ init, update, subscriptions });

    const props = { ...propsWithoutViewProps, model, dispatch } as Props;
    return view({ ...props });
  };
  return TeaComponent;
};
