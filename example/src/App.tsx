import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { ReactElement } from 'react';
import './App.css';
import CounterWithContext from './CounterWithContext';
import CounterWithEffects from './CounterWithEffects';
import SimpleCounter from './SimpleCounter';

type Model = ReactElement | null;

type Msg = 'simple-counter' | 'counter-with-effects' | 'counter-with-context';

type Props = {};

const init: Init<Model, Msg, Props> = () => [null, Cmd.none()];

const update: Update<Model, Msg, Props> = ({ msg }) => {
  switch (msg) {
    case 'simple-counter':
      return [<SimpleCounter defaultValue={10} />, Cmd.none()];

    case 'counter-with-effects':
      return [<CounterWithEffects defaultValue={10} />, Cmd.none()];

    case 'counter-with-context':
      return [<CounterWithContext />, Cmd.none()];
  }
};

const subscriptions: Sub<Model, Msg, Props> = Sub.none();

const view: View<Model, Msg, Props> = ({ model, dispatch }) => {
  return (
    <div style={{ margin: '5rem auto', maxWidth: '400px' }}>
      <ul>
        <li>
          <a
            href='#simple-counter'
            onClick={() => {
              dispatch('simple-counter');
            }}
          >
            Simple Counter
          </a>
        </li>
        <li>
          <a
            href='#counter-with-effects'
            onClick={() => {
              dispatch('counter-with-effects');
            }}
          >
            Counter with effects
          </a>
        </li>
        <li>
          <a
            href='#counter-with-context'
            onClick={() => {
              dispatch('counter-with-context');
            }}
          >
            Counter with context
          </a>
        </li>
      </ul>
      {model}
    </div>
  );
};

const App = Tea({ init, update, subscriptions, view });

export default App;
