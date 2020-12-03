const sinon = require('sinon');
const scalingo = require('scalingo');
const { expect } = require('chai');

const ScalingoClient = require('../../../src/scalingo/client');
const ScalingoDBClient = require('../../../src/scalingo/db-client');

const SCALINGO_APP = 'SCALINGO_APP';
const SCALINGO_API_TOKEN = 'SCALINGO_API_TOKEN';
const SCALINGO_REGION = 'SCALINGO_REGION';
const SCALINGO_API_URL = `https://api.${SCALINGO_REGION}.scalingo.com`;

describe('Client wrapper for Scalingo API', () => {
  const clientParameters = {
    app: SCALINGO_APP,
    token: SCALINGO_API_TOKEN,
    region: SCALINGO_REGION,
  };

  afterEach(() => {
    sinon.restore();
  });

  describe('#ScalingoClient.getInstance', () => {
    it('should return the Scalingo client instance', async () => {
      // given
      sinon.stub(scalingo, 'clientFromToken').resolves({ apiClient: () => {} });
      // when
      const scalingoClient = await ScalingoClient.getInstance(clientParameters);
      // then
      sinon.assert.calledWithExactly(scalingo.clientFromToken, SCALINGO_API_TOKEN, {
        apiUrl: SCALINGO_API_URL,
      });
      expect(scalingoClient).to.be.an.instanceof(ScalingoClient);
      expect(scalingoClient.client).to.exist;
    });

    it('should throw an error when scalingo authentication failed', async () => {
      // given
      sinon.stub(scalingo, 'clientFromToken').rejects(new Error('Invalid credentials'));
      // when
      let scalingoClient;
      try {
        scalingoClient = await ScalingoClient.getInstance(clientParameters);
        expect.fail('should raise an error when credentials are invalid');
      } catch (e) {
        expect(scalingoClient).to.be.undefined;
      }
    });
  });

  describe('#ScalingoClient.getAddon', () => {
    const addonsStub = { for: () => {} };
    let scalingoClient;

    beforeEach(async () => {
      sinon.stub(scalingo, 'clientFromToken').resolves({ Addons: addonsStub });
      scalingoClient = await ScalingoClient.getInstance(clientParameters);
    });

    it('should return the postgresql addon if found', async () => {
      // given
      sinon.stub(addonsStub, 'for').resolves([{ addon_provider: { id: 'postgresql' } }]);
      // when
      const result = await scalingoClient.getAddon('postgresql');
      // then
      sinon.assert.calledWithExactly(addonsStub.for, SCALINGO_APP);
      expect(result).to.be.deep.equal({ addon_provider: { id: 'postgresql' } });
    });

    it('should return undefined if addon not found', async () => {
      // given
      sinon.stub(addonsStub, 'for').resolves([{ addon_provider: { id: 'redis' } }]);
      // when
      const result = await scalingoClient.getAddon('postgresql');
      // then
      expect(result).to.be.undefined;
    });

    it('should throw an error when scalingo api failed', async () => {
      // given
      sinon.stub(addonsStub, 'for').rejects(new Error('Invalid credentials'));
      // when
      try {
        await scalingoClient.getAddon('postgresql');
        expect.fail('should raise an error when Scalingo API failed');
      } catch (e) {
        expect(e.message).to.equal('Unable to get the addon "postgresql" with Scalingo API.');
      }
    });
  });

  describe('#ScalingoClient.getAddonApiToken', () => {
    const apiClientStub = { get: () => {}, post: () => {} };
    let scalingoClient;

    beforeEach(async () => {
      sinon.stub(scalingo, 'clientFromToken').resolves({ apiClient: () => apiClientStub });
      scalingoClient = await ScalingoClient.getInstance(clientParameters);
    });

    it('should return the postgresql addon if found', async () => {
      // given
      sinon.stub(apiClientStub, 'post').resolves({ data: { addon: { token: 'token1' } } });
      // when
      const result = await scalingoClient.getAddonApiToken(1);
      // then
      sinon.assert.calledWithExactly(apiClientStub.post, `/apps/${SCALINGO_APP}/addons/1/token`);
      expect(result).to.be.equal('token1');
    });

    it('should throw an error when scalingo api failed', async () => {
      // given
      sinon.stub(apiClientStub, 'get').rejects(new Error('Invalid credentials'));
      // when
      try {
        await scalingoClient.getAddonApiToken(1);
        expect.fail('should raise an error when Scalingo API failed');
      } catch (e) {
        expect(e.message).to.equal('Unable to get the addon token with Scalingo API.');
      }
    });
  });

  describe('#ScalingoClient.getDatabaseClient', () => {
    const apiClientStub = { post: () => {} };
    let scalingoClient;

    beforeEach(async () => {
      sinon.stub(scalingo, 'clientFromToken').resolves({ apiClient: () => apiClientStub });
      scalingoClient = await ScalingoClient.getInstance(clientParameters);
    });

    it('should return the database API client', async () => {
      // given
      sinon.stub(apiClientStub, 'post').resolves({ data: { addon: { token: 'token1' } } });
      // when
      const result = await scalingoClient.getDatabaseClient('dbId1');
      // then
      expect(result).to.be.an.instanceof(ScalingoDBClient);
    });
  });
});
