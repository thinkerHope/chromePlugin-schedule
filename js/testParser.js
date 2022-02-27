testParser = function (text) {
    let isTrue = 1
    if (text.courseInfos && text.courseInfos.length > 0) {
        text.courseInfos.forEach(function (item) {
            if (!item.name || !item.weeks || item.weeks.length == 0) {
                isTrue = 0
            }
        })
        return isTrue
    } else {
        return 0
    }
}