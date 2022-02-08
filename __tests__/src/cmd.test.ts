import { Cmd } from '@/Cmd';

type Msg = 'msg' | 'msg2';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('Cmd', () => {
  test('none returns empty array', () => {
    expect(Cmd.none()).toEqual([]);
  });

  test('delay returns array with cmd that runs setTimeout', async () => {
    const cmd = Cmd.delay<Msg>((dispatch) => dispatch('msg'), 100);

    expect(cmd).toHaveLength(1);

    const dispatch = jest.fn();
    await cmd[0](dispatch);

    expect(dispatch).not.toBeCalled();

    jest.runAllTimers();

    expect(dispatch).toBeCalledWith('msg');
  });

  test('promise returns array with cmd that runs promise', async () => {
    const cmd = Cmd.promise<Msg>(async (dispatch) => {
      await Promise.resolve();
      dispatch('msg');
    });

    expect(cmd).toHaveLength(1);

    const dispatch = jest.fn();
    await cmd[0](dispatch);

    expect(dispatch).toBeCalledWith('msg');
  });

  test('batch returns array with cmds', async () => {
    const cmd = Cmd.batch<Msg>(
      Cmd.delay<Msg>((dispatch) => dispatch('msg'), 100),
      Cmd.promise(async (dispatch) => {
        await Promise.resolve();
        dispatch('msg2');
      })
    );

    expect(cmd).toHaveLength(2);

    const dispatch = jest.fn();
    await cmd[0](dispatch);

    expect(dispatch).not.toBeCalled();

    jest.runAllTimers();

    expect(dispatch).toBeCalledWith('msg');

    dispatch.mockClear();

    await cmd[1](dispatch);

    expect(dispatch).toBeCalledWith('msg2');
  });
});
