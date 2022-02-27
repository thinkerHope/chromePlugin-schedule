chrome.storage.local.clear(function(aaa){console.log(aaa)})
var port = chrome.runtime.connect({ name: 'devtools' });
let mode = 'self'
//定义一个全局变量来储存模式
//切换按钮 点击事件：清空本次缓存, fetch新数据,更改provider文案
//选中详情按钮 点击事件 ：填充html到provider ，  暂存html到缓存
//点击provider区域  弹出html    点击parser 跳到sources
//点击运行，直接执行parser

$('#mode span').on('click', function () {
    if (mode == 'self') {
        $('#mode span').text('外校模式')
        mode = 'else'
        $('#provider_html').text('html')
        port.postMessage({
            name: 'mode',
            mode: 'else',
            tabId: chrome.devtools.inspectedWindow.tabId,

        });
    } else {
        $('#mode span').text('本校模式')
        mode = 'self'
        $('#provider_html').text('provider')
        port.postMessage({
            name: 'mode',
            mode: 'self',
            tabId: chrome.devtools.inspectedWindow.tabId,

        });

    }
    chrome.storage.local.set({ html: '' }, function (items1) {
        chrome.storage.local.set({ current: '' }, function (items2) {
            port.postMessage({
                name: 'data',
                tabId: chrome.devtools.inspectedWindow.tabId,
                mode
            });
        })
    })
})

chrome.storage.local.get({ noGuide: '' }, function (aaa) {
    if (!aaa.noGuide) {
        const driver = new Driver({
            doneBtnText: '完成',
            closeBtnText: '不再显示引导',            // Text on the close button for this step
            stageBackground: '#ffffff',       // Background color for the staged behind highlighted element
            opacity: 0.4,
            allowClose: false,
            nextBtnText: '下一步',              // Next button text for this step
            prevBtnText: '上一步',
        });
        driver.defineSteps([
            {
                element: '#add',
                popover: {
                    className: 'first-step-popover-class',
                    title: '1.新建',
                    description: '点此新建学校',
                    position: 'right'
                }
            },
            {
                element: '#bottom',
                popover: {
                    title: '2.列表',
                    description: '此处显示您适配的教务系统列表',
                    position: 'right'
                }
            },
            {
                element: '#upp',
                popover: {
                    title: '3.适配项',
                    description: '点此切换适配项',
                    position: 'bottom'
                }
            },
            {
                element: '#pre',
                popover: {
                    title: '4.函数',
                    description: '点此此处开始编写函数',
                    position: 'left'
                }
            },
            {
                element: '#shade',
                popover: {
                    title: '5.运行',
                    description: '<--主页面处右键选择运行即可运行函数，上传即可上传函数',
                    position: 'right'
                }
            },
        ]);

        // Start the introduction
        driver.start();
        $(document).on('click', '.driver-close-btn', function () {
            console.log('nima')
            chrome.storage.local.set({ noGuide: 1 }, function () {
                console.log('不再显示引导');
            });
        })
    }
})

// 与后台页面消息通信-长连接
// chrome.devtools.network.onRequestFinished.addListener(function () {
//
// })
let filter = ''
let modifyUrlSchoolInfo = ''
//取数据放进去
$('#bar').text(`Aischedule Devtools`)
port.postMessage({
    name: 'fetchMode',
    tabId: chrome.devtools.inspectedWindow.tabId
});

setInterval(function () {
    try {
        port.postMessage({
            name: 'userId',
            tabId: chrome.devtools.inspectedWindow.tabId
        });
    } catch (err) {
        console.error(err)
    }
}, 1000)
port.postMessage({
    name: 'update',
    tabId: chrome.devtools.inspectedWindow.tabId
});
refreshCurrent()

