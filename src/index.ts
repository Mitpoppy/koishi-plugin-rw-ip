import { Context } from 'koishi'

export const name = 'rw-ip'
export function apply(ctx: Context) {
  ctx.on('message', async (session) => {
    const content = session.content
    const regex = /(\b(?:\d{1,3}\.){3}\d{1,3}\:\d+\b)|(\b((\w+\.)+\w+)\:\d+\b)/g;
    const matches = content.match(regex)

    if (matches) {
      for (const match of matches) {
        try {
          const apiUrl = `http://api.der.kim:8080/api/get/rwping?ip=${match}`
          const response = await ctx.http.get(apiUrl, { timeout: 10000 })

          const data = JSON.parse(Buffer.from(response).toString('utf-8')) // 将ArrayBuffer转换为字符串并解析为JSON对象
          
          if (data.State === 0) {
            const decodedResult = JSON.parse(Buffer.from(data.Result, 'base64').toString('utf8'));
            let mapName = decodedResult.MapName || '未知地图';
            const gameName = decodedResult['AutoGameName'] || '铁锈-未知版本'
            const multiplier = decodedResult['Income'] || 1.0
            const noNukes = decodedResult['NoNukes'] || false
            const mist = decodedResult['Mist'] || '未知迷雾'
            const initUnit = decodedResult['InitUnit'] || '未知单位'
            const playerCount = `${(decodedResult['PlayerCount'] || 0) - 1}/10`
            const delay = `${decodedResult['PrPing'] || 0}/${decodedResult['ConnectPing'] || 0} 毫秒`
            const mod = decodedResult['UnitData'] || '默认'
            const id = match
            const gameVersion = '未知版本'
            const replyMessage = `自动识别: ${gameName}\n地图名称: ${mapName}\n倍率: ${multiplier}\n禁核: ${noNukes}\n迷雾: ${mist}\n默认单位: ${initUnit}\n人数: ${playerCount}\n延迟/内部处理时间: ${delay}\n使用Mod: ${mod}\nID: ${id}\n游戏版本: ${gameVersion}`
            session.send(replyMessage)
          } else {
            console.error('API响应中出现错误:', data)
          }
        } catch (error) {
          console.error('获取或解析 API 数据时出错:', error)
        }
      }
    }
  })
}
