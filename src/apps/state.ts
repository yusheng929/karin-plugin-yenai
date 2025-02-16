import path from 'node:path'
import { basename, dirPath, pkg } from '@/utils'
import { getData } from '@/utils/data'
import { karin, segment } from 'node-karin'

export const state = karin.command(/^#椰奶状态(pro)?$/i, async (ctx) => {
  const resPath = path.join(dirPath, 'resources/')
  const layoutPath = path.join(dirPath, 'resources/common/layout/')

  const data = await getData(ctx)
  const options = {
    ...data,
    _plugin: basename,
    pluResPath: resPath,
    _res_path: resPath,
    _layout_path: layoutPath,
    _tpl_path: path.join(dirPath, 'resources/common/tpl/'),
    defaultLayout: path.join(layoutPath, 'default.html'),
    elemLayout: path.join(layoutPath, 'elem.html'),
    // pageGotoParams: {
    //   waitUntil: 'networkidle0'
    // },
    sys: {
      scale: scale(2),
      copyright: `Created By karin <span class="version">${process.env.KARIN_VERSION}</span> & Yenai-Plugin<span class="version">v${pkg().version}</span>`
    },
    // quality: 100
  }

  const img = await karin.render({
    name: '椰奶状态',
    file: path.join(dirPath, 'resources/state/index.html'),
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
