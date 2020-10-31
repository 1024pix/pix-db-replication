'use strict';
const fs = require('fs');

let DATE;
const START_BACKUP = 'Backup ID:';
const START_REPLICATION = 'Start restore';
const START_ENRICHMENT = 'Restore done';

function log(args) {
  // eslint-disable-next-line no-console
  console.log(args);
}

function _printPrettyTimeElapsedBetweenTwoDates(olderDate, date) {
  const secondsElapsed = _getSecondsElapsedBetweenTwoDates(olderDate, date);
  return _printPrettyTimeElapsed(secondsElapsed);
}

function _printPrettyTimeElapsed(secondsElapsed) {
  const hours = Math.trunc(secondsElapsed / 60 / 60);
  const secondsMinusHours = secondsElapsed - (hours * 60 * 60);
  const minutes = Math.trunc(secondsMinusHours / 60);
  const seconds = Math.round(secondsMinusHours - (minutes * 60));
  return `${hours}h ${minutes}min ${seconds}s`;
}

function _getSecondsElapsedBetweenTwoDates(olderDate, date) {
  return (date.getTime() - olderDate.getTime()) / 1000;
}

function _extractTimestampFromLogLine(logLine) {
  const rx = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]* \+[0-9]{4}/g;
  const match = rx.exec(logLine);
  return new Date(match[0]);
}

function _filterLinesInDate(logLines) {
  return logLines.filter((line) => line.startsWith(DATE));
}

function _extractTimestampFromContent(logLines, content) {
  const logLineWithTimestamp = logLines.find((line) => line.includes(content));
  return _extractTimestampFromLogLine(logLineWithTimestamp);
}

function _editItemIfComplete(collection, key) {
  if (collection[key].endTimestamp && collection[key].startTimestamp) {
    collection[key] = {
      operation: collection[key].operation,
      elapsed: _getSecondsElapsedBetweenTwoDates(collection[key].startTimestamp, collection[key].endTimestamp),
    };
  }
}

function _findItemsInLogLines(logLines) {
  const findingItems = {};
  const rxLaunch = /.* launching item ([0-9]*) (.*)/g;
  const rxFinished = /.* finished item ([0-9]*) .*/g;
  for (const logLine of logLines) {
    rxLaunch.lastIndex = 0;
    rxFinished.lastIndex = 0;
    const matchLaunch = rxLaunch.exec(logLine);
    const matchFinished = rxFinished.exec(logLine);
    if (matchLaunch) {
      const line = matchLaunch[0];
      const opId = matchLaunch[1].toString();
      const op = matchLaunch[2];
      if (!findingItems[opId]) {
        findingItems[opId] = {};
      }
      findingItems[opId].startTimestamp = _extractTimestampFromLogLine(line);
      findingItems[opId].operation = op;
      _editItemIfComplete(findingItems, opId);
    }
    if (matchFinished) {
      const line = matchFinished[0];
      const opId = matchFinished[1].toString();
      if (!findingItems[opId]) {
        findingItems[opId] = {};
      }
      findingItems[opId].endTimestamp = _extractTimestampFromLogLine(line);
      _editItemIfComplete(findingItems, opId);
    }
  }

  return findingItems;
}

function _categorize(foundItems) {
  const sequenceItems = {};
  const tableDataItems = {};
  const constraintItems = {};
  const indexItems = {};
  const fkConstraintItems = {};
  sequenceItems.totalElapsed = 0;
  sequenceItems.operations = [];
  tableDataItems.totalElapsed = 0;
  tableDataItems.operations = [];
  constraintItems.totalElapsed = 0;
  constraintItems.operations = [];
  indexItems.totalElapsed = 0;
  indexItems.operations = [];
  fkConstraintItems.totalElapsed = 0;
  fkConstraintItems.operations = [];
  for (const operationInfo of Object.values(foundItems)) {
    if (operationInfo.operation.startsWith('FK CONSTRAINT')) {
      fkConstraintItems.totalElapsed += operationInfo.elapsed;
      fkConstraintItems.operations.push(operationInfo);
    }
    if (operationInfo.operation.startsWith('CONSTRAINT')) {
      constraintItems.totalElapsed += operationInfo.elapsed;
      constraintItems.operations.push(operationInfo);
    }
    if (operationInfo.operation.startsWith('INDEX')) {
      indexItems.totalElapsed += operationInfo.elapsed;
      indexItems.operations.push(operationInfo);
    }
    if (operationInfo.operation.startsWith('SEQUENCE')) {
      sequenceItems.totalElapsed += operationInfo.elapsed;
      sequenceItems.operations.push(operationInfo);
    }
    if (operationInfo.operation.startsWith('TABLE DATA')) {
      tableDataItems.totalElapsed += operationInfo.elapsed;
      tableDataItems.operations.push(operationInfo);
    }
  }

  return {
    sequenceItems,
    tableDataItems,
    constraintItems,
    indexItems,
    fkConstraintItems,
  };
}

