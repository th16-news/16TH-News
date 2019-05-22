const util = require('util');
const notify = require(__path_configs + 'notify');


const options = {
    expected_publish_time: { value: '' },
    refuse_reason: { min: 1, max: 300 }
}


module.exports = {
    validator: (req, taskCurrent) => {
        if (taskCurrent == 'refuse') {
            req.checkBody('refuse_reason', util.format(notify.ERROR_NAME, options.refuse_reason.min, options.refuse_reason.max)).isLength({ min: options.refuse_reason.min, max: options.refuse_reason.max });
        } else if (taskCurrent == 'browse') {
            req.checkBody('expected_publish_time', notify.ERROR_TIME).isNotEqual(options.expected_publish_time.value);
        }
        let errors = (req.validationErrors() !== false) ? req.validationErrors() : [];
        return errors;
    }
}