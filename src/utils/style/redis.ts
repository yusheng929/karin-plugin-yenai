import moment from 'node-karin/moment'
import { logger, redis } from 'node-karin'

/**
 * 获取 Redis 信息
 * @param isPro 是否为pro
 * @returns
 */
export const getRedisInfo = async (isPro: boolean) => {
  const showRedisInfo: boolean | 'pro' = true
  if (!showRedisInfo) return false
  if (typeof showRedisInfo === 'string' && showRedisInfo === 'pro' && !isPro) return false

  try {
    if (typeof redis?.info !== 'function') return false
    const data = parseInfo(await redis.info())
    if (!data) return false

    return {
      uptime: moment(Number(data.Server.uptime_in_seconds) * 1000).format('dd天hh小时mm分'),
      used_memory_human: data.Memory.used_memory_human,
      used_memory_peak_human: data.Memory.used_memory_peak_human,
      used_memory_lua_human: data.Memory.used_memory_lua_human,
      connected_clients: data.Clients.connected_clients,
      total_connections_received: data.Stats.total_connections_received,
      total_commands_processed: data.Stats.total_commands_processed,
      Keyspace: data.Keyspace
    }
  } catch (error) {
    logger.error(error)
    return false
  }
}

const parseInfo = (info: Awaited<ReturnType<typeof redis.info>>) => {
  const sections: {
    Server: Record<string, string>
    Clients: Record<string, string>
    Memory: Record<string, string>
    Persistence: Record<string, string>
    Stats: Record<string, string>
    Replication: Record<string, string>
    CPU: Record<string, string>
    Modules: Record<string, string>
    Errorstats: Record<string, string>
    Cluster: Record<string, string>
    Keyspace: Record<string, Record<string, string>>
  } = {
    Server: {},
    Clients: {},
    Memory: {},
    Persistence: {},
    Stats: {},
    Replication: {},
    CPU: {},
    Modules: {},
    Errorstats: {},
    Cluster: {},
    Keyspace: {},
  }

  let currentSection: string | null = null

  info.split('\r\n').forEach((line) => {
    if (line.startsWith('#')) {
      currentSection = line.slice(1).trim()
      sections[currentSection as keyof typeof sections] = {}
    } else if (currentSection && line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim())
      if (currentSection === 'Keyspace') {
        sections[currentSection][key] = parseKeyspace(value)
      } else {
        sections[currentSection as keyof typeof sections][key] = value
      }
    }
  })
  return sections
}

/**
 * 解析 Keyspace 信息的函数
 * @param value
 * @returns `Keyspace: { db0: { keys: '29', expires: '1', avg_ttl: '43001050' } }`
 */
const parseKeyspace = (value: string) => {
  const keyValuePairs = value.split(',')
  const keyspaceData: Record<string, string> = {}

  keyValuePairs.forEach(pair => {
    const [key, val] = pair.split('=').map(s => s.trim())
    keyspaceData[key] = val
  })

  return keyspaceData
}
