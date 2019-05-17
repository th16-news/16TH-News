const ParamsHelpers = require(__path_helpers + 'params');
const ArticleModel = require(__path_schemas + 'articles');
const FileHelpers = require(__path_helpers + 'files');
const uploadFolder = 'public/uploads/articles/';


module.exports = {
    listArticles: (params, options = null) => {
        let objWhere = {};
        //if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        //let sort = {};
        //sort[params.sortField] = params.sortType;
        //if (params.categoryID !== 'allvalue' && params.categoryID !== '') objWhere['category.id'] = params.categoryID;
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        //if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return ArticleModel
                .find(objWhere)
                .select('name thumb category.name type status expected_publish_time refuse_reason')
                //.sort(sort)
                .skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                .limit(params.pagination.totalItemsPerPage);
    },

    countArticles: (params, options = null) => {
        let objWhere = {};
        //if (params.categoryID !== 'allvalue' && params.categoryID !== '') objWhere['category.id'] = params.categoryID;
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        //if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return ArticleModel.countDocuments(objWhere);
    },

    getArticle: (id) => {
        return ArticleModel.findById(id);
    },

    changeStatus: (id, currentStatus) => {
        let status = (currentStatus === "browsed") ? "Đã xuất bản" : "Đã được duyệt";
        let data = {
            status
        }
        return ArticleModel.updateOne({_id: id}, data);  
    },

    changeArticleType: (id, currentArticleType) => {
        let type = (currentArticleType === "normal") ? "Premium" : "Thông thường";
        let data = {
            type
        }
        return ArticleModel.updateOne({_id: id}, data);  
    },

    deleteArticle: async (id) => {
        await ArticleModel.findById(id).then((article) => {
            FileHelpers.remove(uploadFolder, article.thumb);
        });
        return ArticleModel.deleteOne({_id: id});
    },

    saveArticle: (article, user, options = null) => {
        if (options.task == "add"){
            /*article.created = {
                user_id: parseInt(user.id),
                user_name: user.username,
                time: Date.now()
            }*/
            return new ArticleModel(article).save();
        }
        if (options.task == "edit"){
            return ArticleModel.updateOne({_id: article.id}, {
                name: article.name,
                thumb: article.thumb,
                category: article.category,
                tags: article.tags,
                type: article.type,
                summary: article.summary,
                content: article.content,
                /*created: {
                    user_id: parseInt(user.id),
                    user_name: user.username,
                    time: Date.now()
                }*/
            });
        }
    }
}