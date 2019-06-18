const ParamsHelpers = require(__path_helpers + 'params');
const StringHelpers = require(__path_helpers + 'strings');
const UserModel = require(__path_schemas + 'users');
const uploadFolder = 'public/uploads/users/';



module.exports = {
    listUsers: (params) => {
        let objWhere = {};
        if (params.currentPosition !== 'all') objWhere.position = StringHelpers.translate_position(params.currentPosition);
        if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return UserModel
                .find(objWhere)
                .sort({ request_adjourn: -1 })
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

    getUserByEmail: (email) => {
        return UserModel
            .find({ status: 'Hoạt động', email: email })
            .select('id name email password')
    },

    getAllUsersByEmail: (email) => {
        return UserModel
            .find({email: email })
    },

    getAllUsersByToken: (resetPasswordToken, resetPasswordExpires) => {
        return UserModel
            .find({resetPasswordToken: resetPasswordToken, resetPasswordExpires: resetPasswordExpires })
    },

    getUserByUsername: (username) => {
       return UserModel
       .find({ status: 'Hoạt động', username: username })
        .select('id username email password')
    },

    getUserByUsernameForgetPassword: (username) => {
        return UserModel
        .find({ username: username })
         .select('username email password')
    },

    getUserByUsernameChangePassword: (username) => {
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
        await UserModel.findById(id).then((user) => {
              FileHelpers.remove(uploadFolder, user.avatar);
        });
        return UserModel.deleteOne({_id: id});
    },

    saveUser: (user, options = null) => {
        if (options.task == "add") {
            user.status = 'Hoạt động';
            user.position = 'Đọc giả';
            user.renewal_date = Date.now() + 7*24*3600*1000;
            user.request_adjourn = false;
            return new UserModel(user).save();
        }
        if (options.task == "edit") {
            return UserModel.updateOne({_id: user.id}, {
                position: user.position,
                status: (user.status == 'active') ? 'Hoạt động' : 'Không hoạt động',
                category: user.category,
                renewal_date: (user.position == 'Đọc giả') ? (Date.now() + 7*24*3600*1000) : undefined,
                request_adjourn: (user.position == 'Đọc giả') ? false : undefined
            });
        }
        if (options.task == "edit-password") {
            return UserModel.updateOne({_id: user.id}, {
                password: user.password,
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined
            });
        }
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
        if (options.task == "edit-token") {
            return UserModel.updateOne({ _id: user.id }, {
                resetPasswordToken: user.resetPasswordToken,
                resetPasswordExpires: user.resetPasswordExpires
            });
        }
        if (options.task == "edit-request-adjourn") {
            return UserModel.updateOne({ _id: user.id }, {
                request_adjourn: true
            });
        }
        if (options.task == "edit-adjourn") {
            return UserModel.updateOne({ _id: user.id }, {
                request_adjourn: false,
                renewal_date: Date.now() + 7*24*3600*1000,
                status: 'Hoạt động'
            });
        }
    }
}