/**
 * es 请求客户端
 */
import { Meteor } from 'meteor/meteor';
import path from 'path';

if (!Meteor.isServer) {
    throw new Error('can only load from server end');
}

const request = require('urllib-sync').request;

const baseUrl = 'http://localhost:9200/';
const index = 'meteor';
const type = 'products';

function query(keyword = '', price = [], page = 1, pageSize = 20) {
    let config = {};
    config['baseUrl'] = config['baseUrl'] || baseUrl;
    config['index'] = config['index'] || index;
    config['type'] = config['type'] || type;

    const url = config['baseUrl'] + path.join(config['index'], config['type'], '_search');

    let filter = {
        size: pageSize,
        from: (page - 1) * pageSize,
        explain: true
    };

    if (price.length && price[0] === null && price[1] === null) {
        price = [];
    }

    let priceFilter = null;
    if (price && price.length) {
        let range = {};
        if (typeof price[0] === 'number') {
            range['gte'] = price[0];
        }
        if (typeof price[1] === 'number') {
            range['lte'] = price[1];
        }

        priceFilter = {
            'range': { price: range }
        };
    }

    // 搜索 name 和 desc，name 相关性高于 desc
    keywordFilter = null;
    if (keyword) {
        keywordFilter = [
            {
                'match': { 'name': { query: keyword, boost: 6, minimum_should_match: '50%' } }
            },
            {
                'match': {
                    'desc': {
                        query: keyword,
                        minimum_should_match: '50%'
                    }
                }
            }
        ];
    }

    if (priceFilter || keywordFilter) {
        filter['query'] = { 'bool': {} };

        if (priceFilter && keywordFilter) {
            filter['query']['bool'] = {
                must: [
                    priceFilter,
                    {
                        bool: {
                            should: keywordFilter
                        }
                    }
                ]
            };
        } else if (priceFilter) {
            filter['query']['bool']['filter'] = priceFilter;
        } else if (keywordFilter) {
            filter['query']['bool']['should'] = keywordFilter;
        }
    }

    // 发起同步请求
    const result = request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: filter,
        dataType: 'json'
    });

    if (!result || result['status'] !== 200) {
        return { total: 0, list: [] };
    }

    let data = {
        total: result['data']['hits']['total'],
        list: []
    };

    if (result['data']['hits']['hits'].length) {
        let list = [];
        result['data']['hits']['hits'].forEach((item) => {
            item['_source']['_id'] = item['_id'];
            list.push(item['_source']);
        });
        data['list'] = list;
    }

    return data;
}

export default query;
