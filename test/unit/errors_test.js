import { expect } from '../test-helper.js';
import { PrimaryKeyNotNullConstraintError } from '../../src/errors.js';

describe('Unit | errors.js', function() {

  describe('#PrimaryKeyNotNullConstraintError', function() {

    it('should return a message', async function() {
      // given
      // when
      const error = new PrimaryKeyNotNullConstraintError();

      // then
      expect(error.message).to.equal('At least one item to insert in table undefined has no property at all');
    });

  });
});
