const { calculator } = require('./js/cal.js');

console.log(`${a}+${b}=${calculator('add',a, b)}`);
console.log(`${a}-${b}=${calculator('minus',a, b)}`);
console.log(`${a}*${b}=${calculator('multiply',a, b)}`);
console.log(`${a}/${b}=${calculator('division',a, b)}`);