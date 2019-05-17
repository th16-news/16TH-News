const TagModel = require(__path_schemas + 'tags');

module.exports = {
    listTags: (params, options = null) => {
        let objWhere = {};
        //if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        
        
        //if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        //let sort = {};
        //sort[params.sortField] = params.sortType;
      
        return TagModel
                .find(objWhere)
                .select('name status')
                //.sort(sort)
    },

    listTagsInSelectbox: () => {
        return TagModel.find({}, {_id: 1, name: 1});
    },

    changeStatus: (id, currentStatus) => {
        let status = (currentStatus === "active") ? "Không hoạt động" : "Hoạt động";
        let data = {
            status
        }
        return TagModel.updateOne({_id: id}, data);
    },

    deleteTag: (id) => {
        return TagModel.deleteOne({_id: id});
    },

    saveTag: (tag) => {
        let data = {
            name: tag.name,
            status: (tag.status === "active") ? "Hoạt động" : "Không hoạt động"
        }
        return new TagModel(data).save();
    }
}