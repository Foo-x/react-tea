import type { Dispatch } from 'react';

export type None = null | undefined;
export type Nullable<T> = T | None;

export type NullableProps = Nullable<Record<string, unknown>>;

export type NullObject = Record<string, never> | None | never;

export type MergeIfExists<T, R, K extends string> = [R] extends [NullObject]
  ? T
  : T & { [k in K]: R };

export type WithProps<T, Props> = MergeIfExists<T, Props, 'props'>;
export type WithHooksResult<T, HooksResult> = MergeIfExists<
  T,
  HooksResult,
  'hooksResult'
>;

export type Dispatcher<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};
