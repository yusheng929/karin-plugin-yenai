import { plugin } from '../dir'
import { monitor } from './monitor'
import { getFileSize, join } from '@/utils/common/common'

/**
 * 获取当前网速
 */
export function getNetwork () {
  const network = monitor.network
  if (!network || network.length === 0) {
    return false
  }

  const data = []
  const resPath = join(plugin.dir, 'resources/state/icon/')
  const txImg = `<img src="${resPath + 'tx.svg'}">`
  const rxImg = `<img src="${resPath + 'rx.svg'}">`

  for (const v of network) {
    if (v.rx_sec != null && v.tx_sec != null) {
      const _rx = getFileSize(v.rx_sec, { showByte: false, showSuffix: false })
      const _tx = getFileSize(v.tx_sec, { showByte: false, showSuffix: false })
      data.push({
        first: v.iface,
        tail: `↑ ${_tx}/s | ↓ ${_rx}/s`
      })
    }
    if (v.rx_bytes != null && v.tx_bytes != null) {
      const _rxB = getFileSize(v.rx_bytes)
      const _txB = getFileSize(v.tx_bytes)
      data.push({
        first: '流量',
        tail: `${txImg} ${_txB} | ${rxImg} ${_rxB}`
      })
    }
  }
  return data.length === 0 ? false : data
}
