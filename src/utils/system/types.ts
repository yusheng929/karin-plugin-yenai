/**
 * 网络数据缓存类型
 */
export interface NetworkData {
  /** 上行速度 */
  rx_sec: number | null,
  /** 下行速度 */
  tx_sec: number | null,
  /** 接口名称 */
  iface: string,
  /** 上行字节数 */
  rx_bytes: number,
  /** 下行字节数 */
  tx_bytes: number
}

/**
 * 磁盘数据缓存类型
 */
export interface DiskData {
  /** 写入速度 */
  wIO_sec: number
  /** 读取速度 */
  rIO_sec: number
  /** 名称 */
  name: string
}

/**
 * 观察数据缓存类型
 */
export interface ObserveData {
  /** 磁盘io数据 可能为空对象 */
  disksIO: DiskData
  /** 网络数据 可能为空数组 */
  networkStats: NetworkData[]
  /** 内存数据 可能为空对象 */
  mem: {
    /** 活跃内存 */
    active: number
  }
  /** 当前负载 可能为空对象 */
  currentLoad: {
    /** 当前负载 */
    currentLoad: number
  }
}

/**
 * 图标数据缓存类型
 */
export interface ChartData {
  /** 网络数据 */
  network: {
    /** 上行 */
    upload: number[][],
    /** 下行 */
    download: number[][]
  },
  /** 磁盘io数据 */
  disksIO: {
    /** 读 */
    readSpeed: number[][],
    /** 写 */
    writeSpeed: number[][]
  },
  /** cpu数据 */
  cpu: number[][],
  /** 内存数据 */
  ram: number[][]
}
