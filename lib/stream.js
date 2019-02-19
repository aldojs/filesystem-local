
'use strict'

const mkdirp = require('mkdirp')
const { dirname } = require('path')
const { WriteStream, open } = require('fs')


exports.WriteStream = class extends WriteStream {
  /**
   * @override
   */
  open () {
    let { flags, mode, path } = this

    open(path, flags, mode, (err, fd) => {
      if (err) {
        // missing folders
        if (err.code === 'ENOENT') {
          return mkdirp(dirname(path), (_err) => {
            _err ? this._emitError(_err) : this.open()
          })
        }

        return this._emitError(err)
      }

      this.fd = fd
      this.emit('open', fd)
      this.emit('ready')
    })
  }

  /**
   * @private
   */
  _emitError (err) {
    if (this.autoClose) this.destroy()

    this.emit('error', err)
  }
}
