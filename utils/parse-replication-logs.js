'use strict';
import fs from 'fs';

let DATE;
const START_BACKUP = 'Start create Backup';
const END_BACKUP = 'End create Backup';
const START_DROP = 'Start drop Objects AndRestoreBackup';
const END_DROP = 'End drop Objects AndRestoreBackup';
const START_CREATE_VIEW = 'Start create view';
const END_CREATE_VIEW = 'End create view';
const START_RESTORE = 'Start restore';
const END_RESTORE = 'Restore done';
const START_INCREMENTAL = 'Start incremental replication';
const END_INCREMENTAL = 'Incremental replication done';
const START_LCMS = 'learningContent.run - Started';
const END_LCMS = 'learningContent.run - Ended';
const START_UPDATE_AUTH_METHODS = 'UPDATE \\"authentication-methods\\" - Started';
const END_UPDATE_AUTH_METHODS = 'UPDATE \\"authentication-methods\\" - Ended';

function log(args) {
  // eslint-disable-next-line no-console
  console.log(args);
}

function _printPrettyTimeElapsedBetweenTwoDates(olderDate, date) {
  const secondsElapsed = _getSecondsElapsedBetweenTwoDates(olderDate, date);
  return `${_printPrettyTimeElapsed(secondsElapsed)} (de ${olderDate?.toLocaleTimeString()} à ${date?.toLocaleTimeString()})`;
}

function _printPrettyTimeElapsed(secondsElapsed) {
  const hours = Math.trunc(secondsElapsed / 60 / 60);
  const secondsMinusHours = secondsElapsed - (hours * 60 * 60);
  const minutes = Math.trunc(secondsMinusHours / 60);
  const seconds = Math.round(secondsMinusHours - (minutes * 60));
  return `${hours}h ${minutes}min ${seconds}s`;
}

function _getSecondsElapsedBetweenTwoDates(olderDate, date) {
  return (date?.getTime() - olderDate?.getTime()) / 1000;
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
  if (!logLineWithTimestamp) return undefined;
  return _extractTimestampFromLogLine(logLineWithTimestamp);
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
    const endBackupTimestamp = _extractTimestampFromContent(logLines, END_BACKUP);
    const startDropTimestamp = _extractTimestampFromContent(logLines, START_DROP);
    const endDropTimestamp = _extractTimestampFromContent(logLines, END_DROP);
    const startCreateViewTimestamp = _extractTimestampFromContent(logLines, START_CREATE_VIEW);
    const endCreateViewTimestamp = _extractTimestampFromContent(logLines, END_CREATE_VIEW);
    const startRestoreTimestamp = _extractTimestampFromContent(logLines, START_RESTORE);
    const endRestoreTimestamp = _extractTimestampFromContent(logLines, END_RESTORE);
    const startIncrementalTimestamp = _extractTimestampFromContent(logLines, START_INCREMENTAL);
    const endIncrementalTimestamp = _extractTimestampFromContent(logLines, END_INCREMENTAL);
    const startLearningContentTimestamp = _extractTimestampFromContent(logLines, START_LCMS);
    const endLearningContentTimestamp = _extractTimestampFromContent(logLines, END_LCMS);
    const startUpdateAuthMethods = _extractTimestampFromContent(logLines, START_UPDATE_AUTH_METHODS);
    const endUpdateAuthMethods = _extractTimestampFromContent(logLines, END_UPDATE_AUTH_METHODS);

    log(`# Dans le fichier ${logfile}`);
    log(`Durée de création du backup: ${_printPrettyTimeElapsedBetweenTwoDates(startBackupTimestamp, endBackupTimestamp)}`);
    log(`Durée du drop des tables: ${_printPrettyTimeElapsedBetweenTwoDates(startDropTimestamp, endDropTimestamp)}`);
    log(`Durée du restore: ${_printPrettyTimeElapsedBetweenTwoDates(startRestoreTimestamp, endRestoreTimestamp)}`);
    log(`Durée de la création des vues: ${_printPrettyTimeElapsedBetweenTwoDates(startCreateViewTimestamp, endCreateViewTimestamp)}`);
    log(`Durée de la mise à jour des authentication-methods: ${_printPrettyTimeElapsedBetweenTwoDates(startUpdateAuthMethods, endUpdateAuthMethods)}`);
    log(`Durée de l'incrémentale: ${_printPrettyTimeElapsedBetweenTwoDates(startIncrementalTimestamp, endIncrementalTimestamp)}`);
    log(`Durée du Learning Content: ${_printPrettyTimeElapsedBetweenTwoDates(startLearningContentTimestamp, endLearningContentTimestamp)}`);
    log(`Durée totale: ${_printPrettyTimeElapsedBetweenTwoDates(startBackupTimestamp, endLearningContentTimestamp)}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('\n', error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
}

main().then(
  // eslint-disable-next-line n/no-process-exit
  () => process.exit(0),
  (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  },
);
