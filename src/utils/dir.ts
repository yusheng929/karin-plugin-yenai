import path from 'path'
import { fileURLToPath } from 'url'
import { requireFileSync } from 'node-karin'

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
} = {
  get name () {
    return pkg().name
  },
  get version () {
    return pkg().version
  },
  dir: path.resolve(filePath, '../../../')
}

/**
 * @description package.json
 */
export const pkg = () => requireFileSync(`${plugin.dir}/package.json`)
