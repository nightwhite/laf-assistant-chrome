import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const { ChatGPTAPI } = await import('chatgpt')
  const text = ctx.body.text ? ctx.body.text : "请在注释所在行使用快捷键";
  let api = cloud.shared.get('api')
    if (!api) {
      api = new ChatGPTAPI({ 
        apiKey: cloud.env.CHAT_GPT_API_KEY,
        completionParams: {
          temperature: 0.5,
          top_p: 0.8,
          model: 'code-davinci-002'
        }
      })
      cloud.shared.set('api', api)
    }
  // 数据库相关
  const regexDB = /^数据库/;
  if (regexDB.test(text)) {
    // 这里需要把 api 对象放入 cloud.shared 不然无法追踪上下文
    let sendMessage = text + "/n如何写?/n回答需要按照文档https://gitcode.net/dcloud/unidocs-zh/-/raw/master/docs/uniCloud/cf-database.md中的写法;/nconst db = uniCloud.database(); 不用再定义一遍,/n默认已经引入了不用再写了,并且不需要对代码进行文字解释"
    let res = await api.sendMessage(sendMessage)
    console.log(`请求的内容是:${text},返回的结果是:${res.text}`);
    const regex = /```(?:js|javascript)?\n([\s\S]*?)\n```/
    const matches = res.text.match(regex)
    let content = matches[1] // 匹配到的内容
    content = content.replace("uniCloud", "cloud");
    console.log(content);
    return { data: content }
  }
  // cloud.fetch相关
  const regex = /(get|post|put)/i;
  if(text.includes("请求") && regex.test(text)){
    let sendMessage = `使用axios进行同步请求的方式去${text}，并打印返回结果中的data字段的核心代码,只需要核心代码`
    let res = await api.sendMessage(sendMessage)
    const tryBlockRegex = /try\s*{([\s\S]*?)}(?=\s*catch|\s*$)/;
    const match = tryBlockRegex.exec(res.text);
    console.log(match)
    let tryBlockContent = match[1].replace(/^\s*\n/, '').replace(/^[ \t]+/mg, '');
    tryBlockContent = tryBlockContent.replace("axios", "cloud.fetch");
    console.log(`请求的内容是:${text},返回的结果是:${res.text}`);
    return { data: tryBlockContent }
  }
  if(text.includes("调用云函数")){
    const regex = /调用云函数(\w+)(?:,参数(.*))?/;
    const match = text.match(regex);
    if (match) {
      const functionName = match[1];
      const paramsText = match[2];
      const paramsObject = paramsText ? Object.fromEntries(paramsText.split(',').map(param => param.split('='))) : {};
      const paramsJson = JSON.stringify(paramsObject);
      console.log(`Function name: ${functionName}`);
      console.log(`Params JSON: ${paramsJson}`);
      return {
        data:  `let res = await cloud.invoke("${functionName}", {body:${paramsJson}})`
      }
    } else {
      console.log('No match found.');
      return { data: "请按照要求写注释 (参数可不填,参数用,分割且后续不要加别的内容),如:调用云函数[函数名],参数name=张三,age=10" }
    }
  }
  //匹配JS开头的
  const regexJS = /^JS/i;
  if (regexJS.test(text)) {
    let res = await api.sendMessage(text)
    console.log(`请求的内容是:${text},返回的结果是:${res.text}`);
    const regex = /```(?:js|javascript)?\n([\s\S]*?)\n```/
    const matches = res.text.match(regex)
    let content = matches[1] // 匹配到的内容
    return { data: content }
  }
  if (text == "请在注释所在行末使用快捷键") {
    return { data: text }
  }
}