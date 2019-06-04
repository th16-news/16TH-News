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
                .select('name thumb category.name type status created.user_name browsed.user_name expected_publish_time refuse_reason tags')
                //.sort(sort)
                .sort({'created.time': 'desc'})
                .skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                .limit(params.pagination.totalItemsPerPage);
    },

    countArticles: (params, options = null) => {
        let objWhere = {};
        if (params.category != undefined) objWhere.category = params.category;
        if (params.currentStatus !== 'all') objWhere.status = StringHelpers.translate(params.currentStatus);
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        if (options == 'Quản trị viên' && params.currentStatus == 'all') {
            objWhere.status = { $in: ['Đã được duyệt', 'Đã xuất bản'] };
        }
        return ArticleModel.countDocuments(objWhere);
    },

    countArticlesFrontend: (params, options = null) => {
        let keyword = '';
        if (params.keyword !== '') keyword = new RegExp(params.keyword, 'i');
        if (keyword != '') {
            return ArticleModel.countDocuments({status: 'Đã xuất bản', $or: [{name: keyword}, {summary: keyword}, {content: keyword}] });
        } else if (options == 'categories') {
            return ArticleModel.countDocuments({status: 'Đã xuất bản', 'category.id': params.id });
        } else if (options == 'hashtags') {
            return ArticleModel.countDocuments({status: 'Đã xuất bản', tags: params.name });
        } else {
            return ArticleModel.countDocuments({status: 'Đã xuất bản'});
        }
    },

    listArticlesFrontend: (params = null, options = null) => {
        if (options.task == 'article-new') {
            return ArticleModel.find({status: 'Đã xuất bản'})
                        .select('name created.user_name published.time category.id category.name thumb tags summary content comments')
                        //.limit(10)
                        .sort({'published.time': 'desc'})
                        .skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                        .limit(params.pagination.totalItemsPerPage);
        }
        
        if (options.task == 'article-in-category') {
            return ArticleModel.find({status: 'Đã xuất bản', 'category.id': params.id})
                        .select('name created.user_name published.time category.id category.name thumb tags summary content comments')
                        //.limit(10)
                        .sort({'published.time': 'desc'})
                        .skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                        .limit(params.pagination.totalItemsPerPage);
        }

        if (options.task == 'article-in-tag') {
            return ArticleModel.find({status: 'Đã xuất bản', tags: params.name})
                        .select('name created.user_name published.time category.id category.name thumb tags summary content comments')
                        //.limit(10)
                        .sort({'published.time': 'desc'})
                        .skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                        .limit(params.pagination.totalItemsPerPage);
        }

        if (options.task == 'article') {
            return ArticleModel.find({status: 'Đã xuất bản'})
                        .select('name created.user_name published.time category.id category.name thumb tags summary content comments')
                        .sort({'published.time': 'desc'});
        }

        if (options.task == 'article-draft') {
            return ArticleModel.find({ $or: [{status: 'Đã được duyệt'}, {status: 'Chưa được duyệt'}] })
                        .select('name created.user_name created.time browsed.time category.id category.name status thumb tags summary content comments');
        }

        if (options.task == 'article-detail') {
            return ArticleModel.find({status: 'Đã xuất bản', _id: params.id })
                        .select('name created.user_name published.time category.id category.name thumb tags summary content comments')
                        .limit(1);
        }

        if (options.task == 'article-detail-draft') {
            return ArticleModel.find({$or: [{status: 'Đã được duyệt'}, {status: 'Chưa được duyệt'}], _id: params.id })
                        .select('name created.user_name created.time browsed.time category.id category.name status thumb tags summary content comments')
                        .limit(1);
        }

        if (options.task == 'article-random-in-category') {
            return ArticleModel.aggregate([
                { $match: { status: 'Đã xuất bản', 'category.id': params.id}},
                { $project: { name: 1, 'created.user_name': 1, 'published.time': 1, 'category.id': 1, 'category.name': 1, thumb: 1, tags: 1, summary: 1, content: 1, comments: 1}},
                { $sample: {size: 5}}
            ]);
        }

        if (options.task == 'article-in-search') {
            let keyword = new RegExp(params.keyword, 'i');
            return ArticleModel.find({status: 'Đã xuất bản', $or: [{name: keyword}, {summary: keyword}, {content: keyword}] })
                        .select('name created.user_name published.time category.id category.name thumb tags summary content comments')
                        .skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                        .limit(params.pagination.totalItemsPerPage)
        }
    },

    getArticle: (id) => {
        return ArticleModel.findById(id);
    },

    changeStatus: (id, user, currentStatus) => {
        let status = (currentStatus === "browsed") ? "Đã xuất bản" : "Đã được duyệt";
        let published = {};
        if (status == 'Đã xuất bản') {
            published = {
                user_id: user.id,
                user_name: user.username,
                time: Date.now()
            }
        } else {
            published = {
                user_id: '',
                user_name: '',
                time: ''
            }
        }
        let data = {
            status, 
            published
        }
            
        return ArticleModel.updateOne({_id: id}, data);  
    },

    deleteArticle: async (id) => {
        await ArticleModel.findById(id).then((article) => {
            FileHelpers.remove(uploadFolder, article.thumb);
        });
        return ArticleModel.deleteOne({_id: id});
    },

    addComment: (idArticle, comments_article, comment, user) => {
        comment.user_name = user.username;
        comment.user_id = user.id;
        comment.user_avatar = (user.avatar == undefined) ? '' : user.avatar;
        comment.time = Date.now();
        comments_article.push(comment);
        return ArticleModel.updateOne({_id: idArticle}, {
            comments: comments_article
        });
    },

    saveArticle: (article, user, options = null) => {
        if (options.task == "add") {
            article.created = {
                user_id: user.id,
                user_name: user.username,
                time: Date.now()
            }
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
                created: {
                    user_id: user.id,
                    user_name: user.username,
                    time: Date.now()
                }
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
                browsed: {
                    user_id: user.id,
                    user_name: user.username,
                    time: Date.now()
                }
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