// 监听后台页面消息
port.onMessage.addListener((message) => {
    if (message.name == 'schools') {
        $('.selectpicker').empty()
        $('.selectpicker').append("<option value='请选择学校' style='display: none'>请选择学校</option>");
        message.msg.forEach(function (item,) {
            $('.selectpicker').append("<option value=" + item.school_name + ">" + item.school_name + "</option>");
        })

        $('.selectpicker').selectpicker('refresh')
        $('.selectpicker').selectpicker('render')
    };
    if (message.name == 'tbs') {
        $('#bottom').empty()
        chrome.storage.local.get({ current: '' }, function (items) {
            console.log('message.myTbs')
            console.log(message.myTbs)
            refreshListAndLighting(message.myTbs, items.current, filter)
        })
    }
    if (message.name == 'html') {
        $('#pre').html(message.myTbs)
        console.log(message.myTbs)
        chrome.storage.local.set({ html: message.myTbs }, function (items) {
        })
    }
    if (message.name == 'fetchMode') {
        let currentMode = message.mode
        if (currentMode == 'else') {
            $('#mode span').text('外校模式')
            mode = 'else'
            $('#provider_html').text('html')
            port.postMessage({
                name: 'mode',
                mode: 'else',
                tabId: chrome.devtools.inspectedWindow.tabId,

            });
        } else {
            $('#mode span').text('本校模式')
            mode = 'self'
            $('#provider_html').text('provider')
            port.postMessage({
                name: 'mode',
                mode: 'self',
                tabId: chrome.devtools.inspectedWindow.tabId,

            });

        }
        chrome.storage.local.set({ html: '' }, function (items1) {
            chrome.storage.local.set({ current: '' }, function (items2) {
                port.postMessage({
                    name: 'data',
                    tabId: chrome.devtools.inspectedWindow.tabId,
                    mode
                });
            })
        })
    }
    if (message.name == 'newVersion') {
        $('#update').css('display', 'flex')

    }
    if (message.name == 'userId') {
        $('#login button').text(message.msg)
        if (message.msg == 'login') { $('#login img').attr('src', '../img/icon_user_not_login.png') } else { $('#login img').attr('src', '../img/icon_user_login.png') }
    }
    if (message.name == 'onunload') {
        console.log('onunload')
        chrome.storage.local.get({ current: '' }, function (items) {
            if (!items.current) {
                return
            }
            chrome.devtools.inspectedWindow.getResources(function (Resources) {
                for (let resource of Resources) {
                    if (resource.url == chrome.runtime.getURL('/js/scheduleHtmlProvider.js')) {
                        resource.setContent(items.current.provider_html)
                    }
                    if (resource.url == chrome.runtime.getURL('/js/scheduleHtmlParser.js')) {
                        resource.setContent(items.current.parser)
                    }
                    // if (resource.url == chrome.runtime.getURL('/js/schoolUrl.js')) {
                    //     resource.setContent(items.current.url)
                    // }
                }
                chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/scheduleHtmlParser.js'), 1, function (aaa) { })
                // chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/schoolUrl.js'), 1, function (aaa) { console.log(aaa) })
                chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/scheduleHtmlProvider.js'), 1, function (aaa) { })

            })
        });
    }
})

//事件监听
document.getElementById('login').addEventListener('click', function () {
    // 往后台页面发送消息
    port.postMessage({
        name: 'login',
        tabId: chrome.devtools.inspectedWindow.tabId
    });
});

document.getElementById('dragger').ondrag = function (a, b, c) {
    if (a.pageX != 0 && a.pageX / document.body.clientWidth * 100 < 70) {
        document.getElementById('left').style.flex = '0 0 ' + a.pageX / document.body.clientWidth * 100 + '%'
    }
}

