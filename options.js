document.addEventListener('DOMContentLoaded', function() {
  var option1Input = document.getElementById('option1');
  var saveBtn = document.getElementById('saveBtn');

  chrome.storage.sync.get({
    'option1': "",
  }, function(items) {
    option1Input.value = items.option1;
  });

  saveBtn.addEventListener('click', function() {
    var option1Value = option1Input.value;
    chrome.storage.sync.set({
      'option1': option1Value
    }, function() {
      alert('保存成功');
    });
  });
});