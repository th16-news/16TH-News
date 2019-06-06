var express = require('express');
var router = express.Router();

const ArticleModel = require(__path_models + 'articles');
const StringHelpers = require(__path_helpers + 'strings');
const ParamsHelpers = require(__path_helpers + 'params');
const systemConfig = require(__path_configs + 'system');

const folderView = __path_views_frontend + 'pages/details/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'details';

router.get('/:article_name', async (req, res, next) => {
    let article_slug = ParamsHelpers.getParam(req.params, 'article_name', '');
    let idArticle = '';
    let idCategoryArticle = '';
    let viewsArticle = 0;
    await ArticleModel.listArticlesFrontend(null, {task: 'article'}).then((articles) => {
        articles.forEach((article) => {
            if (StringHelpers.createSlug(article.name) == article_slug) {
                idArticle = article.id;
                idCategoryArticle = article.category.id;
                (article.views == undefined || article.views == null) ? viewsArticle = 0 : viewsArticle = article.views;
            }
        })
    })

    await ArticleModel.updateViews(idArticle, viewsArticle);

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
        article: articleDetail[0],
        articleRandomInCategory,
        user: (req.isAuthenticated()) ? true : false
    });
});

router.post('/:article_name', async (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    let comment = Object.assign(req.body);
    let article_slug = ParamsHelpers.getParam(req.params, 'article_name', '');
    let idArticle = '';
    await ArticleModel.listArticlesFrontend(null, {task: 'article'}).then((articles) => {
        articles.forEach((article) => {
            if (StringHelpers.createSlug(article.name) == article_slug) {
                idArticle = article.id;
            }
        })
    })
    let comments_article = [];
    await ArticleModel.getArticle(idArticle).then((article) => {
        comments_article = article.comments;
    })

    await ArticleModel.addComment(idArticle, comments_article, comment, req.user).then(() => {
        let linkDetail = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/details/' + article_slug);
        res.redirect(linkDetail);
    })  
});


module.exports = router;