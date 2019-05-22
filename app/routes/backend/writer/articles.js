var express = require('express');
var router = express.Router();

const ParamsHelpers = require(__path_helpers + 'params');
const FileHelpers = require(__path_helpers + 'files');
const StringHelpers = require(__path_helpers + 'strings');
const UtilsHelpers = require(__path_helpers + 'utils');
const ArticleModel = require(__path_models + 'articles');
const CategoryModel = require(__path_models + 'categories');
const ValidateArticle = require(__path_validates + 'writer/articles');
const notify = require(__path_configs + 'notify');

const folderView = __path_views_backend + 'pages/writer/';
const systemConfig = require(__path_configs + 'system');
const linkIndex = '/' + systemConfig.prefixWriter + '/articles';

const uploadThumb = FileHelpers.upload('thumb', 'articles/');

let setting_time_publish = false;

const moduleTitle = 'PHÂN HỆ PHÓNG VIÊN';
const pageTitle = 'Danh sách bài viết';
const pageTitleAdd = 'Thêm mới bài viết';
const pageTitleEdit = 'Sửa đổi bài viết';

router.get('(/status/:status)?', async (req, res, next) => {
  let params = {};
  params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
  params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
  let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus, 'articles');
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

router.get('/form(/:id)?(/delete-tags/:items)?', async (req, res, next) => {
  let id = ParamsHelpers.getParam(req.params, 'id', '');
  let errors = null;


  let listCategories = [];
  await CategoryModel.listCategoriesInSelectbox().then((data) => {
    listCategories = data;
    listCategories.unshift({ _id: 'novalue', name: 'Chọn chuyên mục' });
  })


  if (id === '') {
      let article = {
        tags: [],
        category: {
          id: '',
          name: ''
        }
      }
      res.render(`${folderView}form`, {
        moduleTitle,
        pageTitle: pageTitleAdd,
        article,
        items: '',// Tags bị xóa
        errors, 
        listCategories,
        setting_time_publish
      });
    
  } else {
    let items = ParamsHelpers.getParam(req.params, 'items', '');
    ArticleModel.getArticle(id).then((article) => {
      if (items != '') {
        let items_delete = items.split(',');
        items_delete.forEach((item) => {
          var index = article.tags.indexOf(item);
          if (index > -1) {
            article.tags.splice(index, 1);
          }
        })
      }
      res.render(`${folderView}form`, {
        moduleTitle,
        pageTitle: pageTitleEdit,
        article,
        items,// Tags bị xóa
        errors, 
        listCategories,
        setting_time_publish
      });
    })
  }
});

router.post('/save', (req, res, next) => {
  uploadThumb(req, res, async (errUpload) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    let article = Object.assign(req.body);

    article.tags = StringHelpers.concatTag(article['hidden-tags'], article.tags_old);
    article.status = 'Chưa được duyệt';
    article.type = (article.type == 'novalue') ? 'novalue' : ((article.type == 'normal') ? 'Thông thường' : 'Premium');
    article.category = {
      id: article.category_id,
      name: article.category_name
    }

    let taskCurrent = (typeof article !== undefined && article.id !== "") ? "edit" : "add";

    let errors = ValidateArticle.validator(req, errUpload, taskCurrent);
    if (errors.length > 0) {
      // Có lỗi
      if (req.file != undefined) {
        FileHelpers.remove('public/uploads/articles/', req.file.filename);
      }
      let listCategories = [];
      await CategoryModel.listCategoriesInSelectbox().then((data) => {
        listCategories = data;
        listCategories.unshift({_id: 'novalue', name: 'Chọn chuyên mục'});
      });
      if (taskCurrent == "edit") {
        article.thumb = article.image_old;
      }
      let pageTitle = (taskCurrent == "add") ? pageTitleAdd : pageTitleEdit;
      res.render(`${folderView}form`, { 
        moduleTitle,
        pageTitle, 
        article, 
        items: article.items, // Tags bị xóa
        errors, 
        listCategories,
        setting_time_publish
      });

    } else {
      // Không có lỗi
      
      if (req.file == undefined) {
        article.thumb = article.image_old;
      } else {
        article.thumb = req.file.filename;
        if (taskCurrent == "edit") {
          FileHelpers.remove('public/uploads/articles/', article.image_old);
        }
      }

      let message = (taskCurrent == "add") ? notify.ADD_SUCCESS : notify.EDIT_SUCCESS;
      ArticleModel.saveArticle(article, req.user, { task: taskCurrent }).then(() => {
        req.flash('success', message);
        res.redirect(linkIndex);
      });
    }
  });
});

module.exports = router;