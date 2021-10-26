const { expect, sinon } = require('../test-helper');
const lcmsClient = require('../../src/lcms-client');
const databaseHelper = require('../../src/database-helper');
const learningContent = require('../../src/replicate-learning-content');

describe('Unit | learning-content.js', () => {
  describe('#fetchAndSaveData', () => {
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
      sinon.stub(databaseHelper, 'dropTable').resolves();
      sinon.stub(databaseHelper, 'createTable').resolves();
      sinon.stub(databaseHelper, 'saveLearningContent').resolves();
      sinon.stub(lcmsClient, 'getLearningContent').resolves(content);

      await learningContent.fetchAndSaveData(databaseConfig);
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
