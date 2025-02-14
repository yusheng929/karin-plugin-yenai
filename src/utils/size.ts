import { logger } from 'node-karin'

/**
 * 将字节大小转换成易读的文件大小格式
 * @param size - 要转换的字节大小
 * @param options - 转换选项
 * @returns 转换后的文件大小字符串
 */
export function getFileSize (
  size: number,
  options: {
    /** 小数点保留位数，默认为2 */
    decimalPlaces?: number
    /** 是否在大小小于1KB时显示字节单位B，默认为true */
    showByte?: boolean
    /** 是否在单位后面显示缩写，默认为true */
    showSuffix?: boolean
  } = {}
) {
  const { decimalPlaces = 2, showByte = true, showSuffix = true } = options
  // 检查 size 是否为 null 或 undefined
  if (size === null || size === undefined) return 0 + 'B'

  // 检查 decimalPlaces 是否为整数
  if (typeof decimalPlaces !== 'number' || !Number.isInteger(decimalPlaces)) {
    throw new Error('decimalPlaces 必须是一个整数')
  }

  const units = ['B', 'K', 'M', 'G', 'T']
  const powers = [0, 1, 2, 3, 4]
  const num = 1024.00 // byte

  // 提前计算 powers of 1024
  const precalculated = powers.map(power => Math.pow(num, power))

  let unitIndex = 0
  while (size >= precalculated[unitIndex + 1] && unitIndex < precalculated.length - 1) {
    unitIndex++
  }

  // 使用一个函数来构建返回的字符串
  const buildSizeString = (value: number, unit: string, _showSuffix = showSuffix) => {
    const suffix = ` ${unit}${_showSuffix ? 'B' : ''}`
    return value.toFixed(decimalPlaces) + suffix
  }

  if (showByte && size < num) {
    return buildSizeString(size, 'B', false)
  }

  return buildSizeString(size / precalculated[unitIndex], units[unitIndex])
}

export async function createAbortCont (timeoutMs: number) {
  let AbortController

  try {
    AbortController = globalThis.AbortController
  } catch (error) {
    logger.error('无法加载AbortController:', error)
    throw new Error('网络请求控制器加载失败')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  // 可选：返回一个清理函数，以便在不需要超时时清除定时器
  return {
    controller,
    clearTimeout: () => {
      clearTimeout(timeoutId)
    }
  }
}
