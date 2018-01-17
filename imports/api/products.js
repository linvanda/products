import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Products = new Mongo.Collection('products');

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

        // 总数
        Counts.publish(this, 'products.list.count', Products.find(where));

        return Products.find(where, {
            limit: pageSize,
            skip: (page - 1) * pageSize,
            sort: { updatedAt: -1 }
        });
    });

    // 详情
    Meteor.publish('products.detail', function(id = '') {
        check(id, String);

        return Products.find({ _id: id });
    })
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
            createdAt: new Date(),
            updatedAt: new Date()
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
                updatedAt: new Date()
            }
        })
    },
    'products.delete'(id) {
        check(id, String);

        Products.remove(id);
    }
});
