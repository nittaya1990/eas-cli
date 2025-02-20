import { asMock } from '../../__tests__/utils';
import { flushAsync, initAsync, logEvent } from '../../analytics/rudderstackClient';
import { jester as mockJester } from '../../credentials/__tests__/fixtures-constants';
import { getUserAsync } from '../../user/User';
import { ensureLoggedInAsync } from '../../user/actions';
import EasCommand from '../EasCommand';
import TestEasCommand from './TestEasCommand';

TestEasCommand.prototype.authValue = jest.fn().mockImplementation(() => true);

jest.mock('../../user/User');
jest.mock('../../user/actions', () => ({ ensureLoggedInAsync: jest.fn() }));
jest.mock('../../analytics/rudderstackClient', () => {
  const { AnalyticsEvent } = jest.requireActual('../../analytics/rudderstackClient');
  return {
    AnalyticsEvent,
    logEvent: jest.fn(),
    initAsync: jest.fn(),
    flushAsync: jest.fn(),
  };
});

let originalProcessArgv: string[];

beforeAll(() => {
  originalProcessArgv = process.argv;
  process.argv = [];
});

afterAll(() => {
  process.argv = originalProcessArgv;
});

beforeEach(() => {
  asMock(getUserAsync)
    .mockReset()
    .mockImplementation(() => mockJester);
  asMock(ensureLoggedInAsync)
    .mockReset()
    .mockImplementation(() => mockJester);
  asMock(initAsync).mockReset();
  asMock(flushAsync).mockReset();
  asMock(logEvent).mockReset();
});

describe(EasCommand.name, () => {
  describe('without exceptions', () => {
    // The first test in this suite should have an increased timeout
    // because of the implementation of Command from @oclif/command.
    // It seems that loading config takes significant amount of time
    // and I'm not sure how to mock it.
    //
    // See https://github.com/oclif/command/blob/master/src/command.ts#L80
    // and look for "Config.load"
    it('ensures the user is logged in', async () => {
      await TestEasCommand.run();

      expect(ensureLoggedInAsync).toHaveBeenCalled();
    }, 15_000);

    it('ensures the user data is read from cache', async () => {
      asMock(TestEasCommand.prototype.authValue).mockImplementationOnce(() => false);

      await TestEasCommand.run();

      expect(getUserAsync).toHaveReturnedWith(mockJester);
    });

    it('initializes analytics', async () => {
      await TestEasCommand.run();

      expect(initAsync).toHaveBeenCalled();
    });

    it('flushes analytics', async () => {
      await TestEasCommand.run();

      expect(flushAsync).toHaveBeenCalled();
    });

    it('logs events', async () => {
      await TestEasCommand.run();

      expect(logEvent).toHaveBeenCalledWith('action', {
        action: `eas ${TestEasCommand.id}`,
      });
    });
  });

  describe('after exceptions', () => {
    it('flushes analytics', async () => {
      try {
        await TestEasCommand.run().then(() => {
          throw new Error('foo');
        });
      } catch (error) {}

      expect(flushAsync).toHaveBeenCalled();
    });
  });
});
