const axios = require('axios');
const util = require('util');
const fs = require('fs');
const streamPipeline = util.promisify(require('stream').pipeline);

class ScalingoDBClient {
  constructor(dbId, client) {
    this.dbId = dbId;
    this.client = client;
  }

  static getInstance({ dbId, dbToken, region }) {
    const client = axios.create({
      baseURL: `https://db-api.${region}.scalingo.com/api`,
      headers: { Authorization: `Bearer ${dbToken}` },
    });

    return new ScalingoDBClient(dbId, client);
  }

  async getBackups() {
    try {
      const response = await this.client.get(`/databases/${this.dbId}/backups`);
      return response.data.database_backups;
    } catch (e) {
      throw new Error('Unable to get the backup with Scalingo Database API.');
    }
  }

  async getBackupDownloadLink(backupId) {
    try {
      const response = await this.client.get(`/databases/${this.dbId}/backups/${backupId}/archive`);
      return response.data.download_url;
    } catch (e) {
      throw new Error('Unable to get the backup download link with Scalingo Database API.');
    }
  }

  async downloadBackup(backupId, output) {
    const downloadUrl = await this.getBackupDownloadLink(backupId);

    let downloadResponse;
    try {
      downloadResponse = await axios.get(downloadUrl, { responseType: 'stream' });
    } catch (e) {
      throw new Error('Unable to download the backup.');
    }

    await streamPipeline(downloadResponse.data, fs.createWriteStream(output));
  }
}

module.exports = ScalingoDBClient;
