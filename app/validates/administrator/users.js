const util = require('util');
const notify = require(__path_configs + 'notify');


const options = {
    position: { value: 'novalue' },
    status: { value: 'novalue' },
    category_id: { value: 'novalue' }
}


module.exports = {
    validator: (req) => {
        req.checkBody('position', notify.ERROR_POSITION).isNotEqual(options.position.value);
        req.checkBody('status', notify.ERROR_STATUS).isNotEqual(options.status.value);
        req.checkBody('category_id', notify.ERROR_CATEGORY).isNotEqual(options.category_id.value);
        let errors = (req.validationErrors() !== false) ? req.validationErrors() : [];
        return errors;
    }
}