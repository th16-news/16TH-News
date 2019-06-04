var express = require('express');
var router = express.Router();

const ArticleModel = require(__path_models + 'articles');
const StringHelpers = require(__path_helpers + 'strings');
const ParamsHelpers = require(__path_helpers + 'params');
const systemConfig = require(__path_configs + 'system');

const folderView = __path_views_frontend + 'pages/draft/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'draft';

router.get('/:article_name', async (req, res, next) => {
    let article_slug = ParamsHelpers.getParam(req.params, 'article_name', '');
    let idArticle = '';
    await ArticleModel.listArticlesFrontend(null, {task: 'article-draft'}).then((articles) => {
        articles.forEach((article) => {
            if (StringHelpers.createSlug(article.name) == article_slug) {
                idArticle = article.id;
            }
        })
    })
    let articleDetailDraft = [];
    await ArticleModel.listArticlesFrontend({id: idArticle}, {task: 'article-detail-draft'}).then((article) => {
        articleDetailDraft = article;
    });


    res.render(`${folderView}index`, {
        layout: layoutFrontend,
        pageTitle,
        //top_post: false,
        article: articleDetailDraft[0]
    });
});

module.exports = router;