import { Cmd } from '@/Cmd';
import { Effect, Sub } from '@/Sub';
import { useTea, UseTeaInit, UseTeaUpdate } from '@/useTea';
import { exhaustiveCheck } from '@/utils';
import { act, renderHook } from '@testing-library/react-hooks';

type Model = { value: number; version: number };

type Msg =
  | 'increment'
  | 'increment-with-cmd'
  | 'increment-with-batch'
  | 'increment-with-same-version';

const init: UseTeaInit<Model, Msg> = () => [
  { value: 0, version: 0 },
  Cmd.none(),
];

const update: UseTeaUpdate<Model, Msg> = ({ model, msg }) => {
  switch (msg) {
    case 'increment':
      return [
        { value: model.value + 1, version: model.version + 1 },
        Cmd.none(),
      ];

    case 'increment-with-cmd':
      return [
        { value: model.value + 1, version: model.version + 1 },
        Cmd.delay((dispatch) => dispatch('increment'), 100),
      ];

    case 'increment-with-batch':
      return [
        { value: model.value + 1, version: model.version + 1 },
        Cmd.batch(
          Cmd.delay((dispatch) => dispatch('increment'), 100),
          Cmd.delay((dispatch) => dispatch('increment'), 200)
        ),
      ];

    case 'increment-with-same-version':
      return [{ value: model.value + 1, version: model.version }, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
  }
};

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('useTea', () => {
  describe('no subscription', () => {
    const subscriptions: Effect<Model, Msg>[] = [];

    test('initial model and dispatch', () => {
      const { result } = renderHook(() =>
        useTea({ init, update, subscriptions })
      );

      expect(result.current[0].value).toBe(0);
      expect(typeof result.current[1]).toBe('function');
    });

    test('rerender on dispatch', () => {
      let count = 0;
      const { result } = renderHook(() => {
        count += 1;
        return useTea({ init, update, subscriptions });
      });

      expect(result.current[0].value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current[1]('increment');
      });
      expect(result.current[0].value).toBe(1);
      expect(count).toBe(2);
    });

    test('rerender on cmd', () => {
      let count = 0;
      const { result } = renderHook(() => {
        count += 1;
        return useTea({ init, update, subscriptions });
      });

      expect(result.current[0].value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current[1]('increment-with-cmd');
      });
      expect(result.current[0].value).toBe(1);
      expect(count).toBe(2);

      act(() => {
        jest.runAllTimers();
      });
      expect(result.current[0].value).toBe(2);
      expect(count).toBe(3);
    });

    test('dispatch before cmd resolves', () => {
      let count = 0;
      const { result } = renderHook(() => {
        count += 1;
        return useTea({ init, update, subscriptions });
      });

      expect(result.current[0].value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current[1]('increment-with-cmd');
      });
      expect(result.current[0].value).toBe(1);
      expect(count).toBe(2);

      act(() => {
        result.current[1]('increment-with-cmd');
      });
      expect(result.current[0].value).toBe(2);
      expect(count).toBe(3);

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current[0].value).toBe(4);
      expect(count).toBe(4);
    });

    test('rerender on each cmd', () => {
      let count = 0;
      const { result } = renderHook(() => {
        count += 1;
        return useTea({ init, update, subscriptions });
      });

      expect(result.current[0].value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current[1]('increment-with-batch');
      });

      expect(result.current[0].value).toBe(1);
      expect(count).toBe(2);

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current[0].value).toBe(3);
      expect(count).toBe(4);
    });

    test('cmd in init', () => {
      const { result } = renderHook(() =>
        useTea({
          init: () => [
            { value: 0, version: 0 },
            Cmd.delay<Msg>((dispatch) => dispatch('increment'), 100),
          ],
          update,
          subscriptions,
        })
      );

      expect(result.current[0].value).toBe(0);

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current[0].value).toBe(1);
    });
  });

  describe('with subscriptions', () => {
    test('re-register subscription on rerender', () => {
      let count = 0;
      const { result } = renderHook(() => {
        return useTea({
          init,
          update,
          subscriptions: [
            Sub.of<Model, Msg>(() => [
              () => {
                count += 1;
              },
            ]),
          ],
        });
      });

      expect(result.current[0].value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current[1]('increment-with-same-version');
      });
      expect(result.current[0].value).toBe(1);
      expect(count).toBe(2);
    });

    test('re-register subscription on deps update', () => {
      let count = 0;
      const { result } = renderHook(() => {
        return useTea({
          init,
          update,
          subscriptions: [
            Sub.of<Model, Msg>(({ model }) => [
              () => {
                count += 1;
              },
              [model.version],
            ]),
          ],
        });
      });

      expect(result.current[0].value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current[1]('increment');
      });
      expect(result.current[0].value).toBe(1);
      expect(count).toBe(2);

      act(() => {
        result.current[1]('increment-with-same-version');
      });
      expect(result.current[0].value).toBe(2);
      expect(count).toBe(2);
    });

    test('not re-register subscription if deps is empty', () => {
      let count = 0;
      const { result } = renderHook(() => {
        return useTea({
          init,
          update,
          subscriptions: [
            Sub.of<Model, Msg>(() => [
              () => {
                count += 1;
              },
              [],
            ]),
          ],
        });
      });

      expect(result.current[0].value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current[1]('increment');
      });
      expect(result.current[0].value).toBe(1);
      expect(count).toBe(1);
    });

    test('cleanup function is invoked on unmount', () => {
      let count = 0;
      const { result, unmount } = renderHook(() => {
        return useTea({
          init,
          update,
          subscriptions: [
            Sub.of<Model, Msg>(() => [
              () => {
                return () => {
                  count += 1;
                };
              },
            ]),
          ],
        });
      });

      expect(result.current[0].value).toBe(0);
      expect(count).toBe(0);

      act(() => {
        result.current[1]('increment-with-same-version');
      });
      expect(result.current[0].value).toBe(1);
      expect(count).toBe(1);

      unmount();
      expect(result.current[0].value).toBe(1);
      expect(count).toBe(2);
    });
  });
});
