const { expect, sinon } = require('../test-helper');
const lcms = require('../../src/lcms');
const learningContent = require('../../src/learning-content');

describe('Unit | learning-content.js', () => {
  describe('#fetchAndSaveData', () => {
    it('should fetch learning-content from LCMS', async() => {
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
      sinon.stub(lcms, 'getLearningContent').resolves(content);

      await learningContent.fetchAndSaveData(databaseConfig);

      expect(lcms.getLearningContent).to.have.been.called;
    });
  });
});
