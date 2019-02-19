
'use strict'

const fs = require('fs')
const { promisify } = require('util')
const { WriteStream } = require('./stream')


exports.createWriteStream = function (path, options) {
  return new WriteStream(path, options)
}

exports.createReadStream = fs.createReadStream

exports.readFile = promisify(fs.readFile)

exports.readInfo = promisify(fs.stat)

exports.remove = promisify(fs.unlink)

/**
 * Returns `true` is the path is a file.
 * 
 * @param path The file path.
 */
exports.isFile = function (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (! err) return resolve(stats.isFile())

      if (err.code === 'ENOENT') return resolve(false)

      reject(err) // any other error should be thrown
    })
  })
}

/**
 * Write the file content.
 * 
 * @param {string} path 
 * @param {string | Buffer | Stream} content 
 * @param {Object} [options] 
 */
exports.writeFile = function (path, content, options) {
  if (_isStream(content)) return _writeStream(path, content, options)

  return writeFile(path, content, options)
}

/**
 * Check if the given imput is a stream object.
 * 
 * @param arg
 * @private
 */
function _isStream (arg) {
  return arg && typeof arg.pipe === 'function'
}

/**
 * Write the stream content, returns a promise.
 * 
 * @param path The file path.
 * @param content The file content.
 * @param options 
 * @private
 */
function _writeStream (path, content, options) {
  let stream = exports.createWriteStream(path, options)

  return new Promise((resolve, reject) => {
    stream.on('close', resolve)
    stream.on('error', reject)
    content.pipe(stream)
  })
}
