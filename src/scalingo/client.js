const scalingo = require('scalingo');
const ScalingoDBClient = require('./db-client');

class ScalingoClient {
  constructor(client, app, region) {
    this.app = app;
    this.client = client;
    this.region = region;
  }

  static async getInstance({ app, token, region }) {
    const apiUrl = `https://api.${region}.scalingo.com`;
    const client = await scalingo.clientFromToken(token, { apiUrl });

    return new ScalingoClient(client, app, region);
  }

  async getAddon(addonProviderId) {
    try {
      const addons = await this.client.Addons.for(this.app);
      return addons.find((addon) => addon.addon_provider.id === addonProviderId);
    } catch (e) {
      throw new Error(`Unable to get the addon "${addonProviderId}" with Scalingo API.`);
    }
  }

  async getAddonApiToken(addonId) {
    try {
      const response = await this.client.apiClient().post(`/apps/${this.app}/addons/${addonId}/token`);
      return response.data.addon.token;
    } catch (e) {
      throw new Error('Unable to get the addon token with Scalingo API.');
    }
  }

  async getDatabaseClient(dbId) {
    const dbToken = await this.getAddonApiToken(dbId);
    return ScalingoDBClient.getInstance({ dbId, dbToken, region: this.region });
  }
}

module.exports = ScalingoClient;
