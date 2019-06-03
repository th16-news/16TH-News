var express = require('express');
var router = express.Router();

const ParamsHelpers = require(__path_helpers + 'params');
const ArticleModel = require(__path_models + 'articles');
const UtilsHelpers = require(__path_helpers + 'utils');
const StringHelpers = require(__path_helpers + 'strings');
const ValidateArticle = require(__path_validates + 'editor/articles');
const notify = require(__path_configs + 'notify');

const folderView = __path_views_backend + 'pages/editor/';
const systemConfig = require(__path_configs + 'system');
const linkIndex = '/' + systemConfig.prefixEditor + '/articles';

let setting_time_publish = false; // có đang cài giờ đăng

const moduleTitle = 'PHÂN HỆ BIÊN TẬP VIÊN';
const pageTitle = 'Danh sách bài viết';
const pageTitleBrowse = 'Duyệt bài viết';
const pageTitleRefuse = 'Từ chối bài viết';

router.get('(/status/:status)?', async (req, res, next) => {
    let params = {};
    params.category = {
      id: req.user.category.id,
      name: req.user.category.name
    }
    params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
    params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
    let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus, 'articles', params.category);
    //params.sortField = ParamsHelpers.getParam(req.session, 'sort_field', 'name');
    //params.sortType = ParamsHelpers.getParam(req.session, 'sort_type', 'asc');

    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: 5,
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
        pageRanges: 5
    }


    await ArticleModel.countArticles(params).then((number) => {
        params.pagination.totalItems = number;
    });


    ArticleModel.listArticles(params).then((data) => {
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

router.get('/browse(/:id)?(/delete-tags/:items)?', (req, res, next) => {
  let id = ParamsHelpers.getParam(req.params, 'id', '');
  let items = ParamsHelpers.getParam(req.params, 'items', '');
  let errors = null;
  
  if (id !== '') {
    ArticleModel.getArticle(id).then((article) => {
      //Xóa các tags
      if (items != '') {
        let items_delete = items.split(',');
        items_delete.forEach((item) => {
          var index = article.tags.indexOf(item);
          if (index > -1) {
            article.tags.splice(index, 1);
          }
        })
      }

      setting_time_publish = false;

      res.render(`${folderView}form`, {
        moduleTitle,
        pageTitle: pageTitleBrowse,
        article,
        items,// Tags bị xóa
        errors,
        setting_time_publish
      });
    })
  }
});

router.post('/browse/save', async (req, res, next) => {
  req.body = JSON.parse(JSON.stringify(req.body));
  let article = Object.assign(req.body);
  
  article.tags = article.tags.split(',');
  let errors = ValidateArticle.validator(req, 'browse');
  
  if (errors.length > 0) {
    // Có lỗi
    setting_time_publish = true;
    res.render(`${folderView}form`, { 
      moduleTitle,
      pageTitle: pageTitleBrowse,
      article,
      items: '',
      errors,
      setting_time_publish
    });
  } else {
    // Không có lỗi
    ArticleModel.saveArticle(article, req.user, { task: 'browse' } ).then(() => {
      req.flash('success', notify.BROWSE_SUCCESS);
      res.redirect(linkIndex);
    });
  }
});



router.get('/refuse(/:id)?', (req, res, next) => {
  let id = ParamsHelpers.getParam(req.params, 'id', '');
  let errors = null;
  
  if (id !== '') {
    ArticleModel.getArticle(id).then((article) => {
      setting_time_publish = false;
      res.render(`${folderView}form`, {
        moduleTitle,
        pageTitle: pageTitleRefuse,
        article,
        items: '',// Tags bị xóa
        errors,
        setting_time_publish
      });
    })
  }
});

router.post('/browse(/:id)?', (req, res, next) => {
  let id = ParamsHelpers.getParam(req.params, 'id', '');
  let errors = null;
  req.body = JSON.parse(JSON.stringify(req.body));
  let article = Object.assign(req.body);
  if (article['hidden-tags'] != undefined) article.tags = StringHelpers.concatTag(article['hidden-tags'], article.tags_old);
  if (id !== '') {
    setting_time_publish = true;
    res.render(`${folderView}form`, {
      moduleTitle,
      pageTitle: pageTitleBrowse,
      article,
      items: '',// Tags bị xóa
      errors,
      setting_time_publish
    });
  }
});




router.post('/refuse/save', async (req, res, next) => {
  req.body = JSON.parse(JSON.stringify(req.body));
  let article = Object.assign(req.body);

  
  let errors = ValidateArticle.validator(req, 'refuse');
  
  if (errors.length > 0) {
    // Có lỗi
    res.render(`${folderView}form`, { 
      moduleTitle,
      pageTitle: pageTitleRefuse,
      article,
      items: '',
      errors,
      setting_time_publish
    });
  } else {
    // Không có lỗi
    ArticleModel.saveArticle(article, req.user, { task: 'refuse' } ).then(() => {
      req.flash('success', notify.REFUSE_SUCCESS);
      res.redirect(linkIndex);
    });
  }
});

module.exports = router;