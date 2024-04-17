import { expect, sinon } from '../../../test-helper.js';
import * as learningContent from '../../../../src/steps/learning-content/index.js';

describe('Unit | Steps | learning-content | index.js', () => {
  describe('#run', () => {
    let databaseHelper;
    let lcmsClient;

    beforeEach(async() => {
      const databaseConfig = {};
      const content = {
        areas: [{ id: 'recArea1', competenceIds: ['recCompetence'] }],
        competences: [{
          id: 'recCompetence',
          areaId: 'recArea1',
          skillIds: ['recSkill1'],
          origin: 'Pix',
        }],
      };
      databaseHelper = {
        dropTable: sinon.stub(),
        createTable: sinon.stub(),
        saveLearningContent: sinon.stub(),
      };
      databaseHelper.dropTable.resolves();
      databaseHelper.createTable.resolves();
      databaseHelper.saveLearningContent.resolves();
      lcmsClient = {
        getLearningContent: sinon.stub().resolves(content),
      };

      await learningContent.run(databaseConfig, { lcmsClient: lcmsClient, databaseHelper: databaseHelper });
    });

    it('should fetch learning-content from LCMS', async() => {
      expect(lcmsClient.getLearningContent).to.have.been.called;
    });

    it('should drop existing learning-content tables', async() => {
      expect(databaseHelper.dropTable.callCount).to.equal(8);
      expect(databaseHelper.dropTable).to.have.been.calledWith('areas');
      expect(databaseHelper.dropTable).to.have.been.calledWith('attachments');
      expect(databaseHelper.dropTable).to.have.been.calledWith('competences');
      expect(databaseHelper.dropTable).to.have.been.calledWith('tubes');
      expect(databaseHelper.dropTable).to.have.been.calledWith('skills');
      expect(databaseHelper.dropTable).to.have.been.calledWith('challenges');
      expect(databaseHelper.dropTable).to.have.been.calledWith('courses');
      expect(databaseHelper.dropTable).to.have.been.calledWith('tutorials');
    });

    it('should create learning-content tables', async() => {
      expect(databaseHelper.createTable.callCount).to.equal(8);
    });

    it('should insert learning-content data', async() => {
      expect(databaseHelper.saveLearningContent.callCount).to.equal(8);
    });
  });
});
