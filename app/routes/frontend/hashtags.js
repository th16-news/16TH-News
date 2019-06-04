var express = require('express');
var router = express.Router();

const ArticleModel = require(__path_models + 'articles');
const TagModel = require(__path_models + 'tags');
const StringHelpers = require(__path_helpers + 'strings');
const ParamsHelpers = require(__path_helpers + 'params');

const folderView = __path_views_frontend + 'pages/hashtags/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'hashtags';


router.get('/:tag_name', async (req, res, next) => {
    let tag_slug = ParamsHelpers.getParam(req.params, 'tag_name', '');

    let params = {
        keyword: ''
    };

    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: 2,
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
        pageRanges: 5
    }

    let nameTag = '';
    await TagModel.listTags().then((tags) => {
        tags.forEach((tag) => {
            if (StringHelpers.createSlug(tag.name) == tag_slug) {
                nameTag = tag.name;
            }
        })
    })
    params.name = nameTag;

    await ArticleModel.countArticlesFrontend(params, 'hashtags').then((number) => {
        params.pagination.totalItems = number;
    });

    let articleInTag = [];
    await ArticleModel.listArticlesFrontend(params, {task: 'article-in-tag'}).then((article) => {
        articleInTag = article;
    });


    res.render(`${folderView}index`, {
        layout: layoutFrontend,
        pageTitle,
        //top_post: false,
        articleInTag,
        nameTag,
        params
    });
});

module.exports = router;