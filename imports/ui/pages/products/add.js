import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import './add.html'

import { Products } from '../../../api/products.js';

Template.Products_add.onCreated(function() {
    this.id = function() {
        return FlowRouter.getParam('id');
    };

    if (this.id()) {
        this.autorun(() => {
            this.subscribe(
                'products.detail',
                this.id()
            );
        });
    }
});

Template.Products_add.onRendered(function() {
    $('#product-form').validate({
        rules: {
            name: {
                required: true,
                maxlength: 60
            },
            price: {
                required: true,
                number: true,
                min: 0
            },
            desc: {
                maxlength: 2000
            }
        },
        messages: {
            name: {
                required: '请输入产品名称',
                maxlength: '名称不能超过 60 字'
            },
            price: {
                required: '请输入价格',
                number: '价格必须是有效数字',
                min: '价格必须大于 0'
            },
            desc: {
                maxlength: '产品介绍不能超过 2000 字'
            }
        }
    });
});

Template.Products_add.helpers({
    product() {
        return Template.instance().id() ? Products.findOne() : {};
    }
});

Template.Products_add.events({
    'submit #product-form'(event) {
        event.preventDefault();

        const form = $(event.target);
        const id = form.find('input[name="id"]').val();
        const name = $.trim(form.find('input[name="name"]').val());
        const price = parseFloat($.trim(form.find('input[name="price"]').val()));
        const desc = $.trim(form.find('textarea[name="desc"]').val());

        if (id) {
            Meteor.call('products.edit', id, name, price, desc);
        } else {
            Meteor.call('products.add', name, price, desc);
        }

        alert('操作成功！');
        FlowRouter.go('Products.list');
    }
});