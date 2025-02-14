import os from 'os'
import { getFileSize } from '@/utils'

/** 获取nodejs内存情况 */
export default async function getNodeInfo () {
  const memory = process.memoryUsage()
  // 总共
  const rss = getFileSize(memory.rss)
  // 堆
  const heapTotal = getFileSize(memory.heapTotal)
  // 栈
  const heapUsed = getFileSize(memory.heapUsed)
  // 占用率
  const occupy = Number((memory.rss / (os.totalmem() - os.freemem())).toFixed(2))
  return {
    percentage: occupy,
    inner: Math.round(occupy * 100) + '%',
    title: 'Node',
    info: [
      `总 ${rss}`,
      `${heapTotal} | ${heapUsed}`
    ]
  }
}
