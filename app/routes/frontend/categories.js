var express = require('express');
var router = express.Router();

const ArticleModel = require(__path_models + 'articles');
const CategoryModel = require(__path_models + 'categories');
const StringHelpers = require(__path_helpers + 'strings');
const ParamsHelpers = require(__path_helpers + 'params');


const folderView = __path_views_frontend + 'pages/categories/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'categories';

router.get('/:category_name', async (req, res, next) => {
    let category_slug = ParamsHelpers.getParam(req.params, 'category_name', '');

    let params = {
        keyword: ''
    };

    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: 6,
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
        pageRanges: 5
    }

    let idCategory = '';
    let nameCategory = '';
    await CategoryModel.listCategories().then((categories) => {
        categories.forEach((category) => {
            if (StringHelpers.createSlug(category.name) == category_slug) {
                idCategory = category.id;
                nameCategory = category.name;
            }
        })
    })
    params.id = idCategory;

    await ArticleModel.countArticlesFrontend(params, 'categories').then((number) => {
        params.pagination.totalItems = number;
    });
    let articleInCategory = [];
    await ArticleModel.listArticlesFrontend(params, {task: 'article-in-category'}).then((article) => {
        articleInCategory = article;
    });


    res.render(`${folderView}index`, {
        layout: layoutFrontend,
        pageTitle: nameCategory,
        articleInCategory,
        params
    });
});

module.exports = router;