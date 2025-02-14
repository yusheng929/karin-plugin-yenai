import _ from 'node-karin/lodash'
import moment from 'node-karin/moment'
import systeminformation from 'systeminformation'
import { getFsSize } from './system/fsSize'
import { logger } from 'node-karin'
import getSystemResources from './system'
import getBotState from './bot'
import type { Message } from 'node-karin'

let osInfo: systeminformation.Systeminformation.OsData
systeminformation.osInfo()
  .then(res => {
    osInfo = res
  })

const timePromiseExecution = (
  promiseFn: Promise<any>,
  name: string
) => {
  const debugMessages = []
  const startTime = Date.now()
  return promiseFn.then((result) => {
    const endTime = Date.now()
    const duration = endTime - startTime
    const ter = logger.green(duration + ' ms')
    logger.debug(`[State] 获取 ${logger.magenta(name)} 用时: ${ter}`)
    debugMessages.push(`${name}: ${duration} ms`)
    return result
  })
}

export default function getOtherInfo () {
  const otherInfo = []
  // 其他信息
  otherInfo.push({
    first: '系统',
    tail: osInfo?.distro
  })
  // 插件数量
  otherInfo.push({
    first: '插件',
    tail: 0
  })
  otherInfo.push({
    first: '系统运行',
    tail: '0时1分1秒'
  })

  return _.compact(otherInfo)
}

const getFastFetch = async () => {
  return ''
}

const getNetwork = async () => {
  return false
}

const getStyle = async () => {
  return ''
}

const getRedisInfo = async () => {
  return false
}

const getProcessLoad = async () => {
  return false
}

export async function getCopyright () {
  const { node, v8, git, redis } = await systeminformation.versions('node,v8,git,redis')
  let v = `Created By karin<span class="version">${process.env.KARIN_VERSION}</span> & Yenai-Plugin<span class="version">v0.0.1</span>`
  v += '<br>'
  v += `Node <span class="version">v${node}</span> & V8 <span class="version">v${v8}</span>`
  if (git) {
    v += ` & Git <span class="version">v${git}</span>`
  }
  if (redis) {
    v += ` & Redis <span class="version">v${redis}</span>`
  }
  return v
}

export async function getData (e: Message) {
  const promiseTaskList = [
    getFsSize(),
    getCopyright(),
    getSystemResources(),
    getFastFetch(),
    getFsSize(),
    getNetwork(),
    getBotState(e.selfId, e.msg.includes('pro')),
    getStyle(),
    getRedisInfo(),
    getProcessLoad()
  ]

  const [
    copyright,
    visualData,
    FastFetch,
    HardDisk,
    psTest,
    BotStatusList,
    style,
    redisInfo,
    processLoad
  ] = await timePromiseExecution(Promise.all(promiseTaskList), 'all')

  return {
    // 数据
    BotStatusList,
    redis: redisInfo,
    chartData: '',
    visualData: _.compact(visualData),
    otherInfo: getOtherInfo(),
    disks: {
      disksIo: false,
      disksSize: HardDisk
    },
    network: {
      speed: getNetwork(),
      psTest: _.isEmpty(psTest) ? undefined : psTest
    },
    FastFetch,
    processLoad,
    // 样式
    style,
    // 版权
    copyright,
    // 配置
    Config: '',
    rawConfig: {},
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    isPro: false
  }
}
