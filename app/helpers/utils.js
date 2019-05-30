module.exports = {
    createFilterStatus: async (currentStatus, collection, category = null, options = null) => {
        const Model = require(__path_schemas + collection);
        if (collection != 'users') {
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
        } else {
            let filter = [
                { name: 'Tất cả', value: 'all', count: 0, class: 'default' },
                { name: 'Đọc giả', value: 'subscriber', count: 0, class: 'default' },
                { name: 'Phóng viên', value: 'writer', count: 0, class: 'default' },
                { name: 'Biên tập viên', value: 'editor', count: 0, class: 'default' },
                { name: 'Quản trị viên', value: 'administrator', count: 0, class: 'default' }
            ];
    
            for (let index = 0; index < filter.length; index++) {
                let item = filter[index];
                let condition = (item.value !== "all") ? { position: item.name } : {};
                if (item.value === currentStatus) filter[index].class = 'success';
                await Model.countDocuments(condition).then((number) => {
                    filter[index].count = number;
                });
            };
            return filter;
        }
        
    }
}