import type { Dispatch } from 'react';

export type WithProps<T, Props> = [Props] extends [
  never | undefined | null | Record<string, never>
]
  ? T
  : T & { props: Props };

export type Dispatcher<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};
