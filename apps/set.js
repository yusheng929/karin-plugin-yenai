import plugin from '../../../lib/plugins/plugin.js'
import fs from "fs";
import lodash from "lodash";
import Common from "../components/Common.js";


export class NewConfig extends plugin {
    constructor() {
        super({
            name: '修改配置',
            dsc: '配置文件',
            event: 'message',
            priority: 2000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?椰奶设置(.*)(开启|关闭)$',
                    /** 执行方法 */
                    fnc: 'Config_manage'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?椰奶设置删除缓存时间(.*)$',
                    /** 执行方法 */
                    fnc: 'Config_deltime'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?通知设置$',
                    /** 执行方法 */
                    fnc: 'SeeConfig'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?椰奶设置$',
                    /** 执行方法 */
                    fnc: 'yenaiset'
                },
            ]
        })
    }

    // 更改配置
    async Config_manage(e) {
        if (!e.isMaster) return
        // 解析消息
        let index = e.msg.replace(/#|椰奶设置|开启|关闭/g, "")
        console.log(index);
        if (!configs.hasOwnProperty(index)) return
        // 开启还是关闭
        if (/开启/.test(e.msg)) {
            await redis.set(`yenai:notice:${configs[index]}`, "1")
        } else {
            await redis.del(`yenai:notice:${configs[index]}`)
        }
        this.yenaiset(e)
        return
    }

    // 设置删除缓存时间
    async Config_deltime(e) {
        if (!e.isMaster) return

        let time = e.msg.replace(/#|椰奶设置删除缓存时间/g, '').trim()

        time = time.match(/\d+/g)

        if (!time) return e.reply('❎ 请输入正确的时间(单位s)')

        if (time < 120) return e.reply('❎ 时间不能小于两分钟')
        console.log(time);
        await redis.set(`yenai:notice:deltime`, String(time[0]))
        console.log(await redis.get(`yenai:notice:deltime`));
        this.yenaiset(e)
    }

    async yenaiset(e) {
        if (!e.isMaster) return

        let config = {}
        for (let i in configs) {
            let res = await redis.get(`yenai:notice:${configs[i]}`)
            config[configs[i]] = res
        }

        let cfg = {
            //好友消息
            privateMessage: getStatus(config.privateMessage),
            //群消息
            groupMessage: getStatus(config.groupMessage),
            //群临时消息
            grouptemporaryMessage: getStatus(config.grouptemporaryMessage),
            //群撤回
            groupRecall: getStatus(config.groupRecall),
            //好友撤回
            PrivateRecall: getStatus(config.PrivateRecall),
            //好友申请
            friendRequest: getStatus(config.friendRequest),
            //群邀请
            groupInviteRequest: getStatus(config.groupInviteRequest),
            //群管理变动
            groupAdminChange: getStatus(config.groupAdminChange),
            //好友列表变动
            friendNumberChange: getStatus(config.friendNumberChange),
            //群聊列表变动
            groupNumberChange: getStatus(config.groupNumberChange),
            //群成员变动
            groupMemberNumberChange: getStatus(config.groupMemberNumberChange),
            //闪照
            flashPhoto: getStatus(config.flashPhoto),
            //禁言
            botBeenBanned: getStatus(config.botBeenBanned),
            //全部通知
            notificationsAll: getStatus(config.notificationsAll),
            //删除缓存时间
            deltime: Number(config.deltime),
            bg: await rodom(), //获取底图
        }
        //渲染图像
        return await Common.render("admin/index", {
            ...cfg,
        }, {
            e,
            scale: 1.4
        });
    }
}
const rodom = async function () {
    var image = fs.readdirSync(`./plugins/yenai-plugin/resources/admin/imgs/bg`);
    var list_img = [];
    for (let val of image) {
        list_img.push(val)
    }
    var imgs = list_img.length == 1 ? list_img[0] : list_img[lodash.random(0, list_img.length - 1)];
    return imgs;
}

const getStatus = function (rote) {
    if (rote) {
        return `<div class="cfg-status" >已开启</div>`;
    } else {
        return `<div class="cfg-status status-off">已关闭</div>`;
    }

}

const configs = {
    好友消息: "privateMessage",
    群消息: "groupMessage",
    群临时消息: "grouptemporaryMessage",
    群撤回: "groupRecall",
    好友撤回: "PrivateRecall",
    // 申请通知
    好友申请: "friendRequest",
    群邀请: "groupInviteRequest",
    // 信息变动
    群管理变动: "groupAdminChange",
    // 列表变动
    好友列表变动: "friendNumberChange",
    群聊列表变动: "groupNumberChange",
    群成员变动: "groupMemberNumberChange",
    // 其他通知
    闪照: "flashPhoto",
    禁言: "botBeenBanned",
    全部通知: "notificationsAll",
    删除缓存: "deltime"
}