const ParamsHelpers = require(__path_helpers + 'params');
const StringHelpers = require(__path_helpers + 'strings');
const UserModel = require(__path_schemas + 'users');


module.exports = {
    listUsers: (params) => {
        let objWhere = {};
        //let sort = {};
        //sort[params.sortField] = params.sortType;
        if (params.currentPosition !== 'all') objWhere.position = StringHelpers.translate_position(params.currentPosition);
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return UserModel
                .find(objWhere)
                .select('name avatar status position category.name alias email dob renewal_date username')
                //.sort(sort)
                .skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                .limit(params.pagination.totalItemsPerPage);
    },

    getUser: (id) => {
        return UserModel.findById(id);
    },

    countUsers: (params) => {
        let objWhere = {};
        if (params.currentPosition !== 'all') objWhere.position = StringHelpers.translate_position(params.currentPosition);
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return UserModel.countDocuments(objWhere);
    },

    countUsersRegister: (input, option) => {
        if (option == 'username') {
            return UserModel.countDocuments({ username: input.username});
        } else if (option == 'email') {
            return UserModel.countDocuments({ email: input.email});
        } else if (option == 'password') {
            return UserModel.countDocuments({ password: input.password});
        }
    },

    getUserByUsername: (username) => {
       return UserModel
       .find({ status: 'Hoạt động', username: username })
        .select('username email password')
    },

    getUserByUsernameForgetPassword: (username) => {
        return UserModel
        .find({ username: username })
         .select('username email password')
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

    saveUser: (user, options = null) => {
        if (options.task == "add") {
            user.status = 'Hoạt động';
            user.position = 'Đọc giả';
            return new UserModel(user).save();
        }
        if (options.task == "edit") {
            return UserModel.updateOne({_id: user.id}, {
                position: user.position,
                status: (user.status == 'active') ? 'Hoạt động' : 'Không hoạt động',
                category: user.category
            });
        }
        /*if (options.task == "edit-password") {
            return UserModel.updateOne({_id: user.id}, {
                password: user.password
            });
        }*/
        if (options.task == "edit-info") {
            return UserModel.updateOne({_id: user.id}, {
                username: user.username,
                avatar: user.avatar,
                name: user.name,
                alias: user.alias,
                email: user.email,
                dob: user.dob
            });
        }
    }
}