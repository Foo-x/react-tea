import { Cmd } from '@/Cmd';
import { Effect, Sub } from '@/Sub';
import { useTea, UseTeaInit, UseTeaUpdate, UseTeaUseHooks } from '@/useTea';
import { exhaustiveCheck } from '@/utils';
import { act, renderHook } from '@testing-library/react-hooks';

type Model = { value: number; version: number };

type Msg =
  | 'increment'
  | 'increment-with-cmd'
  | 'increment-with-batch'
  | 'increment-with-hooks-result'
  | 'increment-with-same-version';

type HooksResult = {
  value: number;
};

const init: UseTeaInit<Model, Msg> = () => [
  { value: 0, version: 0 },
  Cmd.none(),
];

const update: UseTeaUpdate<Model, Msg, HooksResult> = ({
  model,
  msg,
  hooksResult,
}) => {
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

    case 'increment-with-hooks-result':
      return [
        { value: model.value + hooksResult.value, version: model.version + 1 },
        Cmd.none(),
      ];

    case 'increment-with-same-version':
      return [{ value: model.value + 1, version: model.version }, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
  }
};

const useHooks: UseTeaUseHooks<HooksResult> = () => {
  return {
    value: 20,
  };
};

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('useTea', () => {
  describe('no subscription', () => {
    const subscriptions: Effect<Model, Msg, never, HooksResult>[] = [];

    test('initial result', () => {
      const { result } = renderHook(() =>
        useTea({ init, update, subscriptions, useHooks })
      );

      expect(result.current.model.value).toBe(0);
      expect(typeof result.current.dispatch).toBe('function');
      expect(result.current.hooksResult.value).toBe(20);
    });

    test('rerender on dispatch', () => {
      let count = 0;
      const { result } = renderHook(() => {
        count += 1;
        return useTea({ init, update, subscriptions, useHooks });
      });

      expect(result.current.model.value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current.dispatch('increment');
      });
      expect(result.current.model.value).toBe(1);
      expect(count).toBe(2);
    });

    test('rerender on cmd', () => {
      let count = 0;
      const { result } = renderHook(() => {
        count += 1;
        return useTea({ init, update, subscriptions, useHooks });
      });

      expect(result.current.model.value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current.dispatch('increment-with-cmd');
      });
      expect(result.current.model.value).toBe(1);
      expect(count).toBe(2);

      act(() => {
        jest.runAllTimers();
      });
      expect(result.current.model.value).toBe(2);
      expect(count).toBe(3);
    });

    test('dispatch before cmd resolves', () => {
      let count = 0;
      const { result } = renderHook(() => {
        count += 1;
        return useTea({ init, update, subscriptions, useHooks });
      });

      expect(result.current.model.value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current.dispatch('increment-with-cmd');
      });
      expect(result.current.model.value).toBe(1);
      expect(count).toBe(2);

      act(() => {
        result.current.dispatch('increment-with-cmd');
      });
      expect(result.current.model.value).toBe(2);
      expect(count).toBe(3);

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.model.value).toBe(4);
      expect(count).toBe(4);
    });

    test('rerender on each cmd', () => {
      let count = 0;
      const { result } = renderHook(() => {
        count += 1;
        return useTea({ init, update, subscriptions, useHooks });
      });

      expect(result.current.model.value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current.dispatch('increment-with-batch');
      });

      expect(result.current.model.value).toBe(1);
      expect(count).toBe(2);

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.model.value).toBe(3);
      expect(count).toBe(4);
    });

    test('dispatch with hooksResult', () => {
      const { result } = renderHook(() =>
        useTea({ init, update, subscriptions, useHooks })
      );

      expect(result.current.model.value).toBe(0);

      act(() => {
        result.current.dispatch('increment-with-hooks-result');
      });

      expect(result.current.model.value).toBe(20);
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
          useHooks,
        })
      );

      expect(result.current.model.value).toBe(0);

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.model.value).toBe(1);
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

      expect(result.current.model.value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current.dispatch('increment-with-same-version');
      });
      expect(result.current.model.value).toBe(1);
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

      expect(result.current.model.value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current.dispatch('increment');
      });
      expect(result.current.model.value).toBe(1);
      expect(count).toBe(2);

      act(() => {
        result.current.dispatch('increment-with-same-version');
      });
      expect(result.current.model.value).toBe(2);
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

      expect(result.current.model.value).toBe(0);
      expect(count).toBe(1);

      act(() => {
        result.current.dispatch('increment');
      });
      expect(result.current.model.value).toBe(1);
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

      expect(result.current.model.value).toBe(0);
      expect(count).toBe(0);

      act(() => {
        result.current.dispatch('increment-with-same-version');
      });
      expect(result.current.model.value).toBe(1);
      expect(count).toBe(1);

      unmount();
      expect(result.current.model.value).toBe(1);
      expect(count).toBe(2);
    });
  });
});
