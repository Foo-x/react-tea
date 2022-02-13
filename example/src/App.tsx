import {
  Cmd,
  exhaustiveCheck,
  Init,
  Sub,
  Tea,
  Update,
  View,
} from '@foo-x/react-tea';
import { ReactElement } from 'react';
import './App.css';
import CounterWithEffects from './CounterWithEffects';
import SimpleCounter from './SimpleCounter';

type Model = ReactElement | null;

type Msg = 'simple-counter' | 'counter-with-effects';

const init: Init<Model, Msg> = () => [null, Cmd.none()];

const update: Update<Model, Msg> = ({ msg }) => {
  switch (msg) {
    case 'simple-counter':
      return [<SimpleCounter />, Cmd.none()];

    case 'counter-with-effects':
      return [<CounterWithEffects defaultValue={10} />, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
  }
};

const subscriptions: Sub<Model, Msg> = Sub.none();

const view: View<Model, Msg> = ({ model, dispatch }) => {
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
      </ul>
      {model}
    </div>
  );
};

const App = Tea({ init, update, subscriptions, view });

export default App;
