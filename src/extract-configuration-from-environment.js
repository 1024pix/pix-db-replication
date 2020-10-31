module.exports = function() {

  const extractInteger = function(arg) {
    return parseInt(arg, 10);
  };

  return {
    PG_CLIENT_VERSION : process.env.PG_CLIENT_VERSION || 12,
    RETRIES_TIMEOUT_MINUTES : extractInteger(process.env.RETRIES_TIMEOUT_MINUTES) || 180,
    AIRTABLE_API_KEY : process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE : process.env.AIRTABLE_BASE,
    SCALINGO_APP : process.env.SCALINGO_APP,
    SCALINGO_API_TOKEN : process.env.SCALINGO_API_TOKEN,
    SCHEDULE : process.env.SCHEDULE || '10 5 * * *',
    MAX_RETRY_COUNT : extractInteger(process.env.MAX_RETRY_COUNT) || 10,
    PG_RESTORE_JOBS : extractInteger(process.env.PG_RESTORE_JOBS) || 4,
    RESTORE_FK_CONSTRAINTS : process.env.RESTORE_FK_CONSTRAINTS,
    RESTORE_ANSWERS_AND_KES : process.env.RESTORE_ANSWERS_AND_KES,
    RESTORE_ANSWERS_AND_KES_INCREMENTALLY : process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY,
    SOURCE_DATABASE_URL : process.env.SOURCE_DATABASE_URL || 'postgresql://pix@localhost/replication_source',
    TARGET_DATABASE_URL : process.env.TARGET_DATABASE_URL || 'postgresql://pix@localhost/replication_target',
    DATABASE_URL : process.env.DATABASE_URL
  };

};
