/*
# 设置为默认状态
defaultState: false

# 网络测试
psTestSites:
  # 是否显示
  # true - 显示
  # false - 不显示
  # pro - 只有pro显示
  show: pro
  # name: 显示名称
  # url: 要访问的网址
  # useProxy: 是否使用插件配置中的代理访问
  list:
    - name: Baidu
      url: https://baidu.com
      useProxy: false
    - name: Google
      url: https://google.com
      useProxy: true
  # 测试超时时间
  timeout: 5000
  # 并发数量
  concurNum: 5

# 监控任务 该配置均需重启生效
monitor:
  # 是否开启监控任务
  open: true
  # 获取数据的间隔时间，单位为毫秒 间隔越短获取的数据越精确
  getDataInterval: 60000
  # 存储的数据数量，当数据量超出此值时会将最旧的数据删除
  saveDataNumber: 60
  # 如果出现内存异常的情况可将此配置项开启，如果打开后报错请将监控任务关闭
  statusPowerShellStart: false
  # 开启redis存储数据
  openRedisSaveData: true

# 显示的系统资源可选值: [CPU, RAM, SWAP, GPU, Node] 注意如果gpu获取不到将不会显示
systemResources:
  - CPU
  - RAM
  - SWAP
  - GPU

# 进程负载
processLoad:
  # 是否显示 true - 显示 - false - 不显示 pro - 只有pro显示
  show: pro
  # 是否显示进程pid
  # showPid: false
  # 是否显示进程命令
  showCmd: false
  # 显示最大的mem占用或cpu占用的进程
  showMax:
    # 是否显示 true - 显示 - false - 不显示
    show: true
    # 显示数量
    showNum: 6
    # 排序方式
    # cpu - 以cpu占用进行排序显示
    # mem - 以mem占用进行排序显示
    # cpu_mem - cpu占用和mem占用最多的各显示一半
    order: cpu_mem
  # 进程名
  list:
    - node
    - redis-server
    - chromium
    - "$(process.env.SHELL || process.env.COMSPEC || 'sh').split(/\\/|\\\\/).at(-1)"
    - $process.title
  # 过滤的进程名 该list中的进程名将会被过滤掉 精确匹配
  filterList:
    - System Idle Process

# 关闭图表
closedChart: false

# 是否显示FastFetch 参数:true, false, pro ,default
# true - 开启
# false - 关闭
# pro - 只有状态pro显示
# default - win默认只有pro显示，liunx等其他正常也会显示
showFastFetch: default

# 是否显示redis信息 可选参数:true, false, pro
# true - 全部显示
# false - 关闭
# pro - 只有状态pro显示
showRedisInfo: true

# 图表配置
chartsCfg:
  # 显示模式
  # true - 显示
  # false - 不显示
  # pro - pro显示
  show: true
  # 标题颜色
  titleColor: "#84A0DF"
  # 标题文字
  titleText: "Network"
  # 调色盘
  color:
    - "#2ec7c9"
    - "#b6a2de"

# 样式
style:
  # 远程背景图片api，设置为false则一直使用默认背景
  backdrop: "https://t.alcy.cc/mp"
  # 当api请求失败时使用的默认背景图，请放置在resources/state/img/bg目录下
  # random - 随机选择背景目录里的一张图片
  # default_bg.jpg 可直接指定bg目录里一张图片，注意请带上后缀名
  backdropDefault: "random"
  # Bot昵称的颜色
  # 支持渐变色请以gradient:开头 如 gradient:271.14deg,#001bff 0.98%,#00f0ff 25.79%,#fce84a 47.33%,#f34628 65.77%,#b275ff 91.4%
  BotNameColor: "#000"
  #主硬件进度条和磁盘进度条的颜色
  progressBarColor:
    high: "#d73403"
    medium: "#ffa500"
    low: "#84A0DF"
  # redis信息值颜色
  redisInfoValColor: "#485ab6"

*/

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
    /** 当api请求失败时使用的默认背景图，请放置在resources/state/img/bg目录下 */
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
        useProxy: false
      },
      {
        name: 'Google',
        url: 'https://google.com',
        useProxy: true
      }
    ],
    timeout: 5000,
    concurNum: 5
  },
  monitor: {
    open: true,
    getDataInterval: 60000,
    saveDataNumber: 60,
    statusPowerShellStart: false,
    openRedisSaveData: true
  },
  systemResources: ['CPU', 'RAM', 'SWAP', 'GPU'],
  processLoad: {
    show: 'pro'
  },
  closedChart: false,
  showFastFetch: 'default',
  showRedisInfo: 'true',
  chartsCfg: {
    show: true,
    titleColor: '#84A0DF',
    titleText: 'Network',
    color: ['#2ec7c9', '#b6a2de'],
    themeCfg: 'westeros'
  },
  style: {
    backdrop: 'https://t.alcy.cc/mp',
    backdropDefault: 'random',
    BotNameColor: '#000',
    progressBarColor: {
      high: '#d73403',
      medium: '#ffa500',
      low: '#84A0DF'
    },
    redisInfoValColor: '#485ab6'
  }
}
