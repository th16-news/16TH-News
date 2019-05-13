// create filter article-type
module.exports = {
    createFilterArticleType: async (currentArticleType) => {
        const model = require(__path_schemas + "writer/articles");
        let filter = [
            { name: 'All', value: 'Tất cả', count: 0, class: 'default' },
            { name: 'Premium', value: 'Premium', count: 0, class: 'default' },
            { name: 'Normal', value: 'Thông thường', count: 0, class: 'default' }
        ];

        for (let index = 0; index < filter.length; index++) {
            let item = filter[index];
            let condition = (item.value !== "Tất cả") ? { article_type: item.value } : {};
            if (item.value === currentArticleType) filter[index].class = 'success';
            await model.countDocuments(condition).then((number) => {
                filter[index].count = number;
            });
        };
        return filter;
    },


    createFilterStatus: async (currentStatus, right, collection) => {
        const model = require(__path_schemas + right + "/" + collection);
        let filter = [
            { name: 'All', value: 'Tất cả', count: 0, class: 'default' },
            { name: 'Active', value: 'Hoạt động', count: 0, class: 'default' },
            { name: 'Inactive', value: 'Không hoạt động', count: 0, class: 'default' }
        ];

        for (let index = 0; index < filter.length; index++) {
            let item = filter[index];
            let condition = (item.value !== "Tất cả") ? { status: item.value } : {};
            if (item.value === currentStatus) filter[index].class = 'primary';
            await model.countDocuments(condition).then((number) => {
                filter[index].count = number;
            });
        };
        return filter;
    }
}