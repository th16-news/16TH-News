var express = require('express');
var router = express.Router();

const ParamsHelpers = require(__path_helpers + 'params');
const UtilsHelpers = require(__path_helpers + 'utils');
const ArticleModel = require(__path_models + 'articles');
const notify = require(__path_configs + 'notify');

const folderView = __path_views_backend + 'pages/administrator/articles/';
const systemConfig = require(__path_configs + 'system');
const linkIndex = '/' + systemConfig.prefixAdministrator + '/articles';

let setting_time_publish = false;

const moduleTitle = 'PHÂN HỆ QUẢN TRỊ VIÊN';
const pageTitle = 'Danh sách bài viết';

router.get('(/status/:status)?', async (req, res, next) => {
    let params = {};
    params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
    params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
    let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus, 'articles', null, 'Quản trị viên');
    //params.sortField = ParamsHelpers.getParam(req.session, 'sort_field', 'name');
    //params.sortType = ParamsHelpers.getParam(req.session, 'sort_type', 'asc');

    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: 5,
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
        pageRanges: 5
    }


    await ArticleModel.countArticles(params, 'Quản trị viên').then((number) => {
        params.pagination.totalItems = number;
    });


    ArticleModel.listArticles(params, 'Quản trị viên').then((data) => {
        res.render(`${folderView}list`, {
            moduleTitle,
            pageTitle,
            data,
            statusFilter,
            params,
            setting_time_publish
        });
    });
});

router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'published');
    let id = ParamsHelpers.getParam(req.params, 'id', '');

    ArticleModel.changeStatus(id, currentStatus).then(() => {
        req.flash('success', notify.CHANGE_STATUS_SUCCESS);
        res.redirect(linkIndex);
    });
});

router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    
    ArticleModel.deleteArticle(id).then(() => {
      req.flash('success', notify.DELETE_SUCCESS);
      res.redirect(linkIndex);
    });
});

module.exports = router;