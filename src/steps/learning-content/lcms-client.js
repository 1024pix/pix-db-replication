import { parseJsonStream, streamToIterable } from 'json-stream-es';

import { logger } from '../../logger.js';

export async function* streamLearningContent(configuration) {
  const url = configuration.LCMS_API_URL + '/replication-stream';

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': configuration.LCMS_API_KEY,
        'client': process.env.APP ?? 'pix-db-replication', // eslint-disable-line n/no-process-env
      },
    });

    if (!response.ok) {
      throw new Error(`Invalid response status ${response.status} ${response.statusText}`);
    }

    yield* streamToIterable(response.body
      .pipeThrough(new TextDecoderStream()) // eslint-disable-line n/no-unsupported-features/node-builtins
      .pipeThrough(parseJsonStream(undefined, { multi: true })));
  } catch (err) {
    logger.error({ err, url }, 'Error while fetching learning content');
    throw err;
  }
}
