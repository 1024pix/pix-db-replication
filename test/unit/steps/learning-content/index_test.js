import { expect, sinon } from '../../../test-helper.js';
import * as learningContent from '../../../../src/steps/learning-content/index.js';

describe('Unit | Steps | learning-content | index.js', function() {
  describe('#run', function() {
    let databaseHelper;
    let lcmsClient;

    beforeEach(async function() {
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

    it('should fetch learning-content from LCMS', async function() {
      expect(lcmsClient.getLearningContent).to.have.been.called;
    });

    it('should drop existing learning-content tables', async function() {
      expect(databaseHelper.dropTable.callCount).to.equal(12);
      expect(databaseHelper.dropTable).to.have.been.calledWith('frameworks');
      expect(databaseHelper.dropTable).to.have.been.calledWith('areas');
      expect(databaseHelper.dropTable).to.have.been.calledWith('attachments');
      expect(databaseHelper.dropTable).to.have.been.calledWith('competences');
      expect(databaseHelper.dropTable).to.have.been.calledWith('thematics');
      expect(databaseHelper.dropTable).to.have.been.calledWith('tubes');
      expect(databaseHelper.dropTable).to.have.been.calledWith('skills');
      expect(databaseHelper.dropTable).to.have.been.calledWith('challenges');
      expect(databaseHelper.dropTable).to.have.been.calledWith('courses');
      expect(databaseHelper.dropTable).to.have.been.calledWith('tutorials');
      expect(databaseHelper.dropTable).to.have.been.calledWith('missions');
      expect(databaseHelper.dropTable).to.have.been.calledWith('translations');
    });

    it('should create learning-content tables', async function() {
      expect(databaseHelper.createTable.callCount).to.equal(12);
    });

    it('should insert learning-content data', async function() {
      expect(databaseHelper.saveLearningContent.callCount).to.equal(12);
    });
  });

  describe('#extractTranslationsKey', function() {
    it('should extract solutionToDisplay translation key into explicativeResponse', function() {
      // given
      const record = { key: 'challenge.id.solutionToDisplay', locale: 'fr', value: 'la solution à afficher', model: 'challenge', entityId: 'id', sourceEntityId: 'id' };

      // when
      const result = learningContent.extractTranslationsKey(record);

      // then
      expect(result).to.equal('challenge.id.explicativeResponse');
    });
  });
});
