import lodash from 'node-karin/lodash'
import si from 'systeminformation'
import { getFileSize } from '@/utils/common/common'
import { logger } from 'node-karin'

/** 进程数据类型，可以是进程信息或分隔符 */
type ProcessData = si.Systeminformation.ProcessesProcessData | 'hr'

/** 进程列表数据接口 */
export interface ProcessListItem {
  name: string
  pid: string
  cpu: string
  mem: string
}

/** 分隔符常量 */
const SEPARATOR = 'hr' as const

/** 进程配置接口 */
interface ProcessConfig {
  /** 是否显示 true - 显示 - false - 不显示 pro - 只有pro显示 */
  show: boolean | 'pro'
  /** 是否显示进程命令 */
  showCmd: boolean
  /** 显示最大的资源占用进程配置 */
  showMax: {
    /** 是否显示 */
    show: boolean
    /** 排序方式: cpu - CPU占用率排序, mem - 内存占用排序, cpu_mem - CPU和内存混合排序 */
    order: 'cpu' | 'mem' | 'cpu_mem'
    /** 显示数量 */
    showNum: number
  }
  /** 需要监控的进程名列表 */
  list: string[]
  /** 需要过滤的进程名列表（精确匹配） */
  filterList: string[]
}

/** 进程监控配置 */
const processConfig: ProcessConfig = {
  show: 'pro',
  showCmd: false,
  showMax: {
    show: true,
    order: 'cpu_mem',
    showNum: 6,
  },
  list: [
    'node',
    'redis-server',
    'chromium',
    '$(process.env.SHELL || process.env.COMSPEC || "sh").split(/\\/|\\\\/).at(-1)',
    '$process.title'
  ],
  filterList: [
    'System Idle Process',
  ],
}

/**
 * 对进程列表按指定资源占用进行排序
 * @param processList - 进程列表
 * @param orderBy - 排序方式
 * @returns 排序后的进程列表
 */
const sortProcessList = (
  processList: si.Systeminformation.ProcessesProcessData[],
  orderBy: 'cpu' | 'mem'
): si.Systeminformation.ProcessesProcessData[] => {
  return lodash.orderBy(processList, orderBy, 'desc')
}

/**
 * 获取资源占用最高的进程列表
 * @param processList - 进程列表
 * @param shouldShow - 是否显示
 * @param orderBy - 排序方式
 * @param limit - 显示数量
 * @returns 资源占用最高的进程列表
 */
const getTopProcesses = (
  processList: si.Systeminformation.ProcessesProcessData[],
  shouldShow: boolean,
  orderBy: 'cpu' | 'mem' | 'cpu_mem',
  limit: number
): ProcessData[] => {
  if (!shouldShow) return []

  if (orderBy === 'cpu') {
    return sortProcessList(processList, 'cpu').slice(0, limit)
  }
  if (orderBy === 'mem') {
    return sortProcessList(processList, 'mem').slice(0, limit)
  }
  if (orderBy === 'cpu_mem') {
    const cpuSorted = sortProcessList(processList, 'cpu')
    const memSorted = sortProcessList(processList, 'mem')

    const cpuLimit = Math.ceil(limit / 2)
    const memLimit = limit - cpuLimit

    return [
      ...cpuSorted.slice(0, cpuLimit),
      SEPARATOR,
      ...memSorted.slice(0, memLimit)
    ]
  }
  return []
}

/**
 * 处理自定义进程列表
 * @param targetProcesses - 目标进程名列表
 * @param showCommand - 是否显示进程命令
 * @param processInfo - 系统进程信息
 * @param resultList - 结果列表
 */
