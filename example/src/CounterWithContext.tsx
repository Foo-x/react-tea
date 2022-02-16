import { Cmd, Init, Sub, Tea, Update, UseHooks, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren, useContext } from 'react';

// Context

type ContextModel = number;

type ContextMsg = 'increment' | 'decrement';

type ContextProps = PropsWithChildren<{
  defaultValue: number;
}>;

const contextInit: Init<ContextModel, ContextMsg, ContextProps> = ({
  props,
}) => [props.defaultValue, Cmd.none()];

const contextUpdate: Update<ContextModel, ContextMsg, ContextProps> = ({
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

const CounterStateContext = createContext(0);
const CounterDispatchContext = createContext<Dispatch<ContextMsg>>(() => {});

const contextView: View<ContextModel, ContextMsg, ContextProps> = ({
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
  counterDispatch: Dispatch<ContextMsg>;
};

const childInit: Init<ChildModel, ChildMsg, ChildProps> = () => [
  null,
  Cmd.none(),
];

const childUpdate: Update<ChildModel, ChildMsg, ChildProps> = () => [
  null,
  Cmd.none(),
];

const useChildHooks: UseHooks<
  ChildModel,
  ChildMsg,
  ChildProps,
  ChildHooksResult
> = () => {
  return {
    counterState: useContext(CounterStateContext),
    counterDispatch: useContext(CounterDispatchContext),
  };
};

const childView: View<ChildModel, ChildMsg, ChildProps, ChildHooksResult> = ({
  hooksResult,
  title,
}) => {
  return (
    <div>
      <h3>{title}</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            hooksResult.counterDispatch('decrement');
          }}
        >
          -
        </button>
        {hooksResult.counterState}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            hooksResult.counterDispatch('increment');
          }}
        >
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

const parentInit: Init<ParentModel, ParentMsg, ParentProps> = () => [
  null,
  Cmd.none(),
];

const parentUpdate: Update<ParentModel, ParentMsg, ParentProps> = () => [
  null,
  Cmd.none(),
];

const parentView: View<ParentModel, ParentMsg, ParentProps> = () => {
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
