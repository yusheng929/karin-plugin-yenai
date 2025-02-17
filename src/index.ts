import { logger } from 'node-karin'
import { plugin } from '@/utils/dir'

/** 请不要在这编写插件 不会有任何效果~ */
logger.info(`${logger.violet(`[插件:${plugin.version}]`)} ${logger.green(plugin.name)} 初始化完成~`)
