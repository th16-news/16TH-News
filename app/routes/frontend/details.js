var express = require('express');
var router = express.Router();

const ArticleModel = require(__path_models + 'articles');
const StringHelpers = require(__path_helpers + 'strings');
const ParamsHelpers = require(__path_helpers + 'params');

const folderView = __path_views_frontend + 'pages/details/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'details';

router.get('/:article_name', async (req, res, next) => {
    let article_slug = ParamsHelpers.getParam(req.params, 'article_name', '');
    let idArticle = '';
    let idCategoryArticle = '';
    await ArticleModel.listArticlesFrontend(null, {task: 'article'}).then((articles) => {
        articles.forEach((article) => {
            if (StringHelpers.createSlug(article.name) == article_slug) {
                idArticle = article.id;
                idCategoryArticle = article.category.id;
            }
        })
    })
    let articleDetail = [];
    await ArticleModel.listArticlesFrontend({id: idArticle}, {task: 'article-detail'}).then((article) => {
        articleDetail = article;
    });

    let articleRandomInCategory = [];
    await ArticleModel.listArticlesFrontend({id: idCategoryArticle}, {task: 'article-random-in-category'}).then((article) => {
        articleRandomInCategory = article;
    })

    res.render(`${folderView}index`, {
        layout: layoutFrontend,
        pageTitle,
        //top_post: false,
        article: articleDetail[0],
        articleRandomInCategory
    });
});

module.exports = router;