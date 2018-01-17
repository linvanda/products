import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import './list.html';

import { Products } from '../../../api/products.js';

Template.Products_list.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.setDefault({
        page: 1,
        pageSize: 20,
        name: '',
        price: []
    });

    this.autorun(() => {
        this.subscribe(
            'products.list',
            this.state.get('page'),
            this.state.get('pageSize'),
            this.state.get('name'),
            this.state.get('price')
        );
    });
});

// 这些方法可以直接在模板中使用
Template.Products_list.helpers({
    products() {
        return {
            total: Counts.get('products.list.count'),
            products: Products.find().fetch()
        };
    },
    currentPage() {
        return Template.instance().state.get('page');
    },
    showFirst() {
        return Template.instance().state.get('page') > 1;
    },
    showLast() {
        const state = Template.instance().state;
        return state.get('page') * state.get('pageSize') < Counts.get('products.list.count');
    }
});

// 事件注册
Template.Products_list.events({
    'click .pager'(event) {
        const name = $(event.target).attr('data-name');
        let page = 1;

        if (!name) {
            return false;
        }

        const state = Template.instance().state;
        const max = Math.ceil(Counts.get('products.list.count') / state.get('pageSize'));
        const currPage = state.get('page');

        if (name === 'last') {
            page = max;
        } else if (name === 'prev' && currPage > 1) {
            page = currPage - 1;
        } else if (name === 'next' && currPage < max) {
            page = currPage + 1;
        }

        state.set('page', page);
    },
    'submit #search'(event) {
        event.preventDefault();
    },
    // 搜索
    'click #search-btn'() {
        const form = $('#search');

        const name = $.trim(form.find('input[name="name"]').val());
        let minPrice = parseFloat($.trim(form.find('input[name="min-price"]').val()));
        let maxPrice = parseFloat($.trim(form.find('input[name="max-price"]').val()));

        let sets = { page: 1 };

        sets['name'] = name;

        if (minPrice !== minPrice) {
            minPrice = null;
        }

        if (maxPrice !== maxPrice) {
            maxPrice = null;
        }

        sets['price'] = [minPrice, maxPrice];

        Template.instance().state.set(sets);
        console.log(Template.instance().state.get('price'));
    },
    // 重置搜索
    'click #reset-btn'() {
        const form = $('#search');
        form.find('input[name="name"]').val('');
        form.find('input[name="min-price"]').val('');
        form.find('input[name="max-price"]').val('');

        Template.instance().state.set({
            name: '',
            price: [],
            page: 1
        });
    },
    'click .delete'(event) {
        const id = $(event.target).attr('data-id');
        if (id && confirm('确定删除该产品记录吗？')) {
            Meteor.call('products.delete', id);
        }
    }
});