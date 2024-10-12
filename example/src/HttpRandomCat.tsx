import {
  Cmd,
  exhaustiveCheck,
  Init,
  Sub,
  Tea,
  Update,
  View,
} from '@foo-x/react-tea';
import { Dispatch } from 'react';

const baseUrl = 'https://cataas.com/cat';
const jsonUrl = `${baseUrl}?json=true`;

type Model = string;

type Msg = { type: 'fetch-cat' } | { type: 'set-src'; src: string };

type Props = unknown;

export const init: Init<Model, Msg, Props> = () => [
  '',
  Cmd.perform(
    () => {
      return {
        type: 'fetch-cat',
      };
    },
    async () => {},
  ),
];

const fetchCat = async (dispatch: Dispatch<Msg>) => {
  const response = await fetch(jsonUrl);
  const json = await response.json();
  dispatch({ type: 'set-src', src: `${baseUrl}/${json._id}` });
};

export const update: Update<Model, Msg, Props> = ({ model, msg }) => {
  switch (msg.type) {
    case 'fetch-cat':
      return [model, Cmd.promise(fetchCat)];

    case 'set-src':
      return [msg.src, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
  }
};
export const subscriptions: Sub<Model, Msg, Props> = Sub.none();

export const view: View<Model, Msg, Props> = ({ model, dispatch }) => {
  return (
    <div>
      <h2>HTTP random cat</h2>
      <button
        type='button'
        onClick={() => {
          dispatch({ type: 'fetch-cat' });
        }}
        style={{ marginBottom: '1rem' }}
      >
        fetch new one
      </button>
      {model && <img src={model} alt='cat' style={{ maxWidth: '100%' }} />}
    </div>
  );
};

const HttpRandomCat = Tea({ init, update, subscriptions, view });

export default HttpRandomCat;
