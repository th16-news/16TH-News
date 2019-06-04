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
    totalItemsPerPage: 2,
    currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
    pageRanges: 5
  }

  await ArticleModel.countArticlesFrontend(params).then((number) => {
    params.pagination.totalItems = number;
  });

  let articleNew = [];
  await ArticleModel.listArticlesFrontend(params, {task: 'article-new'}).then((articles) => {
    articleNew = articles;
  });

  let articlesAllPublish = [];
  await ArticleModel.listArticlesFrontend(params, {task: 'article'}).then((articles) => {
    articlesAllPublish = articles;
  });

  let articleTopNewCategories = [];
  await CategoryModel.listCategories({}).then((categories) => {
    categories.forEach((category) => {
      for (let index = 0; index < articlesAllPublish.length; index++) {
        if (articlesAllPublish[index].category.name == category.name) {
          articleTopNewCategories.push(articlesAllPublish[index]);
          break;
        }
      }
    })
  })

  res.render(`${folderView}index`, {
    layout: layoutFrontend,
    pageTitle,
    //top_post: true,
    articleNew,
    articleTopNewCategories,
    params
  });
});

router.get('/search', async (req, res, next) => {
  let params = {};
  params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');

  params.pagination = {
    totalItems: 1,
    totalItemsPerPage: 2,
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
      //top_post: true,
      articles,
      params
    });
  })
});


module.exports = router;
