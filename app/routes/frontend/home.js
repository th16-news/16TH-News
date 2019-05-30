var express = require('express');
var router = express.Router();

//const ArticleModel = require(__path_models + 'articles');

//const folderView = __path_views_blog + 'pages/home/';
//const layoutBlog = __path_views_blog + 'frontend';

router.get('/', async (req, res, next) => {
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
  res.end('ahihi');
});

module.exports = router;
