import { expect, sinon } from '../test-helper.js';
import { startDroppingPageCache } from '../../src/page-cache.js';

describe('Unit | page-cache.js', function() {
  describe('#startDroppingPageCache', function() {
    let clock;
    let dropPageCache;

    beforeEach(function() {
      clock = sinon.useFakeTimers({ shouldClearNativeTimers: true });
      dropPageCache = sinon.stub().resolves();
    });

    afterEach(function() {
      clock.restore();
    });

    it('should drop the page cache on every interval until stopped', async function() {
      // given
      const stop = startDroppingPageCache('./dump.pgsql', 10000, { dropPageCache });

      // when
      await clock.tickAsync(35000);
      stop();
      await clock.tickAsync(60000);

      // then
      expect(dropPageCache).to.have.been.calledThrice;
      expect(dropPageCache).to.have.always.been.calledWith('./dump.pgsql');
    });

    it('should not stack up drops when one takes longer than the interval', async function() {
      // given
      dropPageCache = sinon.stub().callsFake(() => new Promise((resolve) => setTimeout(resolve, 25000)));
      const stop = startDroppingPageCache('./dump.pgsql', 10000, { dropPageCache });

      // when
      await clock.tickAsync(30000);
      stop();

      // then
      expect(dropPageCache).to.have.been.calledOnce;
    });

    it('should stay silent when the dump file does not exist yet', async function() {
      // given
      const error = new Error('ENOENT: no such file or directory');
      error.code = 'ENOENT';
      dropPageCache = sinon.stub().rejects(error);
      const stop = startDroppingPageCache('./dump.pgsql', 10000, { dropPageCache });

      // when
      await clock.tickAsync(25000);
      stop();

      // then
      expect(dropPageCache).to.have.been.calledTwice;
    });

    it('should do nothing when the interval is zero', async function() {
      // given
      const stop = startDroppingPageCache('./dump.pgsql', 0, { dropPageCache });

      // when
      await clock.tickAsync(60000);
      stop();

      // then
      expect(dropPageCache).to.not.have.been.called;
    });
  });
});