document.getElementById('inputEAS').addEventListener('keyup', function (value) {
    let tmp = this.value
    $('#inputEAS').css('box-shadow', '0 0  rgb(230, 56, 56)')

    chrome.storage.local.set({ eas: tmp }, function () {
        console.log('保存成功！!');
    });
});
document.getElementById('inputURL').addEventListener('keyup', function (value) {
    let tmp = this.value
    $('#inputURL').css('box-shadow', '0 0 rgb(230, 56, 56)')

    chrome.storage.local.set({ url: tmp }, function () {
        console.log('保存成功！!');
    });
});
document.getElementById('add').addEventListener('click', function (e) {
    e.stopPropagation()
    $('#modal').css('display', 'flex')
});
document.getElementById('cancel').addEventListener('click', function (e) {
    e.stopPropagation()
    $('#modal').css('display', 'none')
    $('.selectpicker').selectpicker('val', ['noneSelectedText'])
    $(".selectpicker").selectpicker('refresh')
    $('#inputEAS').val('')
    $('#inputURL').val('')
    chrome.storage.local.set({ eas: '' }, function () { });
    chrome.storage.local.set({ url: '' }, function () { });
    chrome.storage.local.set({ school: '' }, function () { });
    $('.bootstrap-select').css('box-shadow', '0 0  rgb(230, 56, 56)')
    $('#inputURL').css('box-shadow', '0 0  rgb(230, 56, 56)')
    $('#inputEAS').css('box-shadow', '0 0  rgb(230, 56, 56)')

});
// $(document).mouseup(function (e) {
//     var _con = $('.modal');   // 设置目标区域
//     if (!_con.is(e.target) && _con.has(e.target).length === 0) {
//         $('.inputSchool').css('display', 'none')
//         $('.selectpicker').selectpicker('val', ['noneSelectedText'])
//         $(".selectpicker").selectpicker('refresh')
//         $('#inputEAS').val('')
//         $('#inputURL').val('')
//     }
// });
let b
$('.top input').on('keyup', function (e) {
    filter = e.target.value
    clearTimeout(b)
    b = setTimeout(function () {
        port.postMessage({
            name: 'data', mode,
            tabId: chrome.devtools.inspectedWindow.tabId
        });
    }, 500)

})
$('.selectpicker').on('show.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    $('.bootstrap-select').css('box-shadow', '0 0 rgb(230, 56, 56)')

    let a
    $('.bs-searchbox').children('input').keyup(function (value) {
        let tmp = this.value
        if (tmp === '') {
            tmp = '北京'
        }
        clearTimeout(a)
        a = setTimeout(function () {
            port.postMessage({
                name: 'fetchSchool',
                tabId: chrome.devtools.inspectedWindow.tabId,
                msg: tmp
            });
        }, 500)
    })
});
$('.selectpicker').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    chrome.storage.local.set({ school: e.target.value }, function () {
        console.log('保存学校成功：' + e.target.value);
    });
});
$('#upp>button').on('click', function (e) {
    $('#upp>button').css('border-bottom', '0px solid rgb(37, 159, 255)')
    $('#upp>button').css("padding", "0px 20px 10px 20px;")
    $(`#${e.currentTarget.id}`).css('border-bottom', '3px solid rgb(37, 159, 255)')
    console.log(e.currentTarget.id)
    $(`#${e.currentTarget.id}`).css("padding", "0px 20px 7px 20px;")
    chrome.storage.local.get({ current: '' }, function (items) {
        chrome.storage.local.get({ html: '' }, function (html) {
            if (e.currentTarget.id == 'provider_html' && mode == 'else') {
                $('#pre').html(html.html)

            } else {

                $('#pre').text(items.current[e.currentTarget.id] ? items.current[e.currentTarget.id] : '')
            }
        })
    })
})


// 点击代码区,跳转sources
$('#pre').on('click', function (a) {
    if (window.getSelection().type == 'Range') {
        return
    }
    //找到resources中的两个文件，找到存储中的两个函数，替换掉
    chrome.storage.local.get({ current: '' }, function (items) {
        chrome.devtools.inspectedWindow.getResources(function (Resources) {
            for (let resource of Resources) {
                if (resource.url == chrome.runtime.getURL('/js/scheduleHtmlProvider.js')) {
                    resource.setContent(items.current.provider_html)
                }
                if (resource.url == chrome.runtime.getURL('/js/scheduleHtmlParser.js')) {
                    resource.setContent(items.current.parser)
                }
                // if (resource.url == chrome.runtime.getURL('/js/schoolUrl.js')) {
                //     resource.setContent(items.current.url)
                // }
            }
            if (mode == 'else') {
                chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/scheduleHtmlParser.js'), 1, function (aaa) { })

                chrome.storage.local.get({ html: '' }, function (items) {
                    win = window.open('', 'provider', 'scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes');  //打开新的空白窗口
                    win.document.write(`<body>${items.html}</body>`);
                    win.document.close()
                })

            } else {

                if ($('#parser').css('border-bottom') == '3px solid rgb(37, 159, 255)') {
                    // if ($('#parser').css('border-bottom-style') == 'solid') {

                    chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/scheduleHtmlProvider.js'), 1, function (aaa) { })
                    // chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/schoolUrl.js'), 1, function (aaa) { console.log(aaa) })
                    chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/scheduleHtmlParser.js'), 1, function (aaa) { })
                } else {
                    chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/scheduleHtmlParser.js'), 1, function (aaa) { })
                    // chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/schoolUrl.js'), 1, function (aaa) { console.log(aaa) })
                    chrome.devtools.panels.openResource(chrome.runtime.getURL('/js/scheduleHtmlProvider.js'), 1, function (aaa) { })

                }
            }
        })
    });



});

