import path from 'node:path'
import { exec, logger } from 'node-karin'
import { plugin } from '../dir'
import { join } from '../common/common'

/** 是否安装fastfetch */
let isInstalled = false
/** git bash */
let gitBash = ''

/**
 * 获取磁盘io
 */
export const getDiskIo = async () => {
  const { stdout } = await exec('fastfetch -s diskio --format json')
  if (!stdout) return false
  const data = JSON.parse(stdout)[0]
  if (data.error) return false
  return data.result.map((i: Record<string, any>) => {
    i.rIO_sec = i.bytesRead
    i.wIO_sec = i.bytesWritten
    i.name = `diskIO(${i.name.trim()})`
    return i
  })
}

/**
 * 获取fastfetch输出
 */
export const getFastFetch = async (isPro: boolean): Promise<string> => {
  if (!isPro) return ''
  if (!isInstalled) {
    if (!gitBash) return ''
    return bashGetFastFetch()
  }

  return directlyGetFastFetch()
}

/**
 * 检查是否安装fastfetch
 */
const init = async () => {
  const { stdout } = await exec('fastfetch -v')
  const isFastfetch = stdout.includes('fastfetch')
  if (!isFastfetch) {
    logger.warn(`[${plugin.name}] 未安装fastfetch: 请查看文档 https://github.com/fastfetch-cli/fastfetch 自行安装`)
  }

  isInstalled = isFastfetch

  const { stdout: git } = await exec('where git')
  if (git.includes('git.exe')) {
    gitBash = join(path.dirname(path.dirname(git)), 'bin/bash.exe')
  }
}

/**
 * 获取fastfetch输出 通过自定义的bash脚本
 */
const bashGetFastFetch = async () => {
  const { stdout } = await exec(`"${gitBash}" ${join(plugin.dir, 'resources/state/state.sh')}`)
  return stdout?.trim() || ''
}

/**
 * 获取fastfetch输出 通过fastfetch命令
 */
const directlyGetFastFetch = async () => {
  const { stdout } = await exec('fastfetch --pipe -l none')
  if (!stdout) return ''
  return [
    '<div class="box fastFetch" data-boxInfo="FastFetch">',
    _printInfo(stdout),
    '</div>'
  ].join('')
}

/**
 * 处理fastfetch输出
 * @param input - 输入
 * @returns 打印信息
 */
const _printInfo = (input: string) => {
  const lines = input.split('\n').filter(i => i.includes(':')).map(line => line.replace(/: /, '</p><p>'))
  return lines.map(line => `<div class='speed'><p>${line}</p></div>`).join('')
}

init()
