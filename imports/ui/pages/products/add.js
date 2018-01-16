import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import  'jquery-validation';
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

    // 表单验证
});

Template.Products_add.helpers({
    product() {
        return Template.instance().id() ? Products.findOne() : {};
    }
});

Template.Products_add.events({
    'submit #product-form'(event) {
        const form = $(event.target);
        const id = form.find('input[name="id"]').val().trim();
        const name = form.find('input[name="name"]').val().trim();
        const price = parseFloat(form.find('input[name="price"]').trim());
        const desc = form.find('textarea[name="desc"]').val().trim();

        if (id) {
            // Meteor.call('products.edit', id, name, price, desc);
            alert('操作成功！');
            // FlowRouter.back();
        } else {

        }
    }
});