import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Products = new Mongo.Collection('products');
// 全文搜索临时数据用
export const ProductsForSearch = new Mongo.Collection('products_search');
export const Count = new Mongo.Collection('count');

if (Meteor.isServer) {
    // 列表
    Meteor.publish('products.list', function(page = 1, pageSize = 20, name = '', price = []) {
        check(page, Number);
        check(pageSize, Number);
        check(name, String);

        let where = {};

        if (name) {
            where['name'] = new RegExp(name);
        }

        if (price && price.length) {
            let range = {};
            if (typeof price[0] === 'number' && price[0] >= 0) {
                range['$gte'] = price[0];
            }
            if (typeof price[1] === 'number' && price[1] >= 0) {
                range['$lte'] = price[1];
            }

            if (typeof range['$gte'] !== 'undefined' || typeof range['$lte'] !== 'undefined') {
                where['price'] = range;
            }
        }

        // 将总数记录起来供前端使用
        const total = (Products.find(where) || []).count();
        Count.upsert({ flag: 'product' }, { '$set': { count: total } });

        return Products.find(where, {
            limit: pageSize,
            skip: (page - 1) * pageSize,
            sort: { updatedAt: -1 }
        });
    });

    // 列表：全文搜索
    Meteor.publish('products.list.fullsearch', function(page = 1, pageSize = 20, keyword = '', price = []) {
        check(page, Number);
        check(pageSize, Number);
        check(keyword, String);

        const result = require('./elasticsearch').default(keyword, price, page, pageSize);

        let sort = 0;
        ProductsForSearch.remove({});
        result.list.forEach(item => {
            // 添加排序字段
            item['sort'] = sort++;
            ProductsForSearch.insert(item);
        });

        // 将总数记录起来供前端使用
        Count.upsert({ flag: 'product' }, { '$set': { count: result['total'] } });

        return ProductsForSearch.find({}, { sort: { sort: 1 } });
    });

    // 计数器
    Meteor.publish('products.list.count', function() {
        return Count.find({ flag: 'product' })
    });

    // 详情
    Meteor.publish('products.detail', function(id = '') {
        check(id, String);

        return Products.find({ _id: id });
    })
}

function refreshDirtyData($dirtyId) {
    if (!$dirtyId) {
        return;
    }

    if (ProductsForSearch.remove({ '_id': $dirtyId })) {
        Count.update({ flag: 'product' }, { $inc: { count: -1 } });
    }
}

Meteor.methods({
    'products.add'(name, price, desc) {
        check(name, String);
        check(price, Number);
        check(desc, String);

        Products.insert({
            name,
            price,
            desc,
            createdAt: new Date().Format("yyyy-MM-dd hh:mm:ss"),
            updatedAt: new Date().Format("yyyy-MM-dd hh:mm:ss")
        })
    },
    'products.edit'(id, name, price, desc) {
        check(id, String);
        check(name, String);
        check(price, Number);
        check(desc, String);

        Products.update(id, {
            $set: {
                name,
                price,
                desc,
                updatedAt: new Date().Format("yyyy-MM-dd hh:mm:ss")
            }
        })
    },
    'products.delete'(id) {
        check(id, String);

        Products.remove(id);

        refreshDirtyData(id);
    }
});
