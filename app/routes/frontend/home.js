var express = require('express');
var router = express.Router();

//const ArticleModel = require(__path_models + 'articles');

const folderView = __path_views_frontend + 'pages/home/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'home';

router.get('/', /*async */(req, res, next) => {
  /*let articleSpecial = [];
  let articleNews = [];
  await ArticleModel.listArticleFrontend(null, {task: 'article-special'}).then((article) => {
    articleSpecial = article;
  });

  await ArticleModel.listArticleFrontend(null, {task: 'article-news'}).then((article) => {
    articleNews = article;
  });

  res.render(`${folderView}index`, {
    layout: layoutBlog,
    top_post: true,
    articleSpecial,
    articleNews
  });*/
  res.render(`${folderView}index`, { layout: layoutFrontend, errors: null, pageTitle });
});

module.exports = router;
