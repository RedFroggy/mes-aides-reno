import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventEmitter } from 'events'
import { downloadFile, downloadAllFiles, sources } from './downloadData.mjs'

// Mock pour créer un WriteStream simulé
const createMockWriteStream = () => {
  const stream = new EventEmitter()
  stream.close = vi.fn()
  return stream
}

// Mock pour créer une réponse HTTP simulée
const createMockResponse = (statusCode) => {
  const response = new EventEmitter()
  response.statusCode = statusCode
  response.pipe = vi.fn((destination) => {
    // Simuler la fin du téléchargement après pipe
    setImmediate(() => destination.emit('finish'))
    return destination
  })
  return response
}

// Mock pour créer un client HTTP simulé
const createMockHttpClient = (statusCode = 200, shouldError = false) => {
  return {
    get: vi.fn((url, callback) => {
      const request = new EventEmitter()

      if (shouldError) {
        setImmediate(() => request.emit('error', new Error('Network error')))
      } else {
        const response = createMockResponse(statusCode)
        setImmediate(() => callback(response))
      }

      return request
    }),
  }
}

// Mock pour le système de fichiers
const createMockFileSystem = (shouldWriteError = false) => {
  const mockStream = createMockWriteStream()

  if (shouldWriteError) {
    setImmediate(() => mockStream.emit('error', new Error('Disk full')))
  }

  return {
    createWriteStream: vi.fn(() => mockStream),
    unlink: vi.fn((path, callback) => callback()),
    _mockStream: mockStream,
  }
}

