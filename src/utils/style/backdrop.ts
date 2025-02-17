import fs from 'node:fs'
import lodash from 'node-karin/lodash'
import { plugin } from '../dir'
import { join } from '../common/common'

/**
 * 资源缓存目录
 */

export const getStyle = async () => {
  const backdrop = 'https://t.alcy.cc/mp'
  const backdropDefault = 'random'
  return {
    backdrop
  }
}

/**
 * 获取默认背景图
 * @param backdropDefault 默认背景图
 * @returns 默认背景图
 */
const getDefaultBackdrop = (backdropDefault: string) => {
  const dir = join(plugin.dir, 'resources/state/img/bg')
  if (backdropDefault === 'random') {
    backdropDefault = lodash.sample(fs.readdirSync(dir)) || 'default_bg.jpg'
  }
  return {
    path: join(dir, backdropDefault),
    fileName: backdropDefault
  }
}