//开发者点击ctrl+s之后，替换掉对应学校本地存储中的代码
chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function (resource, content) {
    //找到现在的学校，从resource.url中取到对应文件名，用content覆盖文件
    chrome.storage.local.get({ current: '' }, function (items) {
        if (!items.current) { console.log('请先新建学校'); return }
        if (resource.url == chrome.runtime.getURL('/js/scheduleHtmlProvider.js')) {
            items.current.provider_html = content
        }
        if (resource.url == chrome.runtime.getURL('/js/scheduleHtmlParser.js')) {
            items.current.parser = content
        }
        chrome.storage.local.get({ html: '' }, function (html) {
            items.current.html = html.html
            chrome.storage.local.get({ [items.current.school.school_name + '-' + items.current.eas]: '' }, function (items1) {
                console.log(items1)
                if (items1[items.current.school.school_name + '-' + items.current.eas]) {
                    chrome.storage.local.set({ [items.current.school.school_name + '-' + items.current.eas]: items.current })
                    setCurrentAndRefreshFun({ school: items.current.school.school_name, eas: items.current.eas, url: items.current.url, provider_html: items.current.provider_html, parser: items.current.parser })
                    port.postMessage({
                        name: 'data', mode,
                        tabId: chrome.devtools.inspectedWindow.tabId
                    });
                } else {
                    addProject({ school: items.current.school.school_name, eas: items.current.eas, url: items.current.url, provider_html: items.current.provider_html, parser: items.current.parser })
                    setCurrentAndRefreshFun({ school: items.current.school.school_name, eas: items.current.eas, url: items.current.url, provider_html: items.current.provider_html, parser: items.current.parser })
                    port.postMessage({
                        name: 'data', mode,
                        tabId: chrome.devtools.inspectedWindow.tabId
                    });
                }
            })
        })
    })
})

