var express = require('express');
var router = express.Router();


const ParamsHelpers = require(__path_helpers + 'params');
const ValidateTag = require(__path_validates + 'administrator/tags');
const TagModel = require(__path_models + 'tags');
const notify = require(__path_configs + 'notify');

const folderView = __path_views_backend + 'pages/administrator/tags/';
const systemConfig = require(__path_configs + 'system');
const linkIndex = '/' + systemConfig.prefixAdministrator + '/tags/';

let setting_time_publish = false;

const moduleTitle = 'PHÂN HỆ QUẢN TRỊ VIÊN';
const pageTitle = 'Danh sách tags';
const pageTitleAdd = 'Thêm mới tag';

router.get('(/status/:status)?', (req, res, next) => {
    let params = {};
    params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');

    TagModel.listTags(params).then((data) => {
        res.render(`${folderView}list`, {
            moduleTitle,
            pageTitle,
            data,
            params,
            setting_time_publish
        })
    })
})

router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    TagModel.changeStatus(id, currentStatus).then(() => {
      req.flash('success', notify.CHANGE_STATUS_SUCCESS);
      res.redirect(linkIndex);
    })
})

router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    
    TagModel.deleteTag(id).then(() => {
      req.flash('success', notify.DELETE_SUCCESS);
      res.redirect(linkIndex);
    })
})

router.get('/form', (req, res, next) => {
    let errors = null;
    res.render(`${folderView}form`, { 
        moduleTitle,
        pageTitle: pageTitleAdd,
        tag: { name: '', status: 'novalue' },
        errors,
        setting_time_publish
    })
})

router.post('/save', (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    ValidateTag.validator(req);
    let tag = Object.assign(req.body);
    let errors = req.validationErrors();


    if (errors.length > 0) {
        res.render(`${folderView}form`, { 
            moduleTitle,
            pageTitle: pageTitleAdd, 
            tag, 
            errors, 
            setting_time_publish 
        });
    } else {
        TagModel.saveTag(tag).then(() => {
            req.flash('success', notify.ADD_SUCCESS);
            res.redirect(linkIndex);  
        });
    }
});

module.exports = router;