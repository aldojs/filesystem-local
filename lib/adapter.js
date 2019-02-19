
'use strict'

const api = require('./api')
const { resolve, join, normalize, dirname } = require('path')


exports.LocalAdapter = class {
  /**
   * 
   * @param {string} path 
   */
  constructor (path) {
    this._root = resolve(path) // ensure absolute path
  }

  /**
   * Read a file's content.
   * 
   * @param {string} filename 
   * @param {Object} [options] 
   * @public
   * @async
   */
  read (filename, options) {
    return api.readFile(this._resolve(filename), options)
  }

  /**
   * Get a file's metadata.
   * 
   * @param {string} filename 
   * @param {Object} [options] 
   * @public
   * @async
   */
  readInfo (filename, options) {
    return api.readInfo(this._resolve(filename)).then(this._normalize)
  }

  /**
   * Determine if a file exists.
   * 
   * @param {string} filename 
   * @param {Object} options 
   * @public
   * @async
   */
  exists (filename, options) {
    return api.isFile(this._resolve(filename))
  }

  /**
   * Create a readable of the file contents.
   * 
   * @param {string} filename 
   * @param {Oject} [options] 
   * @public
   */
  createReadStream (filename, options) {
    return api.createReadStream(this._resolve(filename), options)
  }

  /**
   * Write the contents of a file.
   * 
   * @param {string} filename 
   * @param {string | Buffe | Stream} content 
   * @param {Object} options 
   * @public
   * @async
   */
  async write (filename, content, { overwrite = false, ...options } = {}) {
    let flags = (options.overwrite === true) ? 'w' : 'wx'

    await api.writeFile(this._resolve(filename), content, { flags, ...options })

    return this.readInfo(filename)
  }

  /**
   * Unlink a file.
   * 
   * @param {string} filename 
   * @param {Object} [options] 
   * @public
   * @async
   */
  remove (filename, options) {
    return api.remove(this._resolve(filename))
  }

  /**
   * Resolve the file's path.
   * 
   * @param {string} filename 
   * @throws if the path is out of range.
   * @private
   */
  _resolve (filename) {
    let path = normalize(join(this._root, filename))

    // Security: Check if the `path` is out of the root directory.
    if (! dirname(path).startsWith(this._root)) {
      throw new RangeError(`The file "${filename}" is out of range.`)
    }

    return path
  }

  /**
   * Normalize the file metadata.
   * 
   * @param {Stats} stats 
   * @private
   */
  _normalize (stats) {
    // TODO: guess mimetype from the file extension.

    return {
      mimeType: 'application/octet-stream',
      created: stats.birthtimeMs,
      modified: stats.mtimeMs,
      size: stats.size
    }
  }
}
