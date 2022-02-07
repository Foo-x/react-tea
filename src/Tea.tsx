import type { Dispatch } from './cmd';
import type { UseTeaProps } from './useTea';
import { useTea } from './useTea';

type ViewProps<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};

export type WithViewProps<Model, Msg, Props = unknown> = ViewProps<Model, Msg> &
  Props;

type TeaProps<Model, Msg, Props extends ViewProps<Model, Msg>> = UseTeaProps<
  Model,
  Msg
> & {
  View: React.VFC<Props>;
};

export const Tea = <Model, Msg, Props extends ViewProps<Model, Msg>>({
  init,
  View,
  update,
}: TeaProps<Model, Msg, Props>): React.VFC<
  Omit<Props, 'model' | 'dispatch'>
> => {
  const [model, dispatch] = useTea({ init, update });
  return (propsWithoutViewProps) => {
    const props = { ...propsWithoutViewProps, model, dispatch } as Props;
    return <View {...props} />;
  };
};
