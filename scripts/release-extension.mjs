import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const packageJsonPath = path.join(rootDir, 'package.json')
const packageLockPath = path.join(rootDir, 'package-lock.json')
const manifestPath = path.join(rootDir, 'public', 'manifest.json')
const versionFilePath = path.join(rootDir, 'src', 'services', 'version.js')
const distDir = path.join(rootDir, 'dist')

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const mode = process.argv[2]
const versionArg = getVersionArg(process.argv.slice(3))

if (!['build', 'set'].includes(mode)) {
  fail('Usage: node scripts/release-extension.mjs <build|set> [version]')
}

if (mode === 'set' && !versionArg) {
  fail('A version is required. Example: npm run set:version -- 1.1.2')
}

if (versionArg) {
  validateVersion(versionArg)
  syncVersion(versionArg)
}

if (mode === 'set') {
  process.exit(0)
}

const currentVersion = readJson(packageJsonPath).version
const outputZipPath = path.join(rootDir, `freshtab-${currentVersion}.zip`)

run(npmCommand, ['run', 'build'])
run(npmCommand, ['run', 'fix:extension'])
fs.rmSync(outputZipPath, { force: true })
run('zip', ['-r', outputZipPath, '.'], { cwd: distDir })

function getVersionArg(args) {
  if (args.length === 0) {
    return ''
  }

  const firstArg = args[0]
  if (!firstArg.startsWith('-')) {
    return firstArg
  }

  if (firstArg === '--version' || firstArg === '-v') {
    return args[1] || ''
  }

  if (firstArg.startsWith('--version=')) {
    return firstArg.slice('--version='.length)
  }

  return ''
}

function validateVersion(version) {
  if (!/^\d+(\.\d+){0,3}$/.test(version)) {
    fail('Version must use Chrome extension format, for example: 1.2.3')
  }
}

function syncVersion(version) {
  const packageJson = readJson(packageJsonPath)
  packageJson.version = version
  writeJson(packageJsonPath, packageJson)

  if (fs.existsSync(packageLockPath)) {
    const packageLock = readJson(packageLockPath)
    packageLock.version = version
    if (packageLock.packages?.['']) {
      packageLock.packages[''].version = version
    }
    writeJson(packageLockPath, packageLock)
  }

  const manifest = readJson(manifestPath)
  manifest.version = version
  writeJson(manifestPath, manifest)

  fs.writeFileSync(versionFilePath, `export const CURRENT_VERSION = '${version}'\n`)
  console.log(`Synced version to ${version}`)
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, content) {
  fs.writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`)
}

function run(command, args, options = {}) {
  execFileSync(command, args, {
    stdio: 'inherit',
    ...options,
  })
}

function fail(message) {
  console.error(message)
  process.exit(1)
}