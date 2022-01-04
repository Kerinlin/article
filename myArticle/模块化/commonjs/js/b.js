console.log('b 执行开始');
module.exports.b = 11;
console.log(`引入a`);
const a = require('./a');
console.log(`b模块中引入a模块中的a ${a.a}`);
module.exports.b = 22;