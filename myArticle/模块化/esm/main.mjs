// const mod = require('./a.js');

// let count = mod.add(5);
// console.log(`${count}`); //6
// console.log(`${mod.counter}`); //1
import { add, counter } from "./a.mjs"
let count = add(5);
console.log(`${count}`); //6
console.log(`${counter}`); //6