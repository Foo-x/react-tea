import type { Dispatch } from 'react';

export type None = null | undefined;
export type Nullable<T> = T | None;

export type NullableProps = Nullable<Record<string, unknown>>;

export type WithProps<T, Props> = [Props] extends [
  Record<string, never> | None | never
]
  ? T
  : T & { props: Props };

export type Dispatcher<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};
