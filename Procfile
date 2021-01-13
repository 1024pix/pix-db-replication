web: ruby -run -e httpd /dev/null -p $PORT
background: node ./src/replication_job.js
clock: node ./src/schedule-incremental-replication.js
