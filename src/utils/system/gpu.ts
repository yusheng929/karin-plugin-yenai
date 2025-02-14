import { logger } from 'node-karin'
import si from 'systeminformation'

let isGPU = false
const LogPrefix = 'State';

(async function initGetIsGPU () {
  const { controllers } = await si.graphics()
  // 初始化GPU获取
  if (controllers?.find(item =>
    item.memoryUsed && item.memoryFree && item.utilizationGpu)
  ) {
    isGPU = true
  }
})()

/** 获取GPU占用 */
export default async function getGPU () {
  if (!isGPU) return false
  try {
    const { controllers } = await si.graphics()
    const graphics = controllers?.find(item =>
      item.memoryUsed && item.memoryFree && item.utilizationGpu
    )
    if (!graphics) {
      logger.warn(`${LogPrefix}[State]状态GPU数据异常：\n`, controllers)
      return false
    }
    const {
      vendor, temperatureGpu, utilizationGpu,
      memoryTotal, memoryUsed /* powerDraw */
    } = graphics

    const powerDrawStr = temperatureGpu ? `${temperatureGpu}W` : ''
    // powerDraw && (powerDraw = powerDraw + "W")
    return {
      percentage: (utilizationGpu ?? 0) / 100,
      inner: Math.round(utilizationGpu ?? 0) + '%',
      title: 'GPU',
      info: [
        `${(memoryUsed ?? 0 / 1024).toFixed(2)} GB / ${(memoryTotal ?? 0 / 1024).toFixed(2)} GB`,
        `${vendor} ${powerDrawStr}`
      ]
    }
  } catch (e) {
    logger.warn(`${LogPrefix}[State] 获取GPU失败`)
    return false
  }
}
