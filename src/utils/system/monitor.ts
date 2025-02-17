import lodash from 'node-karin/lodash'
import si from 'systeminformation'
import { plugin } from '../dir'
import { getDiskIo } from './fastfetch'
import { logger, redis } from 'node-karin'

import type { ObserveData, ChartData, DiskData, NetworkData } from './types'

/** 图表数据key */
const CHART_DATA_KEY = 'karin:yenai:state:chartData'
/** 默认获取数据的间隔时间 */
const DEFAULT_INTERVAL = 60 * 1000
/** 默认存储的数据数量 */
const DEFAULT_SAVE_DATA_NUMBER = 60

const config = {
  /** 是否开启监控任务 */
  open: true,
  /** 获取数据的间隔时间，单位为毫秒 间隔越短获取的数据越精确 */
  getDataInterval: 10000,
  /** 存储的数据数量，当数据量超出此值时会将最旧的数据删除 */
  saveDataNumber: 60,
  /** 如果出现内存异常的情况可将此配置项开启，如果打开后报错请将监控任务关闭 */
  statusPowerShellStart: false,
  /** 开启redis存储数据 */
  openRedisSaveData: true
}

/**
 * 监控信息
 */
export const monitor: {
  /** 错误次数 */
  errorNum: number
  /** 检查数据次数 */
  checkDataNum: number
  /** 网络数据 */
  network: NetworkData[] | null
  /** 磁盘io数据 */
  disksIO: DiskData[] | null
  /** 图表数据 */
  chartData: ChartData
  /** 定时器 */
  timer: NodeJS.Timeout | null
  /** 获取数据对象 */
  valueObject: Record<string, string>
} = {
  errorNum: 0,
  checkDataNum: 0,
  network: null,
  disksIO: null,
  chartData: {
    network: {
      upload: [],
      download: []
    },
    disksIO: {
      readSpeed: [],
      writeSpeed: []
    },
    cpu: [],
    ram: []
  },
  timer: null,
  valueObject: {
    networkStats: 'rx_sec,tx_sec,iface,rx_bytes,tx_bytes',
    currentLoad: 'currentLoad',
    mem: 'active',
    disksIO: 'wIO_sec,rIO_sec'
  }
}

/**
 * 向数组中添加数据，如果数组长度超过允许的最大值，则删除最早添加的数据
 * @param arr - 要添加数据的数组
 * @param data - 要添加的新数据
 * @param maxLen - 数组允许的最大长度，默认值为60
 */
const addData = (arr: number[][], data: number[], maxLen = 60) => {
  if (data === null || data === undefined) return
  // 如果数组长度超过允许的最大值，删除第一个元素
  if (arr.length >= maxLen) {
    lodash.pullAt(arr, 0)
  }
  arr.push(data)
}

/**
 * 如果值是数字，则添加数据
 * @param chart - 图表数据
 * @param now - 当前时间
 * @param value - 值
 */
const addDataIfNumber = (chart: number[][], now: number, value: number) => {
  if (lodash.isNumber(value)) {
    addData(chart, [now, value])
  }
}

/**
 * 获取redis中的图表数据
 */
const getRedisChartData = async () => {
  if (!config.openRedisSaveData) return false
  const data = await redis.get(CHART_DATA_KEY)
  if (!data) return false
  lodash.merge(monitor.chartData, JSON.parse(data))
  return true
}

/**
 * 存储图表数据到redis
 */
const setRedisChartData = async () => {
  if (!config.openRedisSaveData) return false
  const EX = 60 * 60 * 12
  await redis.set(CHART_DATA_KEY, JSON.stringify(monitor.chartData), { EX })
    .catch((error) => {
      logger.error(
        `${plugin.name}[Monitor] 存储监控信息出错` +
        `如一直报错可进入配置文件将 ${logger.red('state.yaml > monitor.openRedisSaveData')} 设置为false即可消除报错`
      )
      logger.error(error)
    })
}

