var express = require('express');
var router = express.Router();

const ParamsHelpers = require(__path_helpers + 'params');
const ArticleModel = require(__path_models + 'articles');
const CategoryModel = require(__path_models + 'categories');
const TagModel = require(__path_models + 'tags');

const folderView = __path_views_backend + 'pages/editor/';
const systemConfig = require(__path_configs + 'system');
const linkIndex = '/' + systemConfig.prefixEditor + '/articles';

const moduleTitle = 'PHÂN HỆ BIÊN TẬP VIÊN';
const pageTitle = 'Danh sách bài viết';
const pageTitleAdd = 'Thêm mới bài viết';
const pageTitleEdit = 'Sửa đổi bài viết';

router.get('(/status/:status)?', async (req, res, next) => {
    let params = {};
    params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
    params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
    //let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus, 'article');
    //params.sortField = ParamsHelpers.getParam(req.session, 'sort_field', 'name');
    //params.sortType = ParamsHelpers.getParam(req.session, 'sort_type', 'asc');

    //params.categoryID = ParamsHelpers.getParam(req.session, 'category_id', '');

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
            //statusFilter,
            params
        });
    });
});

router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');
    
    ArticleModel.deleteArticle(id).then(() => {
      //req.flash('success', notify.DELETE_SUCCESS);
      res.redirect(linkIndex);
    });
});

router.get('/form(/:id)?', async (req, res, next) => {
  let id = ParamsHelpers.getParam(req.params, 'id', '');
  let article = { /**/ };
  //let errors = null;

  let listCategories = [];
  await CategoryModel.listCategoriesInSelectbox().then((data) => {
    listCategories = data;
    listCategories.unshift({_id: 'novalue', name: 'Chọn category'});
  })

  let listTags = [];
  await TagModel.listTagsInSelectbox().then((data) => {
    listTags = data;
    listTags.unshift({_id: 'novalue', name: 'Chọn tag'});
  })

  if (id === '') {
    res.render(`${folderView}form`, { 
      moduleTitle,
      pageTitle: pageTitleAdd, 
      article, 
      //errors, 
      listCategories,
      listTags
    });
  } else {
    ArticleModel.getArticle(id).then((data) => {
      //article.category.id = data.category.id;
      //article.category.name = data.category.name;
      res.render(`${folderView}form`, { 
        moduleTitle,
        pageTitle: pageTitleEdit, 
        article, 
        //errors, 
        listCategories,
        listTags
      });
    })    
  } 
});

router.post('/save', async (req, res, next) => {
  //uploadThumb(req, res, async (errUpload) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    let article = Object.assign(req.body);
    let taskCurrent = (typeof article !== undefined && article.id !== "") ? "edit" : "add";
 
    //let errors = ValidateArticle.validator(req, errUpload, taskCurrent);
    
    /*if (errors.length > 0) {
      let pageTitle = (taskCurrent == "add") ? pageTitleAdd : pageTitleEdit;  
      if (req.file != undefined) {
        FileHelpers.remove('public/uploads/article/', req.file.filename);
      }
      
      let categoryArticle = [];
      await CategoryModel.listCategoryInSelectbox().then((article) => {
        categoryArticle = article;
        categoryArticle.unshift({_id: 'novalue', name: 'Choose Category'});
      });
      if (taskCurrent == "edit") {
        article.thumb = article.image_old;
      }
      res.render(`${folderView}form`, { pageTitle, article, errors, categoryArticle });
    } else {
      let message = (taskCurrent == "add") ? notify.ADD_SUCCESS : notify.EDIT_SUCCESS;
      if (req.file == undefined) {
        article.thumb = article.image_old;
      } else {
        article.thumb = req.file.filename;
        if (taskCurrent == "edit") {
          FileHelpers.remove('public/uploads/article/', article.image_old);
        }
      }*/
      
      
      ArticleModel.saveArticle(article, req.user, { task: taskCurrent }).then(() => {
        //req.flash('success', message);
        res.redirect(linkIndex);
      });
    //}
  //});
});

module.exports = router;