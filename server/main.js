import '/imports/startup/both';
import { Count } from '../imports/api/products';

Meteor.startup(() => {
    // 初始化计数器
    const cnt = Count.findOne({ flag: 'product' });
    if (!cnt) {
        Count.insert({ flag: 'product', count: 0 });
    }
});
