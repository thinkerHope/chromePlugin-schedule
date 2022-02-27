


chrome.devtools.panels.create(
  'AISchedule', 'img/logo.png', 'html/mypanel.html',
  function (panel) { }
);
chrome.storage.local.get({ current: '' }, function (items) {
  if(!items.current){return}
  chrome.devtools.inspectedWindow.getResources(
    function (Resources) {
      for (let resource of Resources) {
         if (resource.url == chrome.runtime.getURL('/js/scheduleHtmlProvider.js')) {
             resource.setContent(items.current.provider_html)
         }
         if (resource.url == chrome.runtime.getURL('/js/scheduleHtmlParser.js')) {
             resource.setContent(items.current.parser)
         }
      }
      chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/scheduleHtmlParser.js'), 1, function (aaa) { })
      chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/scheduleHtmlProvider.js'), 1, function (aaa) { })
    }
  )
});