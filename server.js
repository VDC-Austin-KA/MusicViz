/**
 * MusicViz Server — Lightweight static HTTP server & API handler
 * Serves dist / root static files and provides API endpoints for demo/YouTube.
 */
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 8080

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.ts': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.ico': 'image/x-icon',
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  let reqPath = decodeURIComponent(url.pathname)

  // API Endpoints
  if (reqPath === '/api/demo') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', tracks: ['rave-140', 'rave-128', 'rave-150'] }))
    return
  }

  if (reqPath.startsWith('/api/youtube')) {
    res.writeHead(501, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Direct YouTube streaming requires local proxy or tab capture.' }))
    return
  }

  // Serve static files (check dist first, then root)
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html'

  let filePath = path.join(__dirname, 'dist', reqPath)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, reqPath)
  }

  // Fallback to dist/index.html for SPA routes
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const distIndex = path.join(__dirname, 'dist', 'index.html')
    if (fs.existsSync(distIndex)) {
      filePath = distIndex
    } else {
      filePath = path.join(__dirname, 'index.html')
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    })

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  })
})

server.listen(PORT, () => {
  console.log(`\n🚀 MusicViz server running at http://localhost:${PORT}`)
  console.log(`   Local network: http://127.0.0.1:${PORT}\n`)
})
