import { Context } from 'koishi'
import http from 'http'

export const name = 'rw-ip'
export function apply(ctx: Context) {
  ctx.on('message', (session) => {
    const content = session.content
    const regex = /(\b(?:\d{1,3}\.){3}\d{1,3}\:\d+\b)|(\b((\w+\.)+\w+)\:\d+\b)/g;
    const matches = content.match(regex)
    if (matches) {
      for (const match of matches) {
        const apiUrl = `http://api.der.kim:8080/api/get/rwping?ip=${match}`
        http.get(apiUrl, (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })
          res.on('end', () => {
            try {
              const responseData = JSON.parse(data)
              if (responseData.Result) {
                const decodedResult = Buffer.from(responseData.Result, 'base64').toString('utf8')
                const decodedContent = JSON.parse(decodedResult)
                let mapName = decodedContent['MapName'] || '未知地图'
                const gameName = decodedContent['AutoGameName'] || '铁锈-未知版本'
                const multiplier = decodedContent['Income'] || 1.0
                const noNukes = decodedContent['NoNukes'] || false
                const mist = decodedContent['Mist'] || '未知迷雾'
                const initUnit = decodedContent['InitUnit'] || '未知单位'
                const playerCount = `${(decodedContent['PlayerCount'] || 0) - 1}/10`
                const delay = `${decodedContent['PrPing'] || 0}/${decodedContent['ConnectPing'] || 0} 毫秒`
                const mod = decodedContent['UnitData'] || '默认'
                const id = match
                const gameVersion = '未知版本'
                const replyMessage = `自动识别: ${gameName}\n地图名称: ${mapName}\n倍率: ${multiplier}\n禁核: ${noNukes}\n迷雾: ${mist}\n默认单位: ${initUnit}\n人数: ${playerCount}\n延迟/内部处理时间: ${delay}\n使用Mod: ${mod}\nID: ${id}\n游戏版本: ${gameVersion}`
                session.send(replyMessage)
              } else {
                console.error('API响应中缺少Result字段:', responseData)
              }
            } catch (error) {
              console.error('解析 API 响应时出错:', error)
            }
          })
        }).on('error', (error) => {
          console.error('获取 API 数据时出错:', error)
        })
      }
    }
  })
}