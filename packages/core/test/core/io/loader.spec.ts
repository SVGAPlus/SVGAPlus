import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import * as url from 'url'

import { SVGAPlus } from '../../../src'

describe('loadSvgaFile testing.', () => {
  const port = 30001
  let httpServer: http.Server = null

  beforeAll(() => {
    httpServer = http.createServer((req, res) => {
      const uri = url.parse(req.url).pathname
      const filePath = path.join(__dirname, '../../assets', uri)
      const isFileExist = fs.existsSync(filePath)
      if (!isFileExist) {
        res.writeHead(404, {'Content-Type': 'text/plain'})
        res.write('404 Not Found\n')
        res.end()
        return
      }

      const stat = fs.statSync(filePath)
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename=' + uri.replace('/', '')
      })
      const stream = fs.createReadStream(filePath)
      stream.pipe(res)
    }).listen(port)
  })

  it('Should load svga file correctly.', async () => {
    const fileUrl = `http://127.0.0.1:${port}/hex.svga`
    const buffer = await SVGAPlus.loadSvgaFile(fileUrl)
    expect(buffer.byteLength).toEqual(259685)
  })

  afterAll(() => {
    httpServer.close()
  })
})
