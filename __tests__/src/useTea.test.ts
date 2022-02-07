import { Cmd } from '@/cmd';
import { Init, Update, useTea } from '@/useTea';
import { act, renderHook } from '@testing-library/react-hooks';

type Model = number;

type Msg = 'increment' | 'increment-with-cmd' | 'increment-with-batch';

const init: Init<Model, Msg> = () => [0, Cmd.none()];

const update: Update<Model, Msg> = (model, msg) => {
  switch (msg) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'increment-with-cmd':
      return [model + 1, Cmd.delay((dispatch) => dispatch('increment'), 100)];

    case 'increment-with-batch':
      return [
        model + 1,
        Cmd.batch(
          Cmd.delay((dispatch) => dispatch('increment'), 100),
          Cmd.delay((dispatch) => dispatch('increment'), 200)
        ),
      ];

    default:
      return msg;
  }
};

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('useTea', () => {
  test('initial model and dispatch', () => {
    const { result } = renderHook(() => useTea({ init, update }));

    expect(result.current[0]).toBe(0);
    expect(typeof result.current[1]).toBe('function');
  });

  test('rerender on dispatch', () => {
    let count = 0;
    const { result } = renderHook(() => {
      count += 1;
      return useTea({ init, update });
    });

    expect(result.current[0]).toBe(0);
    expect(count).toBe(1);

    act(() => {
      result.current[1]('increment');
    });

    expect(result.current[0]).toBe(1);
    expect(count).toBe(2);
  });

  test('rerender on cmd', () => {
    let count = 0;
    const { result } = renderHook(() => {
      count += 1;
      return useTea({ init, update });
    });

    expect(result.current[0]).toBe(0);
    expect(count).toBe(1);

    act(() => {
      result.current[1]('increment-with-cmd');
    });

    expect(result.current[0]).toBe(1);
    expect(count).toBe(2);

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current[0]).toBe(2);
    expect(count).toBe(3);
  });

  test('rerender on each cmd', () => {
    let count = 0;
    const { result } = renderHook(() => {
      count += 1;
      return useTea({ init, update });
    });

    expect(result.current[0]).toBe(0);
    expect(count).toBe(1);

    act(() => {
      result.current[1]('increment-with-batch');
    });

    expect(result.current[0]).toBe(1);
    expect(count).toBe(2);

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current[0]).toBe(3);
    expect(count).toBe(4);
  });

  test('cmd in init', () => {
    const { result } = renderHook(() =>
      useTea({
        init: () => [
          0,
          Cmd.delay<Msg>((dispatch) => dispatch('increment'), 100),
        ],
        update,
      })
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current[0]).toBe(1);
  });
});
