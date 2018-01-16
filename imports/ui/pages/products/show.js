import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';
import './show.html';

import { Products } from '../../../api/products.js';

Template.Products_show.onCreated(function() {
    this.id = function() {
        return FlowRouter.getParam('id');
    };

    this.autorun(() => {
        this.subscribe(
            'products.detail',
            this.id()
        );
    });
});

Template.Products_show.helpers({
   product() {
       return Products.findOne();
   }
});