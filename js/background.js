console.log('woshi   background')
let mode = 'self'

let connections = {}
// let url = 'http:127.0.0.1:50017'
let url = 'https://open-schedule.ai.xiaomi.com'
function post(url, data, headers) {
    return fetch(url, {
        body: JSON.stringify(data),
        headers,
        method: "POST",
    }).then(response => { if (response.status == 200) { return response.json() } else { throw new Error(response.status) } })
}
function get(url, headers) {
    return fetch(url, {
        headers,
        method: "GET",
    }).then(response => {
        if (response.headers.get("content-type").indexOf("application/json") > -1) {
            return response.json()
        } else {
            return response
        }
    })
}
function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}

chrome.contextMenus.create({
    title: '运行函数',
    id: '1'
    , onclick: function () {
        sendMessageToContentScript({ cmd: 'provider', value: '你好，我是爸爸！', mode }, function (response) {
            console.log('来自content的回复：' + response);
        });
    }
});

// chrome.contextMenus.create({
//     title: \"重新加载扩展\",
//     parentId: '1',
//     onclick: function () {
//         sendMessageToContentScript({ cmd: 'refresh', value: '你好，我是爸爸！' }, function (response) {
//             console.log('来自content的回复：' + response);
//             chrome.runtime.reload();
//         });
//     }
// });
// chrome.contextMenus.create({
//     title: "运行",
//     parentId: '1',
//     onclick: function () {
//         sendMessageToContentScript({ cmd: 'provider', value: '你好，我是爸爸！' }, function (response) {
//             console.log('来自content的回复：' + response);
//         });
//     }
// });

// chrome.contextMenus.create({
//     title: "上传",
//     parentId: '1',
//     onclick: function () {

//     }
// sendMessageToContentScript({ cmd: 'upload', value: '你好，我是爸爸！' }, function (response) {
//     console.log('来自content的回复：' + response);
// });

// });

