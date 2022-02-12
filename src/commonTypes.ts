import type { Dispatch } from 'react';

export type None = null | undefined;
export type Nullable<T> = T | None;

export type NullableProps = Nullable<Record<string, unknown>>;

export type NullObject = Record<string, never> | None | never;

export type MergeIfExists<
  ToCheck,
  T extends Record<string, unknown>,
  MergedKey extends string,
  MergedValue
> = [ToCheck] extends [NullObject] ? T : T & { [k in MergedKey]: MergedValue };
export type AppendIfExists<ToCheck, T extends unknown[], Appended> = [
  ToCheck
] extends [NullObject]
  ? T
  : [...T, Appended];

export type WithProps<T extends Record<string, unknown>, Props> = MergeIfExists<
  Props,
  T,
  'props',
  Props
>;
export type WithHooksResult<
  T extends Record<string, unknown>,
  HooksResult
> = MergeIfExists<HooksResult, T, 'hooksResult', HooksResult>;

export type Dispatcher<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};
