var express = require('express');
var router = express.Router();

const ArticleModel = require(__path_models + 'articles');
const CategoryModel = require(__path_models + 'categories');
const ParamsHelpers = require(__path_helpers + 'params');

const folderView = __path_views_frontend + 'pages/home/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'home';

router.get('/', async (req, res, next) => {

  let params = {
    keyword: ''
  };

  params.pagination = {
    totalItems: 1,
    totalItemsPerPage: 5,
    currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
    pageRanges: 5
  }

  await ArticleModel.countArticlesFrontend(params).then((number) => {
    params.pagination.totalItems = number;
  });

  let articlesMostViews = [];
  await ArticleModel.listArticlesFrontend(params, {task: 'article-most-views'}).then((articles) => {
    articlesMostViews = articles;
  });

  let articlesTopViews = [];
  await ArticleModel.listArticlesFrontend(params, {task: 'article-top-views'}).then((articles) => {
    articlesTopViews = articles;
  });

  let articlesNew = [];
  await ArticleModel.listArticlesFrontend(params, {task: 'article-new'}).then((articles) => {
    articlesNew = articles;
  });

  let articlesAllPublish = [];
  await ArticleModel.listArticlesFrontend(params, {task: 'article'}).then((articles) => {
    articlesAllPublish = articles;
  });

  

  let articlesTopNewCategories = [];
  await CategoryModel.listCategories({}).then((categories) => {
    categories.forEach((category) => {
      for (let index = 0; index < articlesAllPublish.length; index++) {
        if (articlesAllPublish[index].category.name == category.name) {
          articlesTopNewCategories.push(articlesAllPublish[index]);
          break;
        }
      }
    })
  })

  res.render(`${folderView}index`, {
    layout: layoutFrontend,
    pageTitle,
    articlesNew,
    articlesTopNewCategories,
    articlesMostViews,
    articlesTopViews,
    params
  });
});

router.get('/search', async (req, res, next) => {
  let params = {};
  params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');

  params.pagination = {
    totalItems: 1,
    totalItemsPerPage: 4,
    currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
    pageRanges: 5
  }

  await ArticleModel.countArticlesFrontend(params).then((number) => {
    params.pagination.totalItems = number;
  });


  ArticleModel.listArticlesFrontend(params, { task: 'article-in-search' }).then((articles) => {
    res.render(`${folderView}search`, {
      layout: layoutFrontend,
      pageTitle: 'search',
      articles,
      params
    });
  })
});


module.exports = router;
