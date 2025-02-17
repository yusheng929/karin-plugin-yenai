import getGPU from './gpu'
import getSWAP from './swap'
import getRAM from './ram'
import getCPU from './cpus'
import getNode from './node'

const SYSTEM_RESOURCE_MAP = {
  CPU: getCPU,
  RAM: getRAM,
  SWAP: getSWAP,
  GPU: getGPU,
  Node: getNode
}

export const getSystemResources = async () => {
  const systemResources = ['CPU', 'RAM', 'SWAP', 'GPU'] as const
  const systemResourcesList = await Promise.all(systemResources.map(i => SYSTEM_RESOURCE_MAP[i]()))
  const visualDataPromise = systemResourcesList.map(i => {
    if (i === false) return false
    if (i.percentage !== undefined) {
      // TODO: 。。。
      (i as unknown as any).percentage = Circle(i.percentage)
    }
    return i
  })

  return visualDataPromise
}

export function Circle (res: number) {
  const perimeter = 3.14 * 80
  const per = perimeter - perimeter * res
  let color = '--low-color'
  if (res >= 0.9) {
    color = '--high-color'
  } else if (res >= 0.8) {
    color = '--medium-color'
  }
  return {
    per,
    color: `var(${color})`
  }
}
