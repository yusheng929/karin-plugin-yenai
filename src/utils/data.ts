import lodash from 'node-karin/lodash'
import moment from 'node-karin/moment'
import systeminformation from 'systeminformation'

import { plugin } from './dir'
import { monitor } from './system/monitor'
import { getBotState } from '@/utils/style/bot'
import { getRedisInfo } from '@/utils/style/redis'
import { getStyle } from '@/utils/style/backdrop'
import { getNetwork } from '@/utils/system/network'
import { getSystemResources } from '@/utils/system'
import { getFastFetch } from '@/utils/system/fastfetch'
import { getProcessLoad } from '@/utils/system/processLoad'
import { getDiskSpeed, getFsSize } from '@/utils/system/fsSize'

import { common, getPlugins, type Message } from 'node-karin'
import { defaultConfig } from './config/default'

let osInfo: systeminformation.Systeminformation.OsData
systeminformation.osInfo()
  .then(res => {
    osInfo = res
  })

/**
 * 获取其他信息
 * @returns 其他信息
 */
export const getOtherInfo = async () => {
  const otherInfo = []
  // 其他信息
  otherInfo.push({
    first: '系统',
    tail: osInfo?.distro
  })
  // 插件数量
  otherInfo.push({
    first: '插件',
    tail: (await getPlugins('all')).length
  })
  otherInfo.push({
    first: '系统运行',
    tail: common.uptime()
  })

  return lodash.compact(otherInfo)
}

/**
 * 获取版权信息
 * @returns 版权信息
 */
export const getCopyright = async (): Promise<string> => {
  const { node, v8, git, redis } = await systeminformation.versions('node,v8,git,redis')
  const version = [
    `Created By karin<span class="version">${process.env.KARIN_VERSION}</span> `,
    `& ${plugin.name}<span class="version">v${plugin.version}</span>`,
    '<br>',
    `Node <span class="version">v${node}</span> & V8 <span class="version">v${v8}</span>`,
    git && ` & Git <span class="version">v${git}</span>`,
    redis && ` & Redis <span class="version">v${redis}</span>`,
    '<br>',
    '© Yenai-Plugin'
  ].filter(Boolean).join('')
  return version
}

/**
 * @description 获取椰奶状态渲染数据
 * @param e 消息对象
 * @returns 数据
 */
export const getData = async (e: Message) => {
  const isPro = e.msg.includes('pro')

  const [
    copyright,
    visualData,
    FastFetch,
    HardDisk,
    psTest,
    BotStatusList,
    style,
    redisInfo,
    processLoad,
    otherInfo
  ] = await Promise.all([
    getCopyright(),
    getSystemResources(),
    getFastFetch(isPro),
    getFsSize(),
    getNetwork(),
    getBotState(e.selfId, isPro),
    getStyle(),
    getRedisInfo(isPro),
    getProcessLoad(isPro),
    getOtherInfo()
  ])

  return {
    // 数据
    BotStatusList,
    redis: redisInfo,
    chartData: getChartData(isPro, true),
    visualData: lodash.compact(visualData),
    otherInfo,
    disks: {
      disksIo: getDiskSpeed(),
      disksSize: HardDisk
    },
    network: {
      speed: getNetwork(),
      psTest: lodash.isEmpty(psTest) ? undefined : psTest
    },
    FastFetch,
    processLoad,
    // 样式
    style,
    // 版权
    copyright,
    // 配置
    Config: JSON.stringify(defaultConfig),
    rawConfig: defaultConfig,
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    isPro
  }
}

/**
 * 获取图表数据
 * @param isPro 是否为pro
 * @param cfg 配置
 * @returns 图表数据
 */
const getChartData = (isPro: boolean, cfg: boolean | 'pro') => {
  if (cfg !== true && !(cfg === 'pro' && isPro)) return false
  const check = checkIfEmpty(monitor.chartData.network)
  return check ? false : JSON.stringify(monitor.chartData)
}

/**
 * 检查数据是否为空
 * @param data 数据
 * @param omits 忽略的属性
 * @returns 是否为空
 */
const checkIfEmpty = <T extends Record<string, unknown>> (data: T, omits: string[] = []): boolean => {
  const filteredData = lodash.omit(data, omits)
  return lodash.every(filteredData, (value): boolean =>
    lodash.isPlainObject(value) ? checkIfEmpty(value as T) : lodash.isEmpty(value)
  )
}
