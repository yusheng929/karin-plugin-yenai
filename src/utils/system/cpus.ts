import si from 'systeminformation'

let cpu: si.Systeminformation.CpuData | null = null

/**
 * 获取CPU信息
 */
export default async function getCpuInfo () {
  if (!cpu) cpu = await si.cpu()

  let { currentLoad: { currentLoad }, fullLoad } = await si.get({
    currentLoad: 'currentLoad',
    fullLoad: '*'
  })

  let { manufacturer, speed, cores } = cpu ?? {}
  if (currentLoad === null || currentLoad === undefined) return false
  fullLoad = Math.round(fullLoad)
  manufacturer = manufacturer?.split(' ')?.[0] ?? 'unknown'
  return {
    percentage: currentLoad / 100,
    inner: Math.round(currentLoad) + '%',
    title: 'CPU',
    info: [
      `${manufacturer} ${cores}核 ${speed}GHz`,
      `CPU满载率 ${fullLoad}%`
    ]

  }
}