//开发者新建学校
document.getElementById('confirm').addEventListener('click', function (a) {
    chrome.storage.local.get({ school: '' }, function (items3) {
        console.log(items3.school)
        if (!items3.school) {
            $('.bootstrap-select').css('box-shadow', '0 0 8px rgb(230, 56, 56)')
            return
        }
        chrome.storage.local.get({ eas: '' }, function (items1) {
            console.log(items1.eas)
            if (!items1.eas) {
                $('#inputEAS').css('box-shadow', '0 0 8px rgb(230, 56, 56)')
                return
            }
            chrome.storage.local.get({ url: '' }, function (items2) {
                console.log(items2.url)

                if (!items2.url || ! /http(s)?:xxx/is.test(items2.url)) {
                    $('#inputURL').css('box-shadow', '0 0 8px rgb(230, 56, 56)')
                    return
                }
                if (!items1.eas && !items2.url && !items3.school) {
                    return
                }
                $('#modal').css('display', 'none')
                chrome.storage.local.get({ [items3.school + '-' + items1.eas]: '' }, function (items) {
                    if (items[items3.school + '-' + items1.eas]) {
                        alert('您已创建过此学校')
                    } else {
                        let json = {
                            school: items3.school, eas: items1.eas, url: items2.url,
                            provider_html:
                                `function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
                                        //除函数名外都可编辑
                                        //以下为示例，您可以完全重写或在此基础上更改

                                    const ifrs = dom.getElementsByTagName("iframe");
                                    const frs = dom.getElementsByTagName("frame");

                                    if (ifrs.length) {
                                        for (let i = 0; i < ifrs.length; i++) {
                                            const dom = ifrs[i].contentWindow.document;
                                            iframeContent += scheduleHtmlProvider(iframeContent, frameContent, dom);
                                            }
                                    }
                                    if (frs.length) {
                                        for (let i = 0; i < frs.length; i++) {
                                            const dom = frs[i].contentDocument.body.parentElement;
                                            frameContent += scheduleHtmlProvider(iframeContent, frameContent, dom);
                                            }
                                    }
                                    if(!ifrs.length && !frs.length){
                                        return dom.querySelector('body').outerHTML
                                    }
                                    return dom.getElementsByTagName('html')[0].innerHTML + iframeContent+frameContent
                                    }`,
                            parser:
                                `function scheduleHtmlParser(html) {
                                  //除函数名外都可编辑
                                  //传入的参数为上一步函数获取到的html
                                  //可使用正则匹配
                                  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
                                  //以下为示例，您可以完全重写或在此基础上更改
                                  let result = []
                                  let bbb = $('#table1 .timetable_con')
                                  for (let u = 0; u < bbb.length; u++) {
                                      let re = { sections: [], weeks: [] }
                                      let aaa = $(bbb[u]).find('span')
                                      let week = $(bbb[u]).parent('td')[0].attribs.id
                                      if (week) {
                                          re.day = week.split('-')[0]
                                      }
                                      for (let i = 0; i < aaa.length; i++) {

                                          if (aaa[i].attribs.title == '上课地点') {

                                              for (let j = 0; j < $(aaa[i]).next()[0].children.length; j++) {
                                                  re.position = $(aaa[i]).next()[0].children[j].data
                                              }
                                          }
                                          if (aaa[i].attribs.title == '节/周') {

                                              for (let j = 0; j < $(aaa[i]).next()[0].children.length; j++) {

                                                  let lesson = $(aaa[i]).next()[0].children[j].data
                                                  for (let a = Number(lesson.split(')')[0].split('(')[1].split('-')[0]); a < Number(lesson.split(')')[0].split('(')[1].split('-')[1].split('节')[0]) + 1; a++) {

                                                      re.sections.push({ section: a })
                                                  }
                                                  for (let a = Number(lesson.split(')')[1].split('-')[0]); a < Number(lesson.split(')')[1].split('-')[1].split('周')[0]) + 1; a++) {

                                                      re.weeks.push(a)
                                                  }
                                              }
                                          }

                                          if (aaa[i].attribs.title == '教师') {

                                              for (let j = 0; j < $(aaa[i]).next()[0].children.length; j++) {
                                                  re.teacher = $(aaa[i]).next()[0].children[j].data
                                              }
                                          }

                                          if (aaa[i].attribs.class == 'title') {

                                              for (let j = 0; j < $(aaa[i]).children()[0].children.length; j++) {
                                                  re.name = $(aaa[i]).children()[0].children[j].data

                                              }
                                          }

                                      }
                                      result.push(re)
                                  }
                                  console.log(result)

                                  return { courseInfos: result }
                              }`
                        }
                        addProject(json)
                        port.postMessage({
                            name: 'data', mode,
                            tabId: chrome.devtools.inspectedWindow.tabId
                        });
                        setCurrentAndRefreshFun(json)
                        chrome.storage.local.set({ school: '' }, function () {
                            chrome.storage.local.set({ eas: '' }, function () {
                                chrome.storage.local.set({ url: '' }, function () {
                                });
                                $('.selectpicker').selectpicker('val', ['noneSelectedText'])
                                $(".selectpicker").selectpicker('refresh')
                                $('#inputEAS').val('')
                                $('#inputURL').val('')
                            });
                        });
                    }
                })
            });
        });
    });
});

function addProject({ school = '', eas = '', url = '', provider_html = '', parser = '', updatedAt = Date.now(), id = `本地` }) {

    let json = {
        school: {
            school_name: school
        },
        id,
        updatedAt,
        eas: eas,
        url: url, provider_html, parser
    }
    chrome.storage.local.get({ list: [] }, function (items) {
        items.list.push(school + '-' + eas)
        chrome.storage.local.set({ list: items.list }, function () {
            chrome.storage.local.set({ [school + '-' + eas]: json }, function () {

            });
        });
    })
}