describe('downloadData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sources', () => {
    it('should have valid source entries', () => {
      expect(sources).toBeInstanceOf(Array)
      expect(sources.length).toBeGreaterThan(0)

      sources.forEach((source) => {
        expect(source).toHaveProperty('page')
        expect(source).toHaveProperty('data')
        expect(source).toHaveProperty('downloadPath')
        expect(source.data).toMatch(/^https:\/\//)
        expect(source.downloadPath).toMatch(/\.csv$/)
      })
    })
  })

  describe('downloadFile', () => {
    it('should download file successfully with status 200', async () => {
      const mockHttpClient = createMockHttpClient(200)
      const mockFs = createMockFileSystem()
      const source = {
        data: 'https://example.com/file.csv',
        downloadPath: './test.csv',
      }

      await expect(
        downloadFile(source, mockHttpClient, mockFs)
      ).resolves.toBeUndefined()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        source.data,
        expect.any(Function)
      )
      expect(mockFs.createWriteStream).toHaveBeenCalledWith(source.downloadPath)
      expect(mockFs._mockStream.close).toHaveBeenCalled()
    })

    it('should reject with HTTP error for non-200 status codes', async () => {
      const mockHttpClient = createMockHttpClient(404)
      const mockFs = createMockFileSystem()
      const source = {
        data: 'https://example.com/notfound.csv',
        downloadPath: './test.csv',
      }

      await expect(
        downloadFile(source, mockHttpClient, mockFs)
      ).rejects.toThrow('Failed to download https://example.com/notfound.csv: HTTP 404')

      expect(mockFs.unlink).toHaveBeenCalledWith(
        source.downloadPath,
        expect.any(Function)
      )
      expect(mockFs._mockStream.close).toHaveBeenCalled()
    })

    it('should reject with HTTP error for 500 status codes', async () => {
      const mockHttpClient = createMockHttpClient(500)
      const mockFs = createMockFileSystem()
      const source = {
        data: 'https://example.com/error.csv',
        downloadPath: './test.csv',
      }

      await expect(
        downloadFile(source, mockHttpClient, mockFs)
      ).rejects.toThrow('Failed to download https://example.com/error.csv: HTTP 500')
    })

    it('should reject on network error', async () => {
      const mockHttpClient = createMockHttpClient(200, true)
      const mockFs = createMockFileSystem()
      const source = {
        data: 'https://example.com/file.csv',
        downloadPath: './test.csv',
      }

      await expect(
        downloadFile(source, mockHttpClient, mockFs)
      ).rejects.toThrow('Failed to download https://example.com/file.csv: Network error')

      expect(mockFs.unlink).toHaveBeenCalledWith(
        source.downloadPath,
        expect.any(Function)
      )
    })

    it('should reject on file write error', async () => {
      const mockHttpClient = createMockHttpClient(200)
      const mockFs = createMockFileSystem(true)
      const source = {
        data: 'https://example.com/file.csv',
        downloadPath: './test.csv',
      }

      await expect(
        downloadFile(source, mockHttpClient, mockFs)
      ).rejects.toThrow('Failed to write ./test.csv: Disk full')
    })
  })

  describe('downloadAllFiles', () => {
    it('should download all active sources', async () => {
      const mockHttpClient = createMockHttpClient(200)
      const testSources = [
        { data: 'https://example.com/1.csv', downloadPath: './1.csv' },
        { data: 'https://example.com/2.csv', downloadPath: './2.csv' },
      ]

      // Créer un mock fs qui génère un nouveau stream pour chaque appel
      const mockFs = {
        createWriteStream: vi.fn(() => createMockWriteStream()),
        unlink: vi.fn((path, callback) => callback()),
      }

      // Simuler les réponses HTTP pour chaque téléchargement
      let callCount = 0
      mockHttpClient.get = vi.fn((url, callback) => {
        const request = new EventEmitter()
        const response = createMockResponse(200)

        setImmediate(() => callback(response))
        callCount++

        return request
      })

      await expect(
        downloadAllFiles(testSources, mockHttpClient, mockFs)
      ).resolves.toEqual([undefined, undefined])

      expect(mockHttpClient.get).toHaveBeenCalledTimes(2)
      expect(mockFs.createWriteStream).toHaveBeenCalledTimes(2)
    })

    it('should filter out deactivated sources', async () => {
      const mockHttpClient = createMockHttpClient(200)
      const mockFs = {
        createWriteStream: vi.fn(() => createMockWriteStream()),
        unlink: vi.fn((path, callback) => callback()),
      }

      const testSources = [
        { data: 'https://example.com/1.csv', downloadPath: './1.csv' },
        {
          data: 'https://example.com/2.csv',
          downloadPath: './2.csv',
          deactivatedBecauseOfDownloadBug: 'some reason',
        },
        { data: 'https://example.com/3.csv', downloadPath: './3.csv' },
      ]

      await downloadAllFiles(testSources, mockHttpClient, mockFs)

      expect(mockHttpClient.get).toHaveBeenCalledTimes(2)
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://example.com/1.csv',
        expect.any(Function)
      )
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://example.com/3.csv',
        expect.any(Function)
      )
      expect(mockHttpClient.get).not.toHaveBeenCalledWith(
        'https://example.com/2.csv',
        expect.any(Function)
      )
    })

    it('should reject if any download fails', async () => {
      const testSources = [
        { data: 'https://example.com/1.csv', downloadPath: './1.csv' },
        { data: 'https://example.com/fail.csv', downloadPath: './fail.csv' },
      ]

      let callIndex = 0
      const mockHttpClient = {
        get: vi.fn((url, callback) => {
          const request = new EventEmitter()
          const isFailingUrl = url.includes('fail')

          if (isFailingUrl) {
            setImmediate(() => {
              const response = createMockResponse(404)
              callback(response)
            })
          } else {
            setImmediate(() => {
              const response = createMockResponse(200)
              callback(response)
            })
          }
          callIndex++

          return request
        }),
      }

      const mockFs = {
        createWriteStream: vi.fn(() => createMockWriteStream()),
        unlink: vi.fn((path, callback) => callback()),
      }

      await expect(
        downloadAllFiles(testSources, mockHttpClient, mockFs)
      ).rejects.toThrow('HTTP 404')
    })

    it('should handle empty sources array', async () => {
      const mockHttpClient = createMockHttpClient(200)
      const mockFs = createMockFileSystem()

      await expect(
        downloadAllFiles([], mockHttpClient, mockFs)
      ).resolves.toEqual([])

      expect(mockHttpClient.get).not.toHaveBeenCalled()
    })

    it('should handle all sources deactivated', async () => {
      const mockHttpClient = createMockHttpClient(200)
      const mockFs = createMockFileSystem()

      const testSources = [
        {
          data: 'https://example.com/1.csv',
          downloadPath: './1.csv',
          deactivatedBecauseOfDownloadBug: 'reason 1',
        },
        {
          data: 'https://example.com/2.csv',
          downloadPath: './2.csv',
          deactivatedBecauseOfDownloadBug: 'reason 2',
        },
      ]

      await expect(
        downloadAllFiles(testSources, mockHttpClient, mockFs)
      ).resolves.toEqual([])

      expect(mockHttpClient.get).not.toHaveBeenCalled()
    })
  })
})
