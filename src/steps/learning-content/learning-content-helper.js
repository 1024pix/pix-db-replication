function prepareLearningContentValueBeforeInsertion(learningContentItem, fieldStructure) {
  const learningContentValue = learningContentItem[fieldStructure.name];
  const value = fieldStructure.extractor ? fieldStructure.extractor(learningContentItem) : learningContentValue;
  if (!Array.isArray(value)) {
    return value;
  }
  return fieldStructure.isArray ? `{${value.map(escapeSpecialCharacters).join(',')}}` : value[0];
}

function escapeSpecialCharacters(value) {
  if (!value) return value;
  return '"' + value.replaceAll('\\', '\\\\').replaceAll('"', '\\"') + '"';
}

export {
  prepareLearningContentValueBeforeInsertion,
};