function _sortByElapsed(categoryItems) {
  categoryItems.operations = categoryItems.operations.sort(_compareOperation);
  return categoryItems;
}

function _compareOperation(operationA, operationB) {
  if (operationA.elapsed > operationB.elapsed) {
    return -1;
  } else if (operationA.elapsed < operationB.elapsed) {
    return 1;
  } else {
    return 0;
  }
}

function _categorizeAndSortByElapsed(foundItems) {
  const {
    sequenceItems,
    tableDataItems,
    constraintItems,
    indexItems,
    fkConstraintItems,
  } = _categorize(foundItems);

  return {
    sequenceItems: _sortByElapsed(sequenceItems),
    tableDataItems: _sortByElapsed(tableDataItems),
    constraintItems: _sortByElapsed(constraintItems),
    indexItems: _sortByElapsed(indexItems),
    fkConstraintItems: _sortByElapsed(fkConstraintItems),
  };
}

function _do(logLines) {
  const foundItems = _findItemsInLogLines(logLines);
  const {
    sequenceItems,
    tableDataItems,
    constraintItems,
    indexItems,
    fkConstraintItems,
  } = _categorizeAndSortByElapsed(foundItems);

  log(`FK CONSTRAINT total duration : ${_printPrettyTimeElapsed(fkConstraintItems.totalElapsed)}`);
  for (let i = 0; i < 3 && fkConstraintItems.operations.length > 0; ++i) {
    log(`\t${fkConstraintItems.operations[i].operation} : ${_printPrettyTimeElapsed(fkConstraintItems.operations[i].elapsed)}`);
  }
  log(`CONSTRAINT total duration : ${_printPrettyTimeElapsed(constraintItems.totalElapsed)}`);
  for (let i = 0; i < 3 && constraintItems.operations.length > 0; ++i) {
    log(`\t${constraintItems.operations[i].operation} : ${_printPrettyTimeElapsed(constraintItems.operations[i].elapsed)}`);
  }
  log(`INDEX total duration : ${_printPrettyTimeElapsed(indexItems.totalElapsed)}`);
  for (let i = 0; i < 3 && indexItems.operations.length > 0; ++i) {
    log(`\t${indexItems.operations[i].operation} : ${_printPrettyTimeElapsed(indexItems.operations[i].elapsed)}`);
  }
  log(`SEQUENCE total duration : ${_printPrettyTimeElapsed(sequenceItems.totalElapsed)}`);
  for (let i = 0; i < 3 && sequenceItems.operations.length > 0; ++i) {
    log(`\t${sequenceItems.operations[i].operation} : ${_printPrettyTimeElapsed(sequenceItems.operations[i].elapsed)}`);
  }
  log(`TABLE DATA total duration : ${_printPrettyTimeElapsed(tableDataItems.totalElapsed)}`);
  for (let i = 0; i < 3 && tableDataItems.operations.length > 0; ++i) {
    log(`\t${tableDataItems.operations[i].operation} : ${_printPrettyTimeElapsed(tableDataItems.operations[i].elapsed)}`);
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const logfile = args[0];
    DATE = args[1];
    const logs = fs.readFileSync(logfile, 'utf8');
    let logLines = logs.split('\n');
    logLines = _filterLinesInDate(logLines);
    const startBackupTimestamp = _extractTimestampFromContent(logLines, START_BACKUP);
    const startReplicationTimestamp = _extractTimestampFromContent(logLines, START_REPLICATION);
    const startEnrichmentTimestamp = _extractTimestampFromContent(logLines, START_ENRICHMENT);
    const endTimestamp = _extractTimestampFromLogLine(logLines.slice(-1));
    log(`Durée de récupération du backup: ${_printPrettyTimeElapsedBetweenTwoDates(startBackupTimestamp, startReplicationTimestamp)}`);
    log(`Durée de réplication: ${_printPrettyTimeElapsedBetweenTwoDates(startReplicationTimestamp, startEnrichmentTimestamp)}`);
    log(`Durée de l'enrichissement: ${_printPrettyTimeElapsedBetweenTwoDates(startEnrichmentTimestamp, endTimestamp)}`);
    log(`Durée totale: ${_printPrettyTimeElapsedBetweenTwoDates(startBackupTimestamp, endTimestamp)}`);
    _do(logLines);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('\n', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    },
  );
}
