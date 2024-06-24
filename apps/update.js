/* eslint-disable import/no-unresolved */
import { common } from "../model/index.js"
let Update = null
try {
  Update = (await import("../../other/update.js").catch(e => null))?.update
  Update ||= (await import("../../system/apps/update.ts")).update
} catch (e) {
  logger.error("[yenai-plugin]未获取到更新js #椰奶更新 将无法使用")
}

export class YenaiUpdate extends plugin {
  constructor() {
    super({
      name: "椰奶更新插件",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: "^#*椰奶(插件)?(强制)?更新$",
          fnc: "update"
        }
      ]
    })
  }

  async update(e = this.e) {
    if (!common.checkPermission(e, "master")) return
    e.isMaster = true
    e.msg = `#${e.msg.includes("强制") ? "强制" : ""}更新yenai-plugin`
    const up = new Update(e)
    up.e = e
    return up.update()
  }
}
