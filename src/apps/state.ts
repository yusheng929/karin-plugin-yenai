import path from 'node:path'
import { plugin } from '@/utils/dir'
import { getData } from '@/utils/data'
import { karin, segment } from 'node-karin'

const join = (...paths: string[]) => path.join(...paths).replace(/\\/g, '/')

export const state = karin.command(/^#椰奶状态(pro)?$/i, async (ctx) => {
  const resPath = join(plugin.dir, 'resources/')
  const layoutPath = join(plugin.dir, 'resources/common/layout/')

  const { copyright, ...data } = await getData(ctx)
  const options = {
    ...data,
    _plugin: plugin.name,
    pluResPath: resPath,
    _res_path: resPath,
    _layout_path: layoutPath,
    _tpl_path: join(plugin.dir, 'resources/common/tpl/'),
    defaultLayout: join(layoutPath, 'default.html'),
    elemLayout: join(layoutPath, 'elem.html'),
    sys: {
      scale: scale(2),
      copyright
    },
  }

  const img = await karin.render({
    name: 'yenai-state',
    file: join(plugin.dir, 'resources/state/index.html'),
    data: options,
    pageGotoParams: {
      waitUntil: 'networkidle0'
    },
    quality: 100
  })

  ctx.reply(segment.image(`base64://${img}`))
})

const scale = (pct = 1) => {
  let scale = 1
  scale = Math.min(2, Math.max(0.5, scale / 100))
  pct = pct * scale
  return `style='transform:scale(${pct})'`
}
