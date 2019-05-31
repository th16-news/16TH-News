let concatTag = (str1, str2) => {
    let arr_tags = str1.split(',');
    let tags = (arr_tags.slice(-1) == '') ? ((arr_tags.pop() == '') ? [] : arr_tags.pop()) : arr_tags;
    let arr_old_tags = str2.split(',');
    let old_tags = (arr_old_tags.slice(-1) == '') ? ((arr_old_tags.pop() == '') ? [] : arr_old_tags.pop()) : arr_old_tags;
    return old_tags.concat(tags);
}

let translate = (str) => {
    let result = '';
    switch(str) {
        case 'published':
            result = 'Đã xuất bản';
            break;
        case 'browsed':
            result = 'Đã được duyệt';
            break;
        case 'not_browsed':
            result = 'Chưa được duyệt';
            break;
        case 'refused':
            result = 'Bị từ chối';
            break;
        default:
    }
    return result;
}

let translate_position = (str) => {
    let result = '';
    switch(str) {
        case 'subscriber':
            result = 'Đọc giả';
            break;
        case 'writer':
            result = 'Phóng viên';
            break;
        case 'editor':
            result = 'Biên tập viên';
            break;
        case 'administrator':
            result = 'Quản trị viên';
            break;
        default:
    }
    return result;
}

let formatLink = (value) => {
    if (value[1]=="/") {
        value = value.substr(1);
    }
    return value;
}

let getDate = (str) => {
    let year = str.substr(11, 4);
    let month = '';
    switch (str.substr(4, 3)) {
        case 'Jan': 
            month = '01';
            break;
        case 'Feb': 
            month = '02';
            break;
        case 'Mar': 
            month = '03';
            break;
        case 'Apr': 
            month = '04';
            break;
        case 'May': 
            month = '05';
            break;
        case 'Jun': 
            month = '06';
            break;
        case 'Jul': 
            month = '07';
            break;
        case 'Aug': 
            month = '08';
            break;
        case 'Sep': 
            month = '09';
            break;
        case 'Oct': 
            month = '10';
            break;
        case 'Nov': 
            month = '11';
            break;
        case 'Dec': 
            month = '12';
            break;
        default:
    }
    let day = str.substr(8, 2);
    let date = year + "-" + month + "-" + day;
    return date;
}

module.exports = {
    concatTag,
    translate,
    translate_position,
    formatLink,
    getDate
}