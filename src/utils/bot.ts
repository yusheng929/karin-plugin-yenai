import { dirPath } from './dir'
import { getAllBotID, getBot } from 'node-karin'
import moment from 'node-karin/moment'

/**
 * 获取bot状态
 * @param selfId 当前bot的id
 * @param isPro 是否为pro
 * @returns
 */
export default async function getBotState (selfId: string, isPro: boolean) {
  /** bot的列表 */
  const list = isPro ? [selfId] : getAllBotID()

  const dataPromises = list.map(async (i) => {
    const bot = getBot(i)
    if (!bot) return false

    /** 状态 */
    const status = 11
    /** 昵称 */
    const nickname = bot.account.name
    // const { nickname = '未知', status = 11, apk, version } = bot

    // 头像
    const avatarUrl = await bot.getAvatarUrl(bot.selfId)
    const avatar = await getAvatarColor(avatarUrl)
    /** 适配器 */
    const platform = bot.adapter.name
    /** 消息 */
    const messageCount = await getMessageCount()
    /** 好友 */
    const countContacts = getCountContacts()
    /** 运行时间 */
    const botRunTime = moment(Date.now() / 1000 - bot.adapter.connectTime, 'dd天hh:mm:ss', true)
    /** 版本 */
    const botVersion = bot.adapter.version

    return {
      avatar,
      nickname,
      botRunTime,
      status,
      platform,
      botVersion,
      messageCount,
      countContacts
    }
  })

  return Promise.all(dataPromises).then(r => r.filter(Boolean))
}

async function getAvatarColor (url: string) {
  const defaultAvatar = `${dirPath}/resources/state/img/default_avatar.jpg`
  try {
    if (url === 'default') {
      url = defaultAvatar
    }
    // let avatar = await getImgPalette(url)
    return {
      path: url
    }
  } catch {
    return {
      path: url
    }
  }
}
async function getMessageCount () {
  return {
    /** 发送消息 */
    sent: 0,
    /** 接收消息 */
    recv: 0,
    /** 截图 */
    screenshot: 0
  }
}

function getCountContacts () {
  const friend = 0
  const group = 0
  const groupMember = 0
  return {
    friend,
    group,
    groupMember
  }
}
