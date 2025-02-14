import _ from 'node-karin/lodash'
import si from 'systeminformation'
import { getFileSize } from '../index'

/**
 *  获取硬盘
 */
export async function getFsSize () {
  // 去重
  const fsSize = _.uniqWith(await si.fsSize(),
    (a, b) =>
      a.used === b.used && a.size === b.size && a.use === b.use && a.available === b.available
  )
    .filter(item => item.size && item.used && item.available && item.use)
  // 为空返回false
  if (_.isEmpty(fsSize)) return false
  // 数值转换
  return fsSize.map(item => {
    return {
      ...item,
      used: getFileSize(item.used),
      size: getFileSize(item.size),
      use: Math.round(item.use),
      color: setColor(item.use)
    }
  })
}

/**
 * 设置颜色
 * @param use 使用率
 * @returns 颜色
 */
function setColor (use: number) {
  if (use >= 90) {
    return 'var(--high-color)'
  } else if (use >= 70) {
    return 'var(--medium-color)'
  }
  return 'var(--low-color)'
}

// /**
//  * 获取磁盘读写速度
//  * @returns {object | boolean} 返回一个对象，包含读速度（rx_sec）和写速度（wx_sec），如果无法获取则返回false。
//  */
// export function getDiskSpeed() {
//   let data = Monitor.disksIO
//   if (!data?.length) return false
//   data.map(item => {
//     item.rIO_sec = getFileSize(item.rIO_sec, { showByte: false, showSuffix: false })
//     item.wIO_sec = getFileSize(item.wIO_sec, { showByte: false, showSuffix: false })
//     return item
//   })

//   return data
// }
