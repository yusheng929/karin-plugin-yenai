import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { karinPathBase, requireFileSync } from 'node-karin'

/** 当前文件的绝对路径 */
const filePath = fileURLToPath(import.meta.url).replace(/\\/g, '/')

/** 插件包基本信息 */
export const plugin: {
  /** 插件包名称 */
  name: string
  /** 插件包版本 */
  version: string
  /** 插件包绝对路径 */
  dir: string
  /** 获取自定义背景图文件夹路径 */
  customBackgroundImageDir: string
} = {
  get name () {
    return pkg().name
  },
  get version () {
    return pkg().version
  },
  dir: path.resolve(filePath, '../../../'),
  get customBackgroundImageDir () {
    return path.join(karinPathBase, plugin.name, 'resources/state')
  }
}

/**
 * @description package.json
 */
export const pkg = () => requireFileSync(`${plugin.dir}/package.json`)

if (!fs.existsSync(plugin.customBackgroundImageDir)) {
  fs.mkdirSync(plugin.customBackgroundImageDir, { recursive: true })
}
