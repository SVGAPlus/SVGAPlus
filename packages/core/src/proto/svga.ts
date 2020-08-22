import * as protobuf from 'protobufjs/light'

// tslint:disable-next-line:no-var-requires
const json = require('./bundle.json')
const proto = protobuf.Root.fromJSON(json)

// tslint:disable-next-line:variable-name
const MovieEntity = proto.lookupType('com.opensource.svga.MovieEntity')

export {
  MovieEntity
}