const processCustomList = (
  targetProcesses: string[],
  showCommand: boolean,
  processInfo: si.Systeminformation.ProcessesData,
  resultList: ProcessData[]
) => {
  if (!targetProcesses?.length) return

  /** 进程聚合数据 */
  const processAggregation: Record<string, si.Systeminformation.ProcessesProcessData & {
    pid: string
    cpu: number
    memRss: number
    childNums: number
  }> = {}

  // eslint-disable-next-line no-eval
  const processNames: string[] = targetProcesses.map(name => name.startsWith('$') ? globalThis.eval(name.replace('$', '')) : name)

  for (const process of processInfo.list) {
    const { name, command } = process
    const isWindowsExe = global.process.platform === 'win32' && processNames.includes(name.replace(/.exe$/, ''))

    if (!processNames.includes(name) && !processNames.includes(command) && !isWindowsExe) {
      continue
    }

    if (resultList.includes(process)) continue

    const key = showCommand ? process.command : process.name
    if (key in processAggregation) {
      processAggregation[key] = Object.assign(processAggregation[key], {
        pid: `${processAggregation[key].pid},${process.pid}`,
        cpu: processAggregation[key].cpu + process.cpu,
        memRss: processAggregation[key].memRss + process.memRss,
        childNums: processAggregation[key].childNums + 1
      })
    } else {
      processAggregation[key] = Object.assign(process, {
        childNums: 0,
        pid: String(process.pid),
        cpu: process.cpu,
      })
    }
  }

  resultList.push(SEPARATOR, ...Object.values(processAggregation))
}

/**
 * 获取进程的子进程映射
 * @param processList - 进程列表
 * @param parentPids - 父进程PID列表
 * @returns 进程子进程映射表
 */
const getProcessChildren = (
  processList: si.Systeminformation.ProcessesProcessData[],
  parentPids: number[]
): Record<string, si.Systeminformation.ProcessesProcessData[]> => {
  const processChildrenMap: Record<string, si.Systeminformation.ProcessesProcessData[]> = {}

  processList.forEach(process => {
    process.parentPid = Number(process.parentPid) ?? process.parentPid

    if (parentPids.includes(process.parentPid)) {
      if (processChildrenMap[process.parentPid]) {
        processChildrenMap[process.parentPid].push(process)
      } else {
        processChildrenMap[process.parentPid] = [process]
      }
    }
  })

  return processChildrenMap
}

/**
 * 获取系统进程负载信息
 * @param isPro - 是否为pro
 * @returns 进程负载信息或false（如果未启用）
 */
export const getProcessLoad = async (isPro: boolean): Promise<false | {
  all: number
  running: number
  blocked: number
  sleeping: number
  unknown: number
  list: ProcessListItem[]
}> => {
  const { show, list, showMax, showCmd, filterList } = processConfig
  if (!show || (show === 'pro' && !isPro)) {
    return false
  }

  try {
    const processInfo = await si.processes().then(info => {
      info.list = info.list.filter(process => !filterList.includes(process.name))
      return info
    })

    const topProcesses = getTopProcesses(processInfo.list, showMax.show, showMax.order, showMax.showNum)
    processCustomList(list, showCmd, processInfo, topProcesses)

    const pids = topProcesses
      .map(process => typeof process === 'object' && process.pid)
      .filter((pid): pid is number => typeof pid === 'number')
    const processChildren = getProcessChildren(processInfo.list, pids)

    const processList: ProcessListItem[] = []
    topProcesses.forEach(item => {
      if (typeof item === 'string') {
        if (item === SEPARATOR) return item
        return
      }

      const { name, command, pid, cpu, memRss } = item
      const childCount: number = ('childNums' in item ? item.childNums as number : processChildren[pid]?.length) ?? 0

      const childSuffix = childCount > 0 ? `(${childCount})` : ''
      const displayName = (showCmd ? command : name) + childSuffix

      processList.push({
        name: displayName,
        pid: String(pid),
        cpu: cpu?.toFixed(2) + '%',
        mem: getFileSize(Number(memRss) * 1024)
      })
    })

    return {
      all: processInfo.all,
      running: processInfo.running,
      blocked: processInfo.blocked,
      sleeping: processInfo.sleeping,
      unknown: processInfo.unknown,
      list: processList
    }
  } catch (error) {
    logger.error(error)
    return false
  }
}
