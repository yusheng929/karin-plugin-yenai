export { pkg } from '@/utils/dir'
import { plugin } from '@/utils/dir'
import {
  watch,
  logger,
  basePath,
  filesByExt,
  copyConfigSync,
  requireFileSync,
} from 'node-karin'

const dir = `${basePath}/${plugin.name}`
const dirConfig = `${dir}/config`

const defDir = `${plugin.dir}/config`
const defConfig = `${defDir}/config`

/**
 * @description 初始化配置文件
 */
copyConfigSync(defConfig, dirConfig, ['.json'])

/**
 * @description 配置文件
 */
export const config = () => {
  const cfg = requireFileSync(`${dirConfig}/config.json`)
  const def = requireFileSync(`${defConfig}/config.json`)
  return { ...def, ...cfg }
}

/**
 * @description 监听配置文件
 */
setTimeout(() => {
  const list = filesByExt(dirConfig, '.json', 'abs')
  list.forEach(file => watch(file, (old, now) => {
    logger.info('旧数据:', old)
    logger.info('新数据:', now)
  }))
}, 2000)
