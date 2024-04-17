import { expect } from '../test-helper.js';
import { PrimaryKeyNotNullConstraintError } from '../../src/errors.js';

describe('Unit | errors.js', () => {

  describe('#PrimaryKeyNotNullConstraintError', () => {

    it('should return a message', async () => {
      // given
      // when
      const error = new PrimaryKeyNotNullConstraintError();

      // then
      expect(error.message).to.equal('At least one item to insert in table undefined has no property at all');
    });

  });
});
