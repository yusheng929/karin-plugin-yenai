import path from 'node:path'

/**
 * 将路径连接成一个完整的路径
 * @param paths - 路径
 * @returns 完整的路径
 */
export const join = (...paths: string[]) => path.join(...paths).replace(/\\/g, '/')

/**
 * 睡眠函数
 * @param ms - 毫秒
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 将字节大小转换成易读的文件大小格式
 * @param size - 要转换的字节大小
 * @param options - 转换选项
 */
export function getFileSize (
  size: number | null | undefined,
  options: {
    /** 小数点保留位数，默认为2 */
    decimalPlaces?: number
    /** 是否在大小小于1KB时显示字节单位B，默认为true */
    showByte?: boolean
    /** 是否在单位后面显示缩写，默认为true */
    showSuffix?: boolean
  } = {}
) {
  if (size === null || size === undefined) return 0 + 'B'
  const { decimalPlaces = 2, showByte = true, showSuffix = true } = options

  if (typeof decimalPlaces !== 'number' || !Number.isInteger(decimalPlaces)) {
    throw new Error('decimalPlaces 必须是一个整数')
  }

  const units = ['B', 'K', 'M', 'G', 'T']
  const powers = [0, 1, 2, 3, 4]
  const num = 1024.00 // byte

  /** 提前计算1024的幂 */
  const precalculated = powers.map(power => Math.pow(num, power))

  let unitIndex = 0
  while (size >= precalculated[unitIndex + 1] && unitIndex < precalculated.length - 1) {
    unitIndex++
  }

  /**
   * 构建返回的字符串
   * @param value - 值
   * @param unit - 单位
   * @param _showSuffix - 是否显示缩写
   */
  const buildSizeString = (value: number, unit: string, _showSuffix = showSuffix) => {
    const suffix = ` ${unit}${_showSuffix ? 'B' : ''}`
    return value.toFixed(decimalPlaces) + suffix
  }

  if (showByte && size < num) {
    return buildSizeString(size, 'B', false)
  }

  return buildSizeString(size / precalculated[unitIndex], units[unitIndex])
}
