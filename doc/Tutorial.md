# Tutorial

## Types

First, define a few types.

- Model
    - the state of your component
- Msg
    - messages triggered by view to update your state
- Props
    - properties your component receives
    - **Note that the keys `model`, `dispatch`, and `hooksResult` are reserved, so you cannot define them.**
- HooksResult (Optional)
    - result of your custom Hook

```tsx
type Model = number;

type Msg = "increment" | "decrement";

type Props = {
  defaultValue: number;
};

type HooksResult = {
  increment: () => void;
  decrement: () => void;
};
```


## Functions

Second, create some functions.

- init
    - initialize the state and create first command
- update
    - update the state according to the message
- subscriptions
    - listeners that subscribe external events or component's lifecycle
- useHooks (Optional)
    - custom Hook to use other Hooks
- view
    - turn your state into HTML and dispatch messages

```tsx
const init: Init<Model, Msg, Props> = ({ props }) => [
  props.defaultValue,
  Cmd.none(),
];

const update: Update<Model, Msg, Props> = ({ model, msg }) => {
  switch (msg) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'decrement':
      return [model - 1, Cmd.none()];
  }
};

const subscriptions: Sub<Model, Msg, Props> = Sub.none();

const useHooks: UseHooks<Model, Msg, Props, HooksResult> = ({ dispatch }) => {
  return {
    increment: useCallback(() => dispatch('increment')),
    decrement: useCallback(() => dispatch('decrement')),
  };
};

const view: View<Model, Msg, Props> = ({
  model,
  defaultValue,
  hooksResult,
}) => {
  return (
    <div>
      <h2>Counter</h2>
      <h3>default: {defaultValue}</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type='button'
          onClick={hooksResult.decrement}
        >
          -
        </button>
        {model}
        <button
          type='button'
          onClick={hooksResult.increment}
        >
          +
        </button>
      </div>
    </div>
  );
};
```


## Components

Finally, call `Tea` with them and your component is ready!

```tsx
const Counter = Tea({ init, update, subscriptions, useHooks, view });
```

For more information, see:

- [Examples](../README.md#examples)
- [Reference](./Reference.md)
- [Data Flow Diagram](./dev/DataFlowDiagram.md)
