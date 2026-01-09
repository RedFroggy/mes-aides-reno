import follow from 'follow-redirects'
import fs from 'fs'
import env from '@next/env';
const { loadEnvConfig } = env;

loadEnvConfig(process.cwd());

const { https } = follow

const MAIR_DG_ORT_PAGE_URL = requireEnv('MAIR_DG_ORT_PAGE_URL');
const MAIR_DG_ORT_DATA_URL = requireEnv('MAIR_DG_ORT_DATA_URL');
const MAIR_DG_COEUR_VILLE_PAGE_URL = requireEnv('MAIR_DG_COEUR_VILLE_PAGE_URL');
const MAIR_DG_COEUR_VILLE_DATA_URL = requireEnv('MAIR_DG_COEUR_VILLE_DATA_URL');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const sources = [
  buildSource(MAIR_DG_ORT_PAGE_URL, MAIR_DG_ORT_DATA_URL, 'ort.csv'),
  buildSource(
    MAIR_DG_COEUR_VILLE_PAGE_URL,
    MAIR_DG_COEUR_VILLE_DATA_URL,
    'coeur-de-ville.csv'
  ),
];

export const downloadFile = (source, httpClient = https, fileSystem = fs) => {
  return new Promise((resolve, reject) => {
    const file = fileSystem.createWriteStream(source.downloadPath)

    file.on('error', (err) => {
      reject(
        new Error(`Failed to write ${source.downloadPath}: ${err.message}`)
      )
    })

    httpClient
      .get(source.data, (response) => {
        if (response.statusCode !== 200) {
          file.close()
          fileSystem.unlink(source.downloadPath, () => {})
          reject(
            new Error(
              `Failed to download ${source.data}: HTTP ${response.statusCode}`
            )
          )
          return
        }

        response.pipe(file)

        file.on('finish', () => {
          file.close()
          console.log(`Download of ${source.downloadPath} completed`)
          resolve()
        })
      })
      .on('error', (err) => {
        file.close()
        fileSystem.unlink(source.downloadPath, () => {})
        reject(new Error(`Failed to download ${source.data}: ${err.message}`))
      })
  })
}

export const downloadAllFiles = (
  sourcesToDownload = sources,
  httpClient = https,
  fileSystem = fs
) => {
  const activeSources = sourcesToDownload.filter(
    (source) => !source.deactivatedBecauseOfDownloadBug
  )

  return Promise.all(
    activeSources.map((source) => downloadFile(source, httpClient, fileSystem))
  )
}

// Exécution directe si le script est lancé directement
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
  downloadAllFiles()
    .then(() => {
      console.log('All downloads completed successfully')
    })
    .catch((err) => {
      console.error(err.message)
      process.exit(1)
    })
}

function buildSource(page, data, fileName) {
  return {
    page,
    data,
    downloadPath: `./data/${fileName}`,
    deactivatedBecauseOfDownloadBug: !page || !data, // mark as inactive if URLs missing
  }
}