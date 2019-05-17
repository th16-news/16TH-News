const ParamsHelpers = require(__path_helpers + 'params');
const UserModel = require(__path_schemas + 'users');

module.exports = {
    listUsers: (params) => {
        let objWhere = {};
        //if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        //let sort = {};
        //sort[params.sortField] = params.sortType;
        //if (params.categoryID !== 'allvalue' && params.categoryID !== '') objWhere['category.id'] = params.categoryID;
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        //if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return UserModel
                .find(objWhere)
                .select('name avatar status position category.name alias email dob renewal_date')
                //.sort(sort)
                .skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                .limit(params.pagination.totalItemsPerPage);
    },

    countUsers: (params) => {
        let objWhere = {};
        //if (params.categoryID !== 'allvalue' && params.categoryID !== '') objWhere['category.id'] = params.categoryID;
        if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        //if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return UserModel.countDocuments(objWhere);
    },

    changeStatus: (id, currentStatus) => {
        let status = (currentStatus === "active") ? "Không hoạt động" : "Hoạt động";
        let data = {
            status
        }
        return UserModel.updateOne({_id: id}, data);
    },

    deleteUser: async (id) => {
        //await UserModel.findById(id).then((user) => {
        //    FileHelpers.remove(uploadFolder, user.thumb);
        //});
        return UserModel.deleteOne({_id: id});
    },

    saveUser: (user, _user) => {
        
            user.created = {
                user_id: 0,
                user_name: 'admin',
                time: Date.now()
            }
            user.group = {
                id: user.group_id,
                name: user.group_name
            }
            return new UsersModel(user).save();
        
        
    }
}