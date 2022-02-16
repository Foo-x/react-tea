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

type Props = {};

const init: Init<Model, Msg, Props> = () => [null, Cmd.none()];

const update: Update<Model, Msg, Props> = ({ msg }) => {
  switch (msg) {
    case 'simple-counter':
      return [<SimpleCounter defaultValue={10} />, Cmd.none()];

    case 'counter-with-effects':
      return [<CounterWithEffects defaultValue={10} />, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
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
      </ul>
      {model}
    </div>
  );
};

const App = Tea({ init, update, subscriptions, view });

export default App;
