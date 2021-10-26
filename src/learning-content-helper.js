function prepareLearningContentValueBeforeInsertion(learningContentItem, fieldStructure) {
  const learningContentValue = learningContentItem[fieldStructure.name];
  const value = fieldStructure.extractor ? fieldStructure.extractor(learningContentItem) : learningContentValue;
  if (!Array.isArray(value)) {
    return value;
  }
  return fieldStructure.isArray ? `{${value.join(',')}}` : value[0];
}

module.exports = {
  prepareLearningContentValueBeforeInsertion,
};
