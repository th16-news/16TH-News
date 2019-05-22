var express = require('express');
var router = express.Router();


const ParamsHelpers = require(__path_helpers + 'params');
const ValidateCategory = require(__path_validates + 'administrator/categories');
const CategoryModel = require(__path_models + 'categories');
const notify = require(__path_configs + 'notify');

const folderView = __path_views_backend + 'pages/administrator/categories/';
const systemConfig = require(__path_configs + 'system');
const linkIndex = '/' + systemConfig.prefixAdministrator + '/categories/';

let setting_time_publish = false;

const moduleTitle = 'PHÂN HỆ QUẢN TRỊ VIÊN';
const pageTitle = 'Danh sách chuyên mục';
const pageTitleAdd = 'Thêm mới chuyên mục';

router.get('(/status/:status)?', (req, res, next) => {
    let params = {};
    params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');

    CategoryModel.listCategories(params).then((data) => {
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
    CategoryModel.changeStatus(id, currentStatus).then(() => {
      req.flash('success', notify.CHANGE_STATUS_SUCCESS);
      res.redirect(linkIndex);
    })
})

router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    
    CategoryModel.deleteCategory(id).then(() => {
      req.flash('success', notify.DELETE_SUCCESS);
      res.redirect(linkIndex);
    })
})

router.get('/form', (req, res, next) => {
    let errors = null;
    res.render(`${folderView}form`, { 
        moduleTitle,
        pageTitle: pageTitleAdd,
        errors,
        category: { name: '', status: 'novalue' },
        setting_time_publish
    })
})

router.post('/save', (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    ValidateCategory.validator(req);
    let category = Object.assign(req.body);
    let errors = req.validationErrors();

    if (errors.length > 0) {
        res.render(`${folderView}form`, { 
            moduleTitle,
            pageTitle: pageTitleAdd, 
            category, 
            errors, 
            setting_time_publish 
        });
    } else {
        CategoryModel.saveCategory(category).then(() => {
            req.flash('success', notify.ADD_SUCCESS);
            res.redirect(linkIndex);  
        });
    }
});

module.exports = router;