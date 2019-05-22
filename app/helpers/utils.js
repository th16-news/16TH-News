module.exports = {
    createFilterStatus: async (currentStatus, collection, category = null, options = null) => {
        const Model = require(__path_schemas + collection);
        let filter = [
            { name: 'Tất cả', value: 'all', count: 0, class: 'default' },
            { name: 'Đã xuất bản', value: 'published', count: 0, class: 'default' },
            { name: 'Đã được duyệt', value: 'browsed', count: 0, class: 'default' },
            { name: 'Chưa được duyệt', value: 'not_browsed', count: 0, class: 'default' },
            { name: 'Bị từ chối', value: 'refused', count: 0, class: 'default' }
        ];

        if (options == 'Quản trị viên') {
            filter.splice(3);
        }

        for (let index = 0; index < filter.length; index++) {
            let item = filter[index];
            let condition = '';
            if (category == null) {
                condition = (item.value !== "all") ? { status: item.name } : {};
            } else {
                condition = (item.value !== "all") ? { status: item.name, category } : { category };
            }
            if (item.value === currentStatus) filter[index].class = 'success';
            await Model.countDocuments(condition).then((number) => {
                filter[index].count = number;
            });
        };
        if (options == 'Quản trị viên') {
            filter[0].count = filter[1].count + filter[2].count;
        }
        return filter;
    }
}