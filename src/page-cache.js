import { open } from 'node:fs/promises';

import { exec } from './exec.js';
import { logger } from './logger.js';

// Le dump de réplication pèse plusieurs dizaines de Go. Sous cgroup, les pages
// de ce fichier sont facturées au conteneur : sans intervention, la mémoire du
// conteneur reste collée à son plafond pendant toute la durée du dump puis de
// la restauration, alors qu'aucune de ces pages n'est jamais relue.
//
// Le remède est posix_fadvise(POSIX_FADV_DONTNEED), que Node n'expose pas.
// `dd iflag=nocache count=0` l'applique à l'intégralité du fichier.
// DONTNEED laisse les pages dirty intactes, d'où le fdatasync préalable.
async function dropPageCache(filePath) {
  const fileHandle = await open(filePath, 'r');
  try {
    await fileHandle.datasync();
  } finally {
    await fileHandle.close();
  }
  await exec('dd', [`if=${filePath}`, 'iflag=nocache', 'count=0', 'status=none']);
}

function startDroppingPageCache(filePath, intervalMs, dependencies = { dropPageCache }) {
  if (!intervalMs) {
    logger.info(`Page cache dropping is disabled for ${filePath}`);
    return function stop() {};
  }

  let isDropping = false;

  const timer = setInterval(async () => {
    // Un drop plus lent que l'intervalle ne doit pas en empiler d'autres.
    if (isDropping) return;
    isDropping = true;
    try {
      await dependencies.dropPageCache(filePath);
    } catch (error) {
      // Le fichier n'existe pas encore tant que pg_dump ne l'a pas créé.
      if (error.code !== 'ENOENT') {
        logger.warn(`Could not drop page cache for ${filePath}: ${error.message}`);
      }
    } finally {
      isDropping = false;
    }
  }, intervalMs);

  // Ne doit jamais maintenir le process en vie à lui seul.
  timer.unref();

  return function stop() {
    clearInterval(timer);
  };
}

export {
  dropPageCache,
  startDroppingPageCache,
};
