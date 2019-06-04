var express = require('express');
var router = express.Router();



const ParamsHelpers = require(__path_helpers + 'params');
const UtilsHelpers = require(__path_helpers + 'utils');
const UserModel = require(__path_models + 'users');
const CategoryModel = require(__path_models + 'categories');
const ValidateUser = require(__path_validates + 'administrator/users');
const notify = require(__path_configs + 'notify');

const folderView = __path_views_backend + 'pages/administrator/users/';
const systemConfig = require(__path_configs + 'system');
const linkIndex = '/' + systemConfig.prefixAdministrator + '/users';

let setting_time_publish = false;

const moduleTitle = 'PHÂN HỆ QUẢN TRỊ VIÊN';
const pageTitle = 'Danh sách người dùng';
const pageTitleEdit = 'Sửa đổi người dùng';


router.get('(/position/:position)?', async (req, res, next) => {
  let params = {};
  params.keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
  params.currentPosition = ParamsHelpers.getParam(req.params, 'position', 'all');
  let statusFilter = await UtilsHelpers.createFilterStatus(params.currentPosition, 'users');
  //params.sortField = ParamsHelpers.getParam(req.session, 'sort_field', 'name');
  //params.sortType = ParamsHelpers.getParam(req.session, 'sort_type', 'asc');


  params.pagination = {
    totalItems: 1,
    totalItemsPerPage: 5,
    currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
    pageRanges: 5
  }

  await UserModel.countUsers(params).then((number) => {
    params.pagination.totalItems = number;
  });

  UserModel.listUsers(params).then((data) => {
    res.render(`${folderView}list`, {
      moduleTitle,
      pageTitle,
      data,
      statusFilter,
      params,
      setting_time_publish
    });
  });
});

router.get('/change-status/:id/:status', (req, res, next) => {
  let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'active');
  let id = ParamsHelpers.getParam(req.params, 'id', '');

  UserModel.changeStatus(id, currentStatus).then(() => {
    req.flash('success', notify.CHANGE_STATUS_SUCCESS);
    res.redirect(linkIndex);
  });
});


router.get('/delete/:id', (req, res, next) => {
  let id = ParamsHelpers.getParam(req.params, 'id', '');

  UserModel.deleteUser(id).then(() => {
    req.flash('success', notify.DELETE_SUCCESS);
    res.redirect(linkIndex);
  });
});


router.get('/form(/:id)?', async (req, res, next) => {
  let id = ParamsHelpers.getParam(req.params, 'id', '');
  let errors = null;


  let listCategories = [];
  await CategoryModel.listCategoriesInSelectbox().then((data) => {
    listCategories = data;
    listCategories.unshift({ _id: 'novalue', name: 'Chọn chuyên mục' });
  })


  UserModel.getUser(id).then((user) => {
    if (user.category.id == undefined) {
      user.category = {
        id: '',
        name: ''
      }
    }
    user.status = (user.status == 'Hoạt động') ? 'active' : 'inactive';
    res.render(`${folderView}form`, {
      moduleTitle,
      pageTitle: pageTitleEdit,
      user,
      errors,
      listCategories,
      setting_time_publish
    });
  })
});

router.post('/save', async (req, res, next) => {
  req.body = JSON.parse(JSON.stringify(req.body));
  ValidateUser.validator(req);
  let user = Object.assign(req.body);
  let errors = req.validationErrors();

  if (user.position != 'Biên tập viên') {
    if (errors.length > 0) {
      errors.forEach((error) => {
        if (error.param == 'category_id') {
          errors.pop();
        }
      })
    }
    user.category_id = '';
    user.category_name = '';
  }
  
  user.category = {
    id: user.category_id,
    name: user.category_name
  }

  if (errors.length > 0) {
    let listCategories = [];
    await CategoryModel.listCategoriesInSelectbox().then((data) => {
      listCategories = data;
      listCategories.unshift({ _id: 'novalue', name: 'Chọn chuyên mục' });
    })

    res.render(`${folderView}form`, { 
      moduleTitle,
      pageTitle: pageTitleEdit, 
      user, 
      errors, 
      listCategories,
      setting_time_publish 
    });
  } else {
    UserModel.saveUser(user, { task: 'edit' }).then(() => {
      req.flash('success', notify.EDIT_SUCCESS);
      res.redirect(linkIndex);
    });
  }
});

module.exports = router;