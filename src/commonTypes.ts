import type { Dispatch } from 'react';

export type None = null | undefined;
export type NullObject = Record<string, never> | None | never;

export type MergeIfExists<
  ToCheck,
  T extends Record<string, unknown>,
  MergedKey extends string,
  MergedValue
> = [ToCheck] extends [NullObject] ? T : T & { [k in MergedKey]: MergedValue };

export type Dispatcher<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};
