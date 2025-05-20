import { expect, sinon } from '../../../test-helper.js';
import * as modulixLearningContent from '../../../../src/steps/modulix-learning-content/index.js';
import { mockModulixLcmsContent } from '../../../utils/mock-modulix-lcms-content.js';

describe('Unit | Steps | modulix-learning-content | index.js', function() {
  describe('#run', function() {
    let databaseHelper;
    let modulixLcmsClient;

    beforeEach(async function() {
      const databaseConfig = {};
      const content = mockModulixLcmsContent();
      databaseHelper = {
        dropTable: sinon.stub(),
        createTable: sinon.stub(),
        saveLearningContent: sinon.stub(),
      };
      databaseHelper.dropTable.resolves();
      databaseHelper.createTable.resolves();
      databaseHelper.saveLearningContent.resolves();
      modulixLcmsClient = {
        getLearningContent: sinon.stub().resolves(content),
      };

      await modulixLearningContent.run(databaseConfig, {
        modulixLcmsClient: modulixLcmsClient,
        databaseHelper: databaseHelper,
      });
    });

    it('should fetch learning-content from LCMS', async function() {
      expect(modulixLcmsClient.getLearningContent).to.have.been.called;
    });

    it('should drop existing learning-content tables', async function() {
      expect(databaseHelper.dropTable.callCount).to.equal(1);
      expect(databaseHelper.dropTable).to.have.been.calledWith('modules');
    });

    it('should create learning-content tables', async function() {
      expect(databaseHelper.createTable.callCount).to.equal(1);
    });

    it('should insert learning-content data', async function() {
      expect(databaseHelper.saveLearningContent.callCount).to.equal(1);
    });
  });
});
