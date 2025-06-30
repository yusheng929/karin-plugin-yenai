import fs from 'node:fs'
import path from 'node:path'
import { clearRequireFile, karinPathBase } from 'node-karin'

export { pkg } from '@/utils/dir'
import { plugin } from '@/utils/dir'
import { ConfigTypes, defaultConfig } from './default'
import { watch, filesByExt, requireFileSync } from 'node-karin'

const dir = `${karinPathBase}/${plugin.name}`
const configDir = `${dir}/config`
const fileDir = path.join(configDir, 'config.json')

/**
 * @description 配置文件
 */
export const config = (): ConfigTypes => {
  if (!fs.existsSync(fileDir)) {
    fs.writeFileSync(fileDir, JSON.stringify(defaultConfig, null, 2))
  }

  const cfg = requireFileSync(fileDir)
  return { ...defaultConfig, ...cfg }
}

export const writeConfig = (cfg: ConfigTypes) => {
  fs.writeFileSync(fileDir, JSON.stringify(cfg, null, 2))
}

/**
 * @description 监听配置文件
 */
setTimeout(() => {
  const list = filesByExt(configDir, '.json', 'abs')
  list.forEach(file => watch(file, () => clearRequireFile(file)))
}, 2000)
