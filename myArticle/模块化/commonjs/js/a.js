console.log('a 执行开始');
module.exports.a = 1;
console.log(`引入b`);
const b = require('./b');
console.log(`a模块中引入b模块中的b ${b.b}`);
module.exports.a = 2;