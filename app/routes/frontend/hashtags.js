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
    let nameTag = '';
    await TagModel.listTags().then((tags) => {
        tags.forEach((tag) => {
            if (StringHelpers.createSlug(tag.name) == tag_slug) {
                nameTag = tag.name;
            }
        })
    })
    let articleInTag = [];
    await ArticleModel.listArticlesFrontend({name: nameTag}, {task: 'article-in-tag'}).then((article) => {
        articleInTag = article;
    });


    res.render(`${folderView}index`, {
        layout: layoutFrontend,
        pageTitle,
        //top_post: false,
        articleInTag,
        nameTag
    });
});

module.exports = router;