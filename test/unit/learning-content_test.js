const { expect, sinon } = require('../test-helper');
const lcms = require('../../src/lcms');
const dbConnection = require('../../src/db-connection');
const learningContent = require('../../src/learning-content');

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
      sinon.stub(dbConnection, 'dropTable').resolves();
      sinon.stub(dbConnection, 'createTable').resolves();
      sinon.stub(dbConnection, 'saveLearningContent').resolves();
      sinon.stub(lcms, 'getLearningContent').resolves(content);

      await learningContent.fetchAndSaveData(databaseConfig);
    });

    it('should fetch learning-content from LCMS', async() => {
      expect(lcms.getLearningContent).to.have.been.called;
    });

    it('should drop existing learning-content tables', async() => {
      expect(dbConnection.dropTable.callCount).to.equal(8);
      expect(dbConnection.dropTable).to.have.been.calledWith('areas');
      expect(dbConnection.dropTable).to.have.been.calledWith('attachments');
      expect(dbConnection.dropTable).to.have.been.calledWith('competences');
      expect(dbConnection.dropTable).to.have.been.calledWith('tubes');
      expect(dbConnection.dropTable).to.have.been.calledWith('skills');
      expect(dbConnection.dropTable).to.have.been.calledWith('challenges');
      expect(dbConnection.dropTable).to.have.been.calledWith('courses');
      expect(dbConnection.dropTable).to.have.been.calledWith('tutorials');
    });

    it('should create learning-content tables', async() => {
      expect(dbConnection.createTable.callCount).to.equal(8);
    });

    it('should insert learning-content data', async() => {
      expect(dbConnection.saveLearningContent.callCount).to.equal(8);
    });
  });
});