/**
 * 获取磁盘io数据
 * @param errorNum - 错误次数
 * @param timer - 定时器
 */
const getDiskIoFastfetch = async (
  errorNum: number,
  timer: NodeJS.Timeout
): Promise<void> => {
  try {
    const data = await getDiskIo()
    if (!data) {
      errorNum++
      return
    }

    monitor.disksIO = data
    const { bytesRead, bytesWritten } = data[0]
    if (lodash.isNumber(bytesRead) && lodash.isNumber(bytesWritten)) {
      addData(monitor.chartData.disksIO.writeSpeed, [Date.now(), bytesWritten])
      addData(monitor.chartData.disksIO.readSpeed, [Date.now(), bytesRead])
    }
  } catch (err) {
    errorNum++
  } finally {
    if (errorNum > 5) {
      clearInterval(timer)
      monitor.valueObject.disksIO = 'wIO_sec,rIO_sec'
    }
  }
}

/**
 * 获取磁盘io数据
 */
const fastfetchGetDiskIo = async () => {
  /** 测试fastfetch 是否能获取到数据 */
  const data = await getDiskIo()
  if (!data) return false

  delete monitor.valueObject?.disksIO

  const timer = setInterval(async () => {
    await getDiskIoFastfetch(monitor.errorNum, timer)
  }, config.getDataInterval)
}

/**
 * 检查数据
 * @param data - 数据
 */
const checkData = (data: ObserveData) => {
  if (monitor.checkDataNum < 5) {
    if (lodash.isEmpty(data) && monitor.timer) clearInterval(monitor.timer)
    lodash.forIn(data, (value, key) => {
      if (lodash.isEmpty(value)) {
        logger.debug(`${plugin.name}[Monitor]获取${key}数据失败，停止获取对应数据`)
        delete monitor.valueObject[key]
      }
    })
    monitor.checkDataNum++
  }
}

/**
 * 处理数据
 * @param data - 数据
 */
const handleData = (data: ObserveData) => {
  checkData(data)
  const now = Date.now()

  const networkStats = data.networkStats || []
  const mem = data.mem || { active: 0 }
  const currentLoad = data.currentLoad || { currentLoad: 0 }
  const disksIO = data.disksIO || { wIO_sec: 0, rIO_sec: 0, name: 'diskIO' }

  addDataIfNumber(monitor.chartData.ram, now, mem.active)
  addDataIfNumber(monitor.chartData.cpu, now, currentLoad.currentLoad)

  if (lodash.isNumber(disksIO?.wIO_sec) && lodash.isNumber(disksIO?.rIO_sec)) {
    disksIO.wIO_sec *= 1024
    disksIO.rIO_sec *= 1024
    disksIO.name = 'diskIO'
    monitor.disksIO = [disksIO]
    addDataIfNumber(monitor.chartData.disksIO.writeSpeed, now, disksIO.wIO_sec)
    addDataIfNumber(monitor.chartData.disksIO.readSpeed, now, disksIO.rIO_sec)
  }

  if (networkStats.length > 0 && lodash.isNumber(networkStats[0]?.tx_sec) && lodash.isNumber(networkStats[0]?.rx_sec)) {
    monitor.network = networkStats
    addDataIfNumber(monitor.chartData.network.upload, now, networkStats[0].tx_sec)
    addDataIfNumber(monitor.chartData.network.download, now, networkStats[0].rx_sec)
  }

  setRedisChartData()
  return data
}

/**
 * 初始化
 */
const init = async () => {
  await getRedisChartData()
  if (!config.open) return

  if (config.statusPowerShellStart) si.powerShellStart()
  const cb = (data: ObserveData) => handleData(data)
  await fastfetchGetDiskIo()
  monitor.timer = si.observe(monitor.valueObject, config.getDataInterval, cb) as unknown as NodeJS.Timeout
}

init()
