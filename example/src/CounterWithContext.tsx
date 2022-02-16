import { Cmd, Init, Sub, Tea, Update, UseHooks, View } from '@foo-x/react-tea';
import {
  createContext,
  Dispatch,
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useContext,
} from 'react';

// Context

type ContextModel = number;

type ContextMsg = 'increment' | 'decrement';

type ContextProps = PropsWithChildren<{
  defaultValue: number;
}>;

export const contextInit: Init<ContextModel, ContextMsg, ContextProps> = ({
  props,
}) => [props.defaultValue, Cmd.none()];

export const contextUpdate: Update<ContextModel, ContextMsg, ContextProps> = ({
  model,
  msg,
}) => {
  switch (msg) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'decrement':
      return [model - 1, Cmd.none()];
  }
};

export const CounterStateContext = createContext(0);
export const CounterDispatchContext = createContext<Dispatch<ContextMsg>>(
  () => {}
);

export const contextView: View<ContextModel, ContextMsg, ContextProps> = ({
  model,
  dispatch,
  children,
}) => {
  return (
    <CounterStateContext.Provider value={model}>
      <CounterDispatchContext.Provider value={dispatch}>
        {children}
      </CounterDispatchContext.Provider>
    </CounterStateContext.Provider>
  );
};

const CounterContextProvider = Tea({
  init: contextInit,
  update: contextUpdate,
  view: contextView,
  subscriptions: Sub.none(),
});

// Child

type ChildModel = null;

type ChildMsg = never;

type ChildProps = {
  title: string;
};

type ChildHooksResult = {
  counterState: ContextModel;
  onClickIncrement: MouseEventHandler<HTMLButtonElement>;
  onClickDecrement: MouseEventHandler<HTMLButtonElement>;
};

export const childInit: Init<ChildModel, ChildMsg, ChildProps> = () => [
  null,
  Cmd.none(),
];

export const childUpdate: Update<ChildModel, ChildMsg, ChildProps> = () => [
  null,
  Cmd.none(),
];

export const useChildHooks: UseHooks<
  ChildModel,
  ChildMsg,
  ChildProps,
  ChildHooksResult
> = () => {
  const dispatch = useContext(CounterDispatchContext);
  return {
    counterState: useContext(CounterStateContext),
    onClickIncrement: useCallback(
      (e) => {
        e.stopPropagation();
        dispatch('increment');
      },
      [dispatch]
    ),
    onClickDecrement: useCallback(
      (e) => {
        e.stopPropagation();
        dispatch('decrement');
      },
      [dispatch]
    ),
  };
};

export const childView: View<
  ChildModel,
  ChildMsg,
  ChildProps,
  ChildHooksResult
> = ({ hooksResult, title }) => {
  return (
    <div>
      <h3>{title}</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type='button' onClick={hooksResult.onClickDecrement}>
          -
        </button>
        {hooksResult.counterState}
        <button type='button' onClick={hooksResult.onClickIncrement}>
          +
        </button>
      </div>
    </div>
  );
};

const CounterWithContextChild = Tea({
  init: childInit,
  update: childUpdate,
  view: childView,
  subscriptions: Sub.none(),
  useHooks: useChildHooks,
});

// Parent

type ParentModel = null;

type ParentMsg = never;

type ParentProps = {};

export const parentInit: Init<ParentModel, ParentMsg, ParentProps> = () => [
  null,
  Cmd.none(),
];

export const parentUpdate: Update<ParentModel, ParentMsg, ParentProps> = () => [
  null,
  Cmd.none(),
];

export const parentView: View<ParentModel, ParentMsg, ParentProps> = () => {
  return (
    <CounterContextProvider defaultValue={10}>
      <h2>Counter with context</h2>
      <CounterWithContextChild title='Child 1' />
      <CounterWithContextChild title='Child 2' />
    </CounterContextProvider>
  );
};

const CounterWithContext = Tea({
  init: parentInit,
  update: parentUpdate,
  view: parentView,
  subscriptions: Sub.none(),
});

export default CounterWithContext;
