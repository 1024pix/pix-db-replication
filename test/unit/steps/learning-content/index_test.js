import { expect, sinon } from '../../../test-helper.js';
import * as learningContent from '../../../../src/steps/learning-content/index.js';

describe('Unit | Steps | learning-content | index.js', function() {
  describe('#run', function() {
    let databaseHelper;
    let lcmsClient;

    beforeEach(async function() {
      const databaseConfig = {};
      async function* mockContent() {
        yield { type: 'areas', value: { id: 'recArea1', competenceIds: ['recCompetence'] } };
        yield { type: 'competences', value: { id: 'recCompetence', areaId: 'recArea1', skillIds: ['recSkill1'], origin: 'Pix' } };
      }
      databaseHelper = {
        dropTable: sinon.stub(),
        createTable: sinon.stub(),
        saveLearningContent: sinon.stub(),
      };
      databaseHelper.dropTable.resolves();
      databaseHelper.createTable.resolves();
      databaseHelper.saveLearningContent.resolves();
      lcmsClient = {
        streamLearningContent: sinon.stub().returns(mockContent()),
      };

      await learningContent.run(databaseConfig, { lcmsClient: lcmsClient, databaseHelper: databaseHelper });
    });

    it('should fetch learning-content from LCMS', async function() {
      expect(lcmsClient.streamLearningContent).to.have.been.called;
    });

    it('should drop existing learning-content tables', async function() {
      expect(databaseHelper.dropTable.callCount).to.equal(13);
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
      expect(databaseHelper.dropTable).to.have.been.calledWith('learning-content-translations');
      expect(databaseHelper.dropTable).to.have.been.calledWith('modules');
    });

    it('should create learning-content tables', async function() {
      expect(databaseHelper.createTable.callCount).to.equal(13);
    });

    it('should insert learning-content data', async function() {
      expect(databaseHelper.saveLearningContent.callCount).to.equal(2);
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

  describe('#getLearningContentChunks', function() {
    it('returns chunks of values of same type', async function() {
      // given
      const chunkSize = 2;
      const allValues = async function* () {
        // smaller than chunk size
        yield { type: 'type1', value: 1 };

        // exact chunk size
        yield { type: 'type2', value: 2 };
        yield { type: 'type2', value: 3 };

        // more than one chunk
        yield { type: 'type3', value: 4 };
        yield { type: 'type3', value: 5 };
        yield { type: 'type3', value: 6 };

        // exactly two chunks
        yield { type: 'type4', value: 7 };
        yield { type: 'type4', value: 8 };
        yield { type: 'type4', value: 9 };
        yield { type: 'type4', value: 10 };

        // more than two chunks
        yield { type: 'type5', value: 11 };
        yield { type: 'type5', value: 12 };
        yield { type: 'type5', value: 13 };
        yield { type: 'type5', value: 14 };
        yield { type: 'type5', value: 15 };
      }();

      // when
      const chunks = [];
      for await (const chunk of learningContent.getLearningContentChunks(allValues, chunkSize)) {
        chunks.push(chunk);
      }

      // then
      expect(chunks).to.deep.equal([
        { type: 'type1', values: [1] },
        { type: 'type2', values: [2, 3] },
        { type: 'type3', values: [4, 5] },
        { type: 'type3', values: [6] },
        { type: 'type4', values: [7, 8] },
        { type: 'type4', values: [9, 10] },
        { type: 'type5', values: [11, 12] },
        { type: 'type5', values: [13, 14] },
        { type: 'type5', values: [15] },
      ]);
    });
  });
});
