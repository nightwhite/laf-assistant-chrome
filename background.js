var tabsId;
var url = "";

chrome.commands.onCommand.addListener(function (command) {
  if (command === "addString") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      tabsId = tabs[0].id;
      chrome.tabs.executeScript(
        tabsId,
        {
          code: `
                    function getText(){
                        var textarea = document.querySelector("textarea, input[type=text], [role=textbox]");
                        var text = textarea.value;
                        var cursorPosition = textarea.selectionStart;
                        var startOfLine = text.lastIndexOf("\\n", cursorPosition - 1) + 1;
                        var endOfLine = text.indexOf("\\n", cursorPosition);
                        if (endOfLine == -1) {
                        endOfLine = text.length;
                        }
                        var currentLine = text.substring(startOfLine, endOfLine);
                        return currentLine;
                    }
                    getText();
                `,
        },
        handleText
      );
    });
  }
});

//处理获取到的文本
function handleText(resultsArray) {
  console.log(url);
  let text = resultsArray[0];
  if (text.indexOf("//") != -1) {
    chrome.storage.sync.get(
      {
        option1: "",
      },
      function (items) {
        url = items.option1
      }
    );
  if(url == ""){
      chrome.tabs.executeScript(tabsId, {
          code: `var addText ='\\n错误::::::请先配置URL后再尝试!!!!';
                document.execCommand('insertText', false, addText); `,
        });
      return
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
        // console.log("获取成功",data)
        chrome.tabs.executeScript(tabsId, {
          code: `var addText ='\\n${data.data}';
                document.execCommand('insertText', false, addText); `,
        });
      })
      .catch((error) => console.error(error));
  }
}
