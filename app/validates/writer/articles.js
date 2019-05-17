const util = require('util');
const notify = require(__path_configs + 'notify');


const options = {
    name: { min: 1, max: 200 },
    category_id: { value: 'novalue' },
    type: { value: 'novalue' },
    summary: { min: 1, max: 500 },
    content: { min: 1, max: 10000 },
}


module.exports = {
    validator: (req, errUpload, taskCurrent) => {
        req.checkBody('name', util.format(notify.ERROR_NAME, options.name.min, options.name.max)).isLength({ min: options.name.min, max: options.name.max });
        req.checkBody('category_id', notify.ERROR_CATEGORY).isNotEqual(options.category_id.value);
        req.checkBody('type', notify.ERROR_TYPE).isNotEqual(options.type.value);
        req.checkBody('summary', util.format(notify.ERROR_NAME, options.summary.min, options.summary.max)).isLength({ min: options.summary.min, max: options.summary.max });
        req.checkBody('content', util.format(notify.ERROR_NAME, options.content.min, options.content.max)).isLength({ min: options.content.min, max: options.content.max });
        
        

        let errors = (req.validationErrors() !== false) ? req.validationErrors() : [];
        if (errUpload) {
            if (errUpload.code == 'LIMIT_FILE_SIZE') {
                errUpload = notify.ERROR_FILE_LIMIT;
            }
            errors.push({param: 'thumb', msg: errUpload});
        } else {
            if (req.file == undefined && taskCurrent == "add") {
                errors.push({param: 'thumb', msg: notify.ERROR_FILE_REQUIRE});
            }
        }
        return errors;
    }
}