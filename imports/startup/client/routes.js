/**
 * 前端路由
 */

import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// 模板文件
import '../../ui/layout/body.js';
import '../../ui/pages/products/list.js';
import '../../ui/pages/products/add.js';
import '../../ui/pages/products/show.js';

/**
 * 路由
 */
// 产品列表
FlowRouter.route('/products', {
    name: 'Products.list',
    action() {
        BlazeLayout.render('App_body', { main: 'Products_list' });
    },
});

// 添加产品
FlowRouter.route('/products/add', {
    name: 'Products.add',
    action() {
        BlazeLayout.render('App_body', { main: 'Products_add' });
    }
});

// 编辑产品
FlowRouter.route('/products/:id/edit', {
    name: 'Products.edit',
    action() {
        BlazeLayout.render('App_body', { main: 'Products_add' });
    }
});

//详情
FlowRouter.route('/products/:id', {
    name: 'Products.show',
    action() {
        BlazeLayout.render('App_body', { main: 'Products_show' });
    }
});