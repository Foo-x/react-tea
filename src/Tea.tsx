import type { Dispatch } from 'react';
import type { Cmd } from './Cmd';
import type { Dispatcher, MergeIfExists } from './commonTypes';
import type { Effect, EffectorProps, Sub } from './Sub';
import type { UseTeaUpdateProps } from './useTea';
import { useTea } from './useTea';

export type InitProps<Props> = {
  props: Props;
};
export type Init<Model, Msg, Props> = (
  initProps: InitProps<Props>
) => [Model, Cmd<Msg>];

export type UpdateProps<Model, Msg, Props> = UseTeaUpdateProps<Model, Msg> & {
  props: Props;
};
export type Update<Model, Msg, Props> = (
  updateProps: UpdateProps<Model, Msg, Props>
) => [Model, Cmd<Msg>];

type WithHooksResult<
  T extends Record<string, unknown>,
  HooksResult
> = MergeIfExists<HooksResult, T, 'hooksResult', HooksResult>;

export type UseHooksProps<Model, Msg, Props> = {
  model: Model;
  dispatch: Dispatch<Msg>;
  props: Props;
};
export type UseHooks<Model, Msg, Props, HooksResult> = (
  useHooksProps: UseHooksProps<Model, Msg, Props>
) => HooksResult;

export type ViewProps<Model, Msg, Props, HooksResult = never> = WithHooksResult<
  Dispatcher<Model, Msg> & {
    props: Props;
  },
  HooksResult
>;
export type View<Model, Msg, Props, HooksResult = never> = React.VFC<
  ViewProps<Model, Msg, Props, HooksResult>
>;

const applyPropsToSub = <Model, Msg, Props>(
  props: Props
): ((subscription: Effect<Model, Msg, Props>) => Effect<Model, Msg, never>) => {
  return (subscription) =>
    ({ model, dispatch }: EffectorProps<Model, Msg, never>) =>
      subscription({
        model,
        dispatch,
        props,
      });
};

export type TeaProps<Model, Msg, Props, HooksResult = never> = MergeIfExists<
  HooksResult,
  {
    init: Init<Model, Msg, Props>;
    update: Update<Model, Msg, Props>;
    subscriptions: Sub<Model, Msg, Props>;
    view: View<Model, Msg, Props, HooksResult>;
  },
  'useHooks',
  UseHooks<Model, Msg, Props, HooksResult>
>;
export const Tea = <Model, Msg, Props, HooksResult = never>(
  teaProps: TeaProps<Model, Msg, Props, HooksResult>
) => {
  const {
    init: initWithoutProps,
    update: updateWithoutProps,
    subscriptions: subscriptionsWithoutProps,
    view,
  } = teaProps;
  const useHooks = (() => {
    if ('useHooks' in teaProps) {
      return teaProps.useHooks;
    }
    return () => ({} as HooksResult);
  })();
  const TeaComponent = (propsWithoutViewProps: Props) => {
    const init = () => initWithoutProps({ props: propsWithoutViewProps });

    const update = ({ model, msg }: UseTeaUpdateProps<Model, Msg>) =>
      updateWithoutProps({
        model,
        msg,
        props: propsWithoutViewProps,
      });

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

    const hooksResult = useHooks({
      ...useTeaResult,
      props: propsWithoutViewProps,
    });

    const props = {
      ...useTeaResult,
      hooksResult,
      props: propsWithoutViewProps,
    };

    return view({ ...props });
  };
  return TeaComponent;
};
