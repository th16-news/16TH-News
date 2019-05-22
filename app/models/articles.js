const ParamsHelpers = require(__path_helpers + 'params');
const ArticleModel = require(__path_schemas + 'articles');
const TagModel = require(__path_models + 'tags');
const FileHelpers = require(__path_helpers + 'files');
const StringHelpers = require(__path_helpers + 'strings');
const uploadFolder = 'public/uploads/articles/';


module.exports = {
    listArticles: (params, options = null) => {
        let objWhere = {};
        if (params.category != undefined) objWhere.category = params.category;
        //let sort = {};
        //sort[params.sortField] = params.sortType;
        if (params.currentStatus !== 'all') objWhere.status = StringHelpers.translate(params.currentStatus);
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');

        if (options == 'Quản trị viên' && params.currentStatus == 'all') {
            objWhere.status = { $in: ['Đã được duyệt', 'Đã xuất bản'] };
        }

        return ArticleModel
                .find(objWhere)
                .select('name thumb category.name type status expected_publish_time refuse_reason')
                //.sort(sort)
                .skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                .limit(params.pagination.totalItemsPerPage);
    },

    countArticles: (params, options = null) => {
        let objWhere = {};
        if (params.category != undefined) objWhere.category = params.category;
        if (params.currentStatus !== 'all') objWhere.status = StringHelpers.translate(params.currentStatus);
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        if (options == 'Quản trị viên') {
            objWhere.status = { $in: ['Đã được duyệt', 'Đã xuất bản'] };
        }
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

    deleteArticle: async (id) => {
        await ArticleModel.findById(id).then((article) => {
            FileHelpers.remove(uploadFolder, article.thumb);
        });
        return ArticleModel.deleteOne({_id: id});
    },

    saveArticle: (article, user, options = null) => {
        if (options.task == "add") {
            /*article.created = {
                user_id: parseInt(user.id),
                user_name: user.username,
                time: Date.now()
            }*/
            return new ArticleModel(article).save();
        }
        if (options.task == "edit") {
            return ArticleModel.updateOne({_id: article.id}, {
                name: article.name,
                thumb: article.thumb,
                category: article.category,
                tags: article.tags,
                type: article.type,
                summary: article.summary,
                content: article.content,
                status: 'Chưa được duyệt',
                refuse_reason: '',
                /*created: {
                    user_id: parseInt(user.id),
                    user_name: user.username,
                    time: Date.now()
                }*/
            });
        }
        if (options.task == 'browse') {
            article.tags.forEach((item) => {
                TagModel.countTags({ name: item }).then((number) => {
                    if (number == 0) {
                        TagModel.saveTag({ name: item, status: 'active' });
                    }
                })
            })
            
            return ArticleModel.updateOne({_id: article.id}, {
                tags: article.tags,
                expected_publish_time: article.expected_publish_time,
                status: 'Đã được duyệt',
                /*browsed: {
                    user_id: parseInt(user.id),
                    user_name: user.username,
                    time: Date.now()
                }*/
            });
        }

        if (options.task == 'refuse') {
            return ArticleModel.updateOne({_id: article.id}, {
                refuse_reason: article.refuse_reason,
                status: 'Bị từ chối'
            });
        }
    }
}