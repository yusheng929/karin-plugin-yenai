export interface ConfigTypes {
  /** 设置为默认状态 */
  defaultState: boolean
  /** 网络测试 */
  psTestSites: {
    /**
     * 是否显示
     * true - 显示
     * false - 不显示
     * pro - 只有pro显示
     */
    show: boolean | 'pro'
    list: {
      /** 显示名称 */
      name: string
      /** 要访问的网址 */
      url: string
      /** 是否使用插件配置中的代理访问 */
      useProxy: boolean
    }[]
    /** 测试超时时间 */
    timeout: number
    /** 并发数量 */
    concurNum: number
  }
  /** 监控任务 */
  monitor: {
    /** 是否开启监控任务 */
    open: boolean
    /** 获取数据的间隔时间，单位为毫秒 间隔越短获取的数据越精确 */
    getDataInterval: number
    /** 存储的数据数量，当数据量超出此值时会将最旧的数据删除 */
    saveDataNumber: number
    /** 如果出现内存异常的情况可将此配置项开启，如果打开后报错请将监控任务关闭 */
    statusPowerShellStart: boolean
    /** 开启redis存储数据 */
    openRedisSaveData: boolean
  }
  /** 显示的系统资源 */
  systemResources: string[]
  /** 进程负载 */
  processLoad: {
    /** 是否显示 */
    show: boolean | 'pro'
  }
  /** 关闭图表 */
  closedChart: boolean
  /** 是否显示FastFetch */
  showFastFetch: 'true' | 'false' | 'pro' | 'default'
  /** 是否显示redis信息 */
  showRedisInfo: 'true' | 'false' | 'pro'
  /** 图表配置 */
  chartsCfg: {
    /** 显示模式 */
    show: boolean
    /** 标题颜色 */
    titleColor: string
    /** 标题文字 */
    titleText: string
    /** 调色盘 */
    color: string[]
    /** 主题配置 */
    themeCfg: string
  }
  /** 样式 */
  style: {
    /** 远程背景图片api，设置为false则一直使用默认背景 */
    backdrop: string
    /** 当api请求失败时使用的默认背景图，请放置在@karinjs/karin-plugin-yenai/resources/state目录下 */
    backdropDefault: string
    /** Bot昵称的颜色 */
    BotNameColor: string
    /** 主硬件进度条和磁盘进度条的颜色 */
    progressBarColor: {
      high: string
      medium: string
      low: string
    }
    /** redis信息值颜色 */
    redisInfoValColor: string
  }
}

/**
 * 默认配置
 */
export const defaultConfig: ConfigTypes = {
  defaultState: false,
  psTestSites: {
    show: 'pro',
    list: [
      {
        name: 'Baidu',
        url: 'https://baidu.com',
        useProxy: false,
      },
      {
        name: 'Google',
        url: 'https://google.com',
        useProxy: true,
      },
    ],
    timeout: 5000,
    concurNum: 5,
  },
  monitor: {
    open: true,
    getDataInterval: 60000,
    saveDataNumber: 60,
    statusPowerShellStart: false,
    openRedisSaveData: true,
  },
  systemResources: ['CPU', 'RAM', 'SWAP', 'GPU'],
  processLoad: {
    show: 'pro',
  },
  closedChart: false,
  showFastFetch: 'default',
  showRedisInfo: 'true',
  chartsCfg: {
    show: true,
    titleColor: '#84A0DF',
    titleText: 'Network',
    color: ['#2ec7c9', '#b6a2de'],
    themeCfg: 'westeros',
  },
  style: {
    backdrop: 'https://t.alcy.cc/mp',
    backdropDefault: 'random',
    BotNameColor: '#000',
    progressBarColor: {
      high: '#d73403',
      medium: '#ffa500',
      low: '#84A0DF',
    },
    redisInfoValColor: '#485ab6',
  },
}
