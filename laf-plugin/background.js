// 申明全局变量
let tabsId;
let url = "";
// 监听快捷键
chrome.commands.onCommand.addListener((command) => {
  if (command === "addString") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      tabsId = tabs[0].id;
      chrome.scripting.executeScript(
        {
          target: { tabId: tabsId },
          func: () => {
            function getText() {
              const textarea = document.querySelector("textarea, input[type=text], [role=textbox]");
              const text = textarea.value;
              const cursorPosition = textarea.selectionStart;
              const startOfLine = text.lastIndexOf("\n", cursorPosition - 1) + 1;
              let endOfLine = text.indexOf("\n", cursorPosition);
              if (endOfLine == -1) {
                endOfLine = text.length;
              }
              const currentLine = text.substring(startOfLine, endOfLine);
              return currentLine;
            }
            return getText();
          },
        },
        handleText
      );
    });
  }
});

// 处理获取到的文本
function handleText(resultsArray) {
  let text = resultsArray[0].result;
  if (text.indexOf("//") != -1) {
    chrome.storage.sync.get(
      {
        option1: "",
      },
      function (items) {
        url = items.option1
        if (url == "") {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabsId },
              func: () => {
                let addText = '\n错误::::::请先配置laf助手插件的接口地址后再尝试!!!!';
                document.execCommand('insertText', false, addText);
              },
            },
            () => { }
          );
          return;
        }
        text = text.replace(/\/\//, "").replace(/\s*/g, "");
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: text }),
          })
          .then((response) => response.json())
          .then((data) => {
            let addText = `\n` + data.data
            chrome.scripting.executeScript(
              {
                target: { tabId: tabsId },
                args: [addText],
                func: (addText) => {
                  document.execCommand('insertText', false, addText);
                },
              },
              () => { }
            );
          })
          .catch((error) => console.error(error));
      }
    );
  }else{
    let addText = "\n请在注释行按快捷键"
    chrome.scripting.executeScript(
      {
        target: { tabId: tabsId },
        args: [addText],
        func: (addText) => {
          document.execCommand('insertText', false, addText);
        },
      },
      () => { }
    );
  }
}