chrome.runtime.onConnect.addListener(function (port) {
    const extensionListener = function (message, sender, sendResponse) {
        console.log(message, sender.id)
        connections[message.tabId] = port;
        if (message.name == 'login') {
            window.open('https://account.xiaomi.com/pass/serviceLogin?callback=https%3A%2F%2Fopen-schedule.ai.xiaomi.com%2Fsts%3Fsign%3DCgKc5TbNWp1A66mDX7AGxu7Om0o%3D%26followup%3Dhttps%3A%2F%2Fopen-schedule.ai.xiaomi.com%2Fssocheck&sid=openSchedule', '小米账号登陆', 'scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes')
            for (let tabId in connections) {
                connections[tabId].postMessage(message);
            }

        }

        if (message.name == 'userId') {

            chrome.cookies.get({ url: 'https://open-schedule.ai.xiaomi.com/', name: 'userId' }, function (aaa) {
                for (let tabId in connections) {
                    connections[tabId].postMessage({ name: 'userId', msg: aaa && aaa.value ? 'hi,' + aaa.value : 'login' });
                }

            })

        };
        if (message.name == 'data') {
            let reqURL = ''
            reqURL = message.mode == 'self' ? url + '/api/mypost' : url + '/api/adapting'
            get(reqURL).then(function (myTbs) {

                myTbs = myTbs && myTbs.length && myTbs.length > 0 ? myTbs : []

                for (let tabId in connections) {
                    console.log('请求一下数据嗷嗷嗷')
                    console.log(connections)
                    connections[tabId].postMessage({ name: 'tbs', myTbs: myTbs });
                }
            }).catch(function () {
                for (let tabId in connections) {
                    connections[tabId].postMessage({ name: 'tbs', myTbs: [] });
                }
            })
        };
        if (message.name == 'html') {
            let reqURL = url + `/api/page?tb_id=${message.id}`
            // reqURL = message.mode == 'self' ? url + '/api/mypost' : url + '/api/adapting'

            get(reqURL).then(function (myTbs) {
                for (let tabId in connections) {
                    connections[tabId].postMessage({ name: 'html', myTbs: myTbs.page });
                }
            }).catch(function () {
            })
        };
        if (message.name == 'fetchMode') {

            for (let tabId in connections) {
                connections[tabId].postMessage({ name: 'fetchMode', mode });
            }

        };
        if (message.name == 'mode') {
            mode = message.mode
        };
        if (message.name == 'upload') {
            chrome.storage.local.get({ html: '' }, function (items1) {
                chrome.storage.local.get({ current: '' }, function (items2) {
                    if (!items2.current) {
                        return alert('请先选定您的学校')
                    }
                    if (window.confirm(`确定要上传${items2.current.school.school_name}-${items2.current.eas}的适配项目吗`)) {
                        post(url + '/api/files', {
                            \"url\": items2.current.url,
                            \"school_name\": items2.current.school.school_name,
                            eas: items2.current.eas,
                            \"provider_html\": items2.current.provider_html,
                            \"parser\": items2.current.parser,
                            status: mode == 'else' ? 1 : 0, isvalid: 0,
                            html: items1.html,
                            score: mode == 'else' ? 1024 : 0
                        }, { 'Content-Type': 'application/json' }).then(function (result) {

                            if (result.code == 0) {
                                alert('上传成功')
                                console.log(\"%c 上传成功\", \"color:green;font-size:38px;\");

                            } else if (result.code == 400) {
                                alert('您未在白名单中')
                            }
                            else if (result.code == 401) {
                                alert('请您先登陆')
                                window.open('https://account.xiaomi.com/pass/serviceLogin?callback=https%3A%2F%2Fopen-schedule.ai.xiaomi.com%2Fsts%3Fsign%3DCgKc5TbNWp1A66mDX7AGxu7Om0o%3D%26followup%3Dhttps%3A%2F%2Fopen-schedule.ai.xiaomi.com%2Fssocheck&sid=openSchedule', '小米账号登陆', 'scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes')
                            }
                            let reqURL = ''
                            reqURL = message.mode == 'self' ? url + '/api/mypost' : url + '/api/adapting'
                            get(reqURL).then(function (myTbs) {
                                myTbs = myTbs && myTbs.length && myTbs.length > 0 ? myTbs : []
                                for (let tabId in connections) {
                                    connections[tabId].postMessage({ name: 'tbs', myTbs: myTbs });
                                }
                            }).catch(function () {
                                for (let tabId in connections) {
                                    connections[tabId].postMessage({ name: 'tbs', myTbs: [] });
                                }
                            })
                        }).catch(function (err) {
                            console.log(err.message)
                            if (err.message == 400) {
                                alert('参数错误')
                            } else {
                                alert('服务器错误，请先保存您的修改')
                            }
                        })
                    }
                })
            })
        }
        if (message.name == 'fetchSchool') {

            get(url + '/api/schools/list?school_name=' + message.msg).then(function (schools) {
                for (let tabId in connections) {
                    connections[tabId].postMessage({ name: 'schools', msg: schools });
                }
            })
        }
        if (message.name == 'update') {
            console.log('nima')
            get('https://github.com/jiazhonglin/AISchedule-Devtools').then(function (schools) {
                let currentVersion = chrome.app.getDetails().version
                let aaa = schools.url.split('-').pop().split('.').join('')
                let bbb = currentVersion.split('.').join('')
                console.log(aaa)
                console.log(bbb)
                if (aaa > bbb) {
                    for (let tabId in connections) {
                        connections[tabId].postMessage({ name: 'newVersion' });
                    }
                }
            }).catch(function (err) {
                console.log(err)
            })
        }
    }
    port.onMessage.addListener(extensionListener);
    port.onDisconnect.addListener(function (port) {
        port.onMessage.removeListener(extensionListener);
        const tabs = Object.keys(connections);
        for (let i = 0, len = tabs.length; i < len; i++) {
            if (connections[tabs[i]] == port) {
                delete connections[tabs[i]];
                break;
            }
        }
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    console.log(sender)
    console.log(connections)

    if (message.name == 'onunload' && Object.keys(connections) > 0) {
        connections[sender.tab.id].postMessage({ name: 'onunload', msg: {} });
    }
    if (message.name == 'testParser') {
        console.log(message, sender.tab.id, sendResponse)
        let courseInfos = message.msg.courseInfos.map(function (course) {
            return Object.assign({}, course, {
                deviceId: 'c53d7414fb6ecbbecd3e81394622f988',
                userId: 0,
                day: Number(course.day),
                weeks: course.weeks.toString(),
                sections: course.sections.map(function (section) {
                    return section.section
                }).toString()
            })
        })
        courseInfos = courseInfos[Math.floor(Math.random() * courseInfos.length)]
        post('https://i.ai.mi.com/course/courseInfos', {
            first: 1,
            courseInfos: [courseInfos]
        }, { 'Content-Type': 'application/json' }).then(function (result) {
            console.log('done')

            chrome.tabs.sendMessage(sender.tab.id, { cmd: 'testParser', value: result, schedule: message.msg }, function (response) {
            });
        }).catch(function (err) {
            console.log('notdone')
            chrome.tabs.sendMessage(sender.tab.id, { cmd: 'testParser', value: err }, function (response) {
            });

        })
    }

    sendResponse('ok');
    // if (message.name == 'parser') {
    //     chrome.storage.local.get({ current: '' }, function (items2) {
    //         if (!items2) {
    //             return alert('您的提交不符合规范')
    //         }
    //         if (a == true) {
    //             post(url + '/api/files', {
    //                 \"url\": message.msg.url,
    //                 \"school_name\": items2.school.school_name,
    //                 eas: items2.eas,
    //                 \"provider_html\": message.msg.provider,
    //                 \"parser\": message.msg.parser,
    //                 status: 0, isvalid: 0,
    //                 html: message.msg.html
    //             }, { 'Content-Type': 'application/json' }).then(function (result) {

    //                 if (result.code == 0 && message.name == 'parser') {
    //                     alert('上传成功')
    //                     console.log(\"%c 上传成功\", \"color:green;font-size:38px;\");

    //                 }
    //                 else if (result.code == 401 && message.name == 'parser') {
    //                     alert('请您先登陆')
    //                     window.open('https://account.xiaomi.com/pass/serviceLogin?callback=https%3A%2F%2Fopen-schedule.ai.xiaomi.com%2Fsts%3Fsign%3DCgKc5TbNWp1A66mDX7AGxu7Om0o%3D%26followup%3Dhttps%3A%2F%2Fopen-schedule.ai.xiaomi.com%2Fssocheck&sid=openSchedule', '小米账号登陆', 'scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes')
    //                 } else if (message.name == 'parser') {
    //                     alert('服务器错误，请先保存您的修改')
    //                 }
    //                 get(url + '/api/mypost').then(function (myTbs) {
    //                     console.log(myTbs)
    //                     for (let tabId in connections) {
    //                         connections[tabId].postMessage({ name: 'tbs', myTbs: myTbs });
    //                     }
    //                 })
    //             }).catch(function (err) {
    //                 console.log(err.message)
    //                 if (err.message == 400) {
    //                     alert('请勿修改已上线的适配，或者丢失参数')
    //                 } else {
    //                     alert('服务器错误，请先保存您的修改')

    //                 }
    //             })
    //         } else {
    //             alert('请到Devtools->AISchedule中修改学校或教务系统')
    //         }
    //     })
    // }
    // sendResponse('我是后台，我已收到你的消息：');
});