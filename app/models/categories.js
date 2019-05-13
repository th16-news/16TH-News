const CategoryModel = require(__path_schemas + 'administrator/categories');

module.exports = {
    listCategories: (params, options = null) => {
        let objWhere = {};
        //if (params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        
        
        //if (params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        //let sort = {};
        //sort[params.sortField] = params.sortType;
      
        return CategoryModel
                .find(objWhere)
                .select('name status');
                //.sort(sort)
                //.skip((params.pagination.currentPage-1)*(params.pagination.totalItemsPerPage))
                //.limit(params.pagination.totalItemsPerPage);
    },

    changeStatus: (id, currentStatus) => {
        let status = (currentStatus === "active") ? "Không hoạt động" : "Hoạt động";
        let data = {
            status
        }
        return CategoryModel.updateOne({_id: id}, data);
    },

    deleteCategory: (id) => {
        return CategoryModel.deleteOne({_id: id});
    },

    saveCategory: (category) => {
        let data = {
            name: category.name,
            status: (category.status === "active") ? "Hoạt động" : "Không hoạt động"
        }
        return new CategoryModel(data).save();
    }
}