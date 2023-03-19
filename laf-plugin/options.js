// 获取DOM元素
const option1Input = document.getElementById("option1");
const saveBtn = document.getElementById("saveBtn");

// 获取已保存的选项值并设置为input的初始值
chrome.storage.sync.get(
  {
    option1: "",
  },
  (items) => {
    option1Input.value = items.option1;
  }
);

// 监听保存按钮的点击事件
saveBtn.addEventListener("click", () => {
  const option1Value = option1Input.value;
  chrome.storage.sync.set(
    {
      option1: option1Value,
    },
    () => {
      alert("保存成功");
    }
  );
});
