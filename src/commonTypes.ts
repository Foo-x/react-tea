import type { Dispatch } from 'react';

export type None = null | undefined;
export type Nullable<T> = T | None;

export type NullableProps = Nullable<Record<string, unknown>>;

export type NullObject = Record<string, never> | None | never;

export type WithProps<T, Props> = [Props] extends [NullObject]
  ? T
  : T & { props: Props };
export type WithHooksResult<T, HooksResult> = [HooksResult] extends [
  Record<string, never> | None | never
]
  ? T
  : T & { hooksResult: HooksResult };

export type Dispatcher<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};
