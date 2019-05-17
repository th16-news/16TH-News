var express = require('express');
var router = express.Router();



const ParamsHelpers = require(__path_helpers + 'params');
const UserModel = require(__path_models + 'users');

const folderView = __path_views_backend + 'pages/administrator/users/';
const systemConfig = require(__path_configs + 'system');
const linkIndex = '/' + systemConfig.prefixAdministrator + '/users';

const moduleTitle = 'PHÂN HỆ QUẢN TRỊ VIÊN';
const pageTitle = 'Danh sách người dùng';
const pageTitleEdit = 'Sửa đổi người dùng';


router.get('(/status/:status)?', async (req, res, next) => {
    let params = {};
    params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
    params.currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
    //let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus, 'users');
    //params.sortField = ParamsHelpers.getParam(req.session, 'sort_field', 'name');
    //params.sortType = ParamsHelpers.getParam(req.session, 'sort_type', 'asc');

    //params.groupID = ParamsHelpers.getParam(req.session, 'group_id', '');

    params.pagination = {
        totalItems: 1,
        totalItemsPerPage: 5,
        currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
        pageRanges: 5
    }

    await UserModel.countUsers(params).then((data) => {
        params.pagination.totalItems = data;
    });

    UserModel.listUsers(params).then((data) => {
        res.render(`${folderView}list`, {
            moduleTitle,
            pageTitle,
            data,
            //statusFilter,
            params
        });
    });
});

router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
    let id = ParamsHelpers.getParam(req.params, 'id', '');

    UserModel.changeStatus(id, currentStatus).then(() => {
        //req.flash('success', notify.CHANGE_STATUS_SUCCESS);
        res.redirect(linkIndex);
    });
});


router.get('/delete/:id', (req, res, next) => {
    let id = ParamsHelpers.getParam(req.params, 'id', '');

    UserModel.deleteUser(id).then(() => {
        //req.flash('success', notify.DELETE_SUCCESS);
        res.redirect(linkIndex);
    });
});


router.get('/form(/:id)?', async (req, res, next) => {
    //let errors = null;
    res.render(`${folderView}form`, {
        moduleTitle,
        pageTitle: pageTitleEdit,
        /*errors,*/
    })
});

router.post('/save', (req, res, next) => {
    /*uploadAvatar(req, res, async (errUpload) => {
      req.body = JSON.parse(JSON.stringify(req.body));
      let user = Object.assign(req.body);
      let taskCurrent = (typeof user !== undefined && user.id !== "") ? "edit" : "add";
   
      let errors = ValidateUsers.validator(req, errUpload, taskCurrent);
      
      if (errors.length > 0) {
        let pageTitle = (taskCurrent == "add") ? pageTitleAdd : pageTitleEdit;  
        if (req.file != undefined) {
          FileHelpers.remove('public/uploads/users/', req.file.filename);
        }
        
        let groupsUsers = [];
        await GroupsModel.listGroupsInSelectbox().then((users) => {
          groupsUsers = users;
          groupsUsers.unshift({_id: 'novalue', name: 'Choose Group'});
        });
        if (taskCurrent == "edit") {
          user.avatar = user.image_old;
        }
        res.render(`${folderView}form`, { pageTitle, user, errors, groupsUsers });
      } else {
        let message = (taskCurrent == "add") ? notify.ADD_SUCCESS : notify.EDIT_SUCCESS;
        if (req.file == undefined) {
          user.avatar = user.image_old;
        } else {
          user.avatar = req.file.filename;
          if (taskCurrent == "edit") {
            FileHelpers.remove('public/uploads/users/', user.image_old);
          }
        }
        UsersModel.saveUser(user, req.user, { task: taskCurrent }).then((result) => {
          req.flash('success', message);
          res.redirect(linkIndex);
        });
      }
    });*/



    req.body = JSON.parse(JSON.stringify(req.body));
    //ValidateCategory.validator(req);
    let user = Object.assign(req.body);
    //let errors = req.validationErrors();


    /*if (errors) {
        res.render(`${folderView}form`, { pageTitle: pageTitleAdd, user, errors });
    } else {*/
    //let message = notify.ADD_SUCCESS;
    UserModel.saveUser(user).then(() => {
        //req.flash('success', message);
        res.redirect(linkIndex);
    });
    //}
});

module.exports = router;