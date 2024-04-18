import { expect } from '../../../test-helper.js';

import * as learningContentHelper from '../../../../src/steps/learning-content/learning-content-helper.js';

describe('Unit | Steps | learning content | learning-content-helper.js', function() {

  describe('#prepareLearningContentValueBeforeInsertion', function() {

    let learningContentItem;

    before(function() {
      learningContentItem = {
        'code': '1',
        'color': 'jaffa',
        'competenceAirtableIds': [
          'recH9MjIzN54zXlwr',
          'recxlJqKdbWHHFZMQ',
          'recKxnZJh5dyRCQQn',
          'recZ1Gm4rud4zLhbF',
        ],
        'competenceIds': [
          'recH9MjIzN54zXlwr',
          'recxlJqKdbWHHFZMQ',
          'recKxnZJh5dyRCQQn',
          'recZ1Gm4rud4zLhbF',
        ],
        'id': 'recxjkrnVBVSI8RkS',
        'name': '1. Savoirs essentiels',
        'titleEnUs': ' Essential knowledge',
        'titleFrFr': 'Savoirs essentiels',
      };
    });

    it('should return value', function() {
      // given
      const fieldStructure = { name: 'name', type: 'text' };

      // when
      const value = learningContentHelper.prepareLearningContentValueBeforeInsertion(learningContentItem, fieldStructure);

      // then
      expect(value).to.equal('1. Savoirs essentiels');
    });

    it('should return value computed by the extractor', function() {
      // given
      const fieldStructure = { name: 'fieldWithExtractor', type: 'text', extractor: (record) => record['color'] + '_test' };

      // when
      const value = learningContentHelper.prepareLearningContentValueBeforeInsertion(learningContentItem, fieldStructure);

      // then
      expect(value).to.equal('jaffa_test');
    });

    it('should return formatted array', function() {
      // given
      const fieldStructure = { name: 'competenceAirtableIds', type: 'text[]', isArray: true };

      // when
      const value = learningContentHelper.prepareLearningContentValueBeforeInsertion(learningContentItem, fieldStructure);

      // then
      expect(value).to.deep.equal('{recH9MjIzN54zXlwr,recxlJqKdbWHHFZMQ,recKxnZJh5dyRCQQn,recZ1Gm4rud4zLhbF}');
    });

    it('should return formatted array from extractor', function() {
      // given
      const fieldStructure = { name: 'competenceAirtableIdsCopy', type: 'text[]', isArray: true, extractor: (record) => record['competenceAirtableIds'] };

      // when
      const value = learningContentHelper.prepareLearningContentValueBeforeInsertion(learningContentItem, fieldStructure);

      // then
      expect(value).to.deep.equal('{recH9MjIzN54zXlwr,recxlJqKdbWHHFZMQ,recKxnZJh5dyRCQQn,recZ1Gm4rud4zLhbF}');
    });
  });

});