function setCurrentAndRefreshFun({ school = '', eas = '', url = '', provider_html = '', parser = '', updatedAt = Date.now(), id = `本地` }) {
    $('.detail').css('background-color', 'rgba(0,12,23,1)')
    $(`#d-${id}`).css('background-color', 'rgba(20,50,83,1)')
    let json = {
        school: {
            school_name: school
        },
        id,
        updatedAt,
        eas: eas,
        url: url, provider_html, parser
    }
    chrome.storage.local.set({ 'current': json }, function () {
        console.log('保存成功！!');
    });
    $('.fun pre').text(provider_html)
    $('#version').text(`版本号: ${id}   `)
    $('#date').text('日期：' + new Date(updatedAt).getFullYear() + '/' + (new Date(updatedAt).getMonth() + 1) + '/' + new Date(updatedAt).getDate())
}

function refreshListAndLighting(items, lighting, filter) {
    let stats = ["E2E自测", "审核中", "已上线", "已上线", '未通过', '', '离线任务']
    let color = ["gray", 'yellow', 'blue', 'green', 'red']
    chrome.storage.local.get({ list: [] }, function (list) {
        let j = 0
        let tmp = []
        items.forEach(function (item) {
            tmp.push(item.school.school_name + '-' + item.eas)
        })
        list.list.forEach(function (i) {
            chrome.storage.local.get({ [i]: '' }, function (school_info) {
                if (mode == 'self') {
                    i.html ? {} : items.push(school_info[i])
                } else {
                    tmp.indexOf(i) > -1 ? items.push(school_info[i]) : {}
                }
                j++
                if (j == list.list.length) {
                    renderList(items)
                }
            })
        })
        if (list.list.length == 0) {
            renderList(items)
        }
        function renderList(items) {

            let aaa = {}
            items.forEach(function (item) {
                if (!filter || new RegExp(filter, 'gi').test(item.school.school_name)) {
                    if (aaa[item.school.school_name + item.eas]) {
                        aaa[item.school.school_name + item.eas].push(item)
                    }
                    else {
                        aaa[item.school.school_name + item.eas] = []
                        aaa[item.school.school_name + item.eas].push(item)

                    }
                }

            })
            filter = null
            Object.keys(aaa).forEach(function (a) {
                let str = ''
                let hehe = 0
                aaa[a].forEach(function (item) {
                    if (lighting && lighting.school && lighting.school.school_name == item.school.school_name && lighting.eas == item.eas) { hehe = 1 }
                    str += `<div class='detail ${item.school.school_name + item.eas}' id= 'd-${item.school.school_name + item.eas + item.id}' style='${lighting && lighting.school && lighting.school.school_name == item.school.school_name && lighting.eas == item.eas ? (lighting.id == item.id ? 'display:flex; background: #143253;color: #FFFFFF;' : 'display:flex;color:rgba(255,255,255,0.65);') : 'display:none ;'}cursor: pointer; flex-direction : row;justify-content: space-between;margin-bottom:2px;height:2.86rem;padding-left:2.57rem;font-size: 10px;flex:none'>
                                 <div class='item' style:'font-size: 10px;'>${item.id ? item.id : '本地'}版本</div>
                                 <div style='width:0.43rem;height:0.43rem;background:white;border-radius:0.43rem;margin-right:0.57rem;background-color:${color[item.status] ? color[item.status] : 'white'}'></div>

                                 <div style='margin-right:1.14rem;font-size: 10px;width:5rem;'>${stats[item.status] ? stats[item.status] : '待开发'}</div>
                             </div>`})
                $('#bottom').append(`<div class='summary' id = ${aaa[a][0].school.school_name + aaa[a][0].eas} style='${hehe ? 'color: rgba(255,255,255,1);' : 'color: rgba(255,255,255,0.65);'}cursor: pointer;background: #001529;font-size: 13px;flex:none;line-height: 22px;justify-content:space-between;'>
                    <span style='padding-left:1.71rem'> ${aaa[a][0].school.school_name}-${aaa[a][0].eas}</span>
                    <img src=${hehe ? "../img/icon_unfold.png" : "../img/icon_fold.png"} alt="" style='height:1rem;width:1rem;margin-right:1.21rem'>
                </div>
                ${str}`)
            })

            $('.summary').on('click', function (a, b, c) {
                if ($('.' + a.currentTarget.id).css('display') == 'none') {
                    $('.' + a.currentTarget.id).css('display', 'flex')
                    $(a.currentTarget).css('color', 'rgba(255,255,255,1)')
                    a.currentTarget.children[1].src = '../img/icon_unfold.png'
                } else {
                    $(a.currentTarget).css('color', 'rgba(255,255,255,0.65)')
                    $('.' + a.currentTarget.id).css('display', 'none')
                    a.currentTarget.children[1].src = '../img/icon_fold.png'
                }

                $('pre').hide()
                $('#URL').show()
                //找出本地项目URL 填充到输入框
                console.log($(a.currentTarget).text().trim())
                chrome.storage.local.get({ [$(a.currentTarget).text().trim()]: '' }, function (school_info) {
                    console.log(school_info)
                    modifyUrlSchoolInfo = $(a.currentTarget).text().trim()
                    $('#URL>input').val(school_info[$(a.currentTarget).text().trim()].url)
                })



            })
            $('.detail').on('click', function (a, b, c) {
                $('.detail').css('background-color', 'rgba(0,12,23,1)')
                $('.detail').css('color', 'rgba(255,255,255,0.65)')
                $('#' + a.currentTarget.id).css('background-color', 'rgba(20,50,83,1)')
                $('#' + a.currentTarget.id).css('color', 'rgba(255,255,255,1)')
                $('pre').show()
                $('#URL').hide()
                //请求html并设置html

                items.forEach(function (aaa) {
                    if ('d-' + aaa.school.school_name + aaa.eas + aaa.id == a.currentTarget.id) {
                        if (mode != 'self' && aaa.id != '本地') {

                            port.postMessage({
                                name: 'html',
                                tabId: chrome.devtools.inspectedWindow.tabId,
                                id: aaa.id
                            });
                        } else if (mode != 'self' && aaa.id == '本地') {
                            console.log(aaa)
                            $('#pre').html(aaa.html)
                            chrome.storage.local.set({ html: aaa.html }, function (items) {
                            })
                        }
                        chrome.storage.local.set({ 'current': aaa }, function () {
                            refreshCurrent(aaa.id)
                        });
                    }
                })
            })
            refreshCurrent()
        }
    })
}
$('#upload').on('click', function () {
    port.postMessage({
        name: 'upload',
        tabId: chrome.devtools.inspectedWindow.tabId,
        mode
    });
})
$('#URL>input').on('keyup', function (e) {
    // 改本地 如果current和现在一致就把current也改了
    chrome.storage.local.get({ [modifyUrlSchoolInfo]: '' }, function (school_info) {
        school_info[modifyUrlSchoolInfo].url = e.target.value
        chrome.storage.local.set({ [modifyUrlSchoolInfo]: school_info[modifyUrlSchoolInfo] }, function () {
            chrome.storage.local.get({ current: '' }, function (current) {
                if ((current.current.school.school_name + '-' + current.current.eas) == modifyUrlSchoolInfo) {
                    current.current.url = e.target.value
                    chrome.storage.local.set({ current: current.current }, function () {
                    })
                }
            });
        })
    })
})
function refreshCurrent(id) {

    chrome.storage.local.get({ current: '' }, function (items) {
        chrome.storage.local.get({ html: '' }, function (html) {

            if (mode == 'self') {

                $('#pre').text(items.current.provider_html ? items.current.provider_html : '')
            } else {
                if (id != '本地') {

                    $('#pre').html(html.html)
                } else {
                    $('#pre').html(items.current.html)

                }

            }
            $('#version').html('版本号：' + (items.current.id ? items.current.id : '本地') + '&nbsp;&nbsp;&nbsp;')
            $('#date').text('日期：' + (items.current ? new Date(items.current.updatedAt).getFullYear() : new Date().getFullYear()) + '/' + ((items.current ? new Date(items.current.updatedAt).getMonth() + 1 : new Date().getMonth() + 1)) + '/' + (items.current ? new Date(items.current.updatedAt).getDate() : new Date().getDate()))
            $('#upp>button').css('border-bottom', '0px solid rgb(37, 159, 255)')
            $(`#provider_html`).css('border-bottom', '3px solid rgb(37, 159, 255)')
            $(`#provider_html`).css("padding", "0px 20px 7px 20px")
        })
    })

}