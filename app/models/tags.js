const TagModel = require(__path_schemas + 'tags');

module.exports = {
    listTags: () => {
        let objWhere = {};
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

    countTags: (params) => {
        let objWhere = { name: params.name };
        return TagModel.countDocuments(objWhere);
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