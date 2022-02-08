import { Cmd } from '@/Cmd';
import { Sub } from '@/Sub';
import { Tea, WithViewProps } from '@/Tea';
import { Init, Update } from '@/useTea';
import { render, screen } from '@testing-library/react';

type Model = number;

type Msg = 'increment';

const init: Init<Model, Msg> = () => [0, Cmd.none()];

const update: Update<Model, Msg> = (model, msg) => {
  switch (msg) {
    case 'increment':
      return [model + 1, Cmd.none()];

    default:
      return msg;
  }
};

const subscriptions: Sub<Model, Msg> = Sub.none();

type Props = WithViewProps<Model, Msg>;

const view = ({ model, dispatch }: Props) => {
  return (
    <div>
      <button type='button' onClick={() => dispatch('increment')}>
        {model}
      </button>
    </div>
  );
};

const Sut = Tea({ init, view, update, subscriptions });

describe('Tea', () => {
  test('view', () => {
    render(
      <Sut>
        <div>children</div>
      </Sut>
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('update', () => {
    render(
      <Sut>
        <div>children</div>
      </Sut>
    );

    screen.getByRole('button').click();

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
