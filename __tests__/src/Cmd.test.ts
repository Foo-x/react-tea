import { Cmd, cmdNoneSymbol } from '@/Cmd';

type Msg = 'msg' | 'msg2' | number;

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('Cmd', () => {
  test('none returns unique symbol', () => {
    expect(Cmd.none()).toBe(cmdNoneSymbol);
  });

  test('delay returns function that runs setTimeout', async () => {
    const cmd = Cmd.delay<Msg>((dispatch) => dispatch('msg'), 100);

    const dispatch = jest.fn();
    const delayPromise = cmd(dispatch);

    expect(dispatch).not.toBeCalled();

    jest.runAllTimers();
    await delayPromise;

    expect(dispatch).toBeCalledWith('msg');
  });

  test('promise returns function that runs promise', async () => {
    const cmd = Cmd.promise<Msg>(async (dispatch) => {
      await Promise.resolve();
      dispatch('msg');
    });

    const dispatch = jest.fn();
    await cmd(dispatch);

    expect(dispatch).toBeCalledWith('msg');
  });

  describe('perform', () => {
    it('returns function that runs task and dispatch with msg supplier', async () => {
      const expected = Math.random();
      const cmd = Cmd.perform<Msg, number>(
        (value) => {
          return value + 1;
        },
        () => Promise.resolve(expected)
      );

      const dispatch = jest.fn();
      await cmd(dispatch);

      expect(dispatch).toBeCalledWith(expected + 1);
    });

    test('error is ignored and it dispatch nothing', async () => {
      const expected = Math.random();
      const cmd = Cmd.perform<Msg, number>(
        (value) => {
          return value + 1;
        },
        () => Promise.reject(expected)
      );

      const dispatch = jest.fn();
      await cmd(dispatch);

      expect(dispatch).not.toBeCalled();
    });
  });

  describe('attempt', () => {
    it('returns function that runs task and dispatch with msg supplier', async () => {
      const expected = Math.random();
      const cmd = Cmd.attempt<Msg, number>(
        (value) => {
          if (typeof value === 'number') {
            return value + 1;
          }
          return 'msg';
        },
        () => Promise.resolve(expected)
      );

      const dispatch = jest.fn();
      await cmd(dispatch);

      expect(dispatch).toBeCalledWith(expected + 1);
    });

    test('error is passed to msg supplier', async () => {
      const cmd = Cmd.attempt<Msg, number>(
        (value) => {
          if (typeof value === 'number') {
            return value + 1;
          }
          return 'msg';
        },
        () => Promise.reject(new Error())
      );

      const dispatch = jest.fn();
      await cmd(dispatch);

      expect(dispatch).toBeCalledWith('msg');
    });
  });

  test('batch returns array with cmds', async () => {
    const cmd = Cmd.batch<Msg>(
      Cmd.delay((dispatch) => dispatch('msg'), 100),
      Cmd.promise(async (dispatch) => {
        await Promise.resolve();
        dispatch('msg2');
      })
    );

    expect(cmd).toHaveLength(2);

    const dispatch = jest.fn();
    const delayPromise = cmd[0](dispatch);

    expect(dispatch).not.toBeCalled();

    jest.runAllTimers();
    await delayPromise;

    expect(dispatch).toBeCalledWith('msg');

    dispatch.mockClear();

    await cmd[1](dispatch);

    expect(dispatch).toBeCalledWith('msg2');
  });
});
