import type { Cmd } from './Cmd';
import type {
  Dispatcher,
  NullableProps,
  NullObject,
  WithProps,
} from './commonTypes';
import type { Effect, EffectorProps, Sub } from './Sub';
import type { UseTeaUpdateProps } from './useTea';
import { useTea } from './useTea';

export type InitProps<Props extends NullableProps = never> = WithProps<
  Record<string, unknown>,
  Props
>;
export type Init<Model, Msg, Props extends NullableProps = never> = (
  initProps: InitProps<Props>
) => [Model, Cmd<Msg>];

export type UpdateProps<
  Model,
  Msg,
  Props extends NullableProps = never
> = WithProps<UseTeaUpdateProps<Model, Msg>, Props>;
export type Update<Model, Msg, Props extends NullableProps = never> = (
  updateProps: UpdateProps<Model, Msg, Props>
) => [Model, Cmd<Msg>];

export type ViewProps<Model, Msg> = Dispatcher<Model, Msg>;
export type WithViewProps<Model, Msg, Props extends NullableProps = never> = [
  Props
] extends [NullObject]
  ? ViewProps<Model, Msg>
  : ViewProps<Model, Msg> & Props;
export type WithoutViewProps<Props extends NullableProps> = Omit<
  Props,
  'model' | 'dispatch'
>;
export type View<Model, Msg, Props extends NullableProps = never> = React.VFC<
  WithViewProps<Model, Msg, Props>
>;

const applyPropsToSub = <Model, Msg, Props extends NullableProps = never>(
  props: Props
): ((subscription: Effect<Model, Msg, Props>) => Effect<Model, Msg, never>) => {
  return (subscription) =>
    ({ model, dispatch }: EffectorProps<Model, Msg>) =>
      subscription({
        model,
        dispatch,
        props,
      } as EffectorProps<Model, Msg, Props>);
};

export type TeaProps<
  Model,
  Msg,
  Props extends ViewProps<Model, Msg> = ViewProps<Model, Msg>
> = {
  init: Init<Model, Msg, WithoutViewProps<Props>> | Init<Model, Msg>;
  update: Update<Model, Msg, WithoutViewProps<Props>> | Update<Model, Msg>;
  subscriptions: Sub<Model, Msg, WithoutViewProps<Props>>;
  view: React.VFC<Props>;
};

export const Tea = <
  Model,
  Msg,
  Props extends ViewProps<Model, Msg> = ViewProps<Model, Msg>
>(
  teaProps: TeaProps<Model, Msg, Props>
) => {
  const {
    init: initWithoutProps,
    update: updateWithoutProps,
    subscriptions: subscriptionsWithoutProps,
    view,
  } = teaProps;
  const TeaComponent = (propsWithoutViewProps: WithoutViewProps<Props>) => {
    const init = () => initWithoutProps({ props: propsWithoutViewProps });

    const update = ({ model, msg }: UseTeaUpdateProps<Model, Msg>) =>
      updateWithoutProps({
        model,
        msg,
        props: propsWithoutViewProps,
      } as UpdateProps<Model, Msg, WithoutViewProps<Props>>);

    const subscriptions = (() => {
      if (typeof subscriptionsWithoutProps === 'symbol') {
        return [];
      }
      return [subscriptionsWithoutProps]
        .flat()
        .map(applyPropsToSub(propsWithoutViewProps));
    })();

    const useTeaResult = useTea({
      init,
      update,
      subscriptions,
    });

    const props = {
      ...propsWithoutViewProps,
      ...useTeaResult,
    } as Props;

    return view({ ...props });
  };
  return TeaComponent;
};
