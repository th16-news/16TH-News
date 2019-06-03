var express = require('express');
var router = express.Router();

const ArticleModel = require(__path_models + 'articles');
const CategoryModel = require(__path_models + 'categories');

const folderView = __path_views_frontend + 'pages/home/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'home';

router.get('/', async (req, res, next) => {
  let articleNew = [];
  await ArticleModel.listArticlesFrontend(null, {task: 'article-new'}).then((articles) => {
    articleNew = articles;
  });

  let articleTopNewCategories = [];
  await CategoryModel.listCategories({}).then((categories) => {
    categories.forEach((category) => {
      for (let index = 0; index < articleNew.length; index++) {
        if (articleNew[index].category.name == category.name) {
          articleTopNewCategories.push(articleNew[index]);
          break;
        }
      }
    })
  })

  res.render(`${folderView}index`, {
    layout: layoutFrontend,
    pageTitle,
    //top_post: true,
    //articleSpecial,
    articleNew,
    articleTopNewCategories
  });
});

module.exports = router;
