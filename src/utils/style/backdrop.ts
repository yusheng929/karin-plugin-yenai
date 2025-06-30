import fs from 'node:fs'
import lodash from 'node-karin/lodash'
import { plugin } from '../dir'
import { join } from '../common/common'
import { config } from '../config/config'

/**
 * 资源缓存目录
 */

export const getStyle = async () => {
  const cfg = config()
  if (cfg.style.backdrop === 'false') {
    return {
      backdrop: getDefaultBackdrop(true)
    }
  }

  return {
    backdrop: cfg.style.backdrop
  }
}

/**
 * 获取默认背景图
 * @param fileName 默认背景图
 * @returns 默认背景图
 */
const getDefaultBackdrop = (isRandom?: boolean) => {
  if (isRandom) {
    const dir = plugin.customBackgroundImageDir
    const img = lodash.sample(fs.readdirSync(dir))
    if (img) return img
  }

  const imgDir = join(plugin.dir, 'resources/state/img/bg')
  const img = join(imgDir, 'default_bg.jpg')

  return img
}
