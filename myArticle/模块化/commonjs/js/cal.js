const a = 200;
const b = 20;

function add(x, y) {
    return x + y;
}

function minus(x, y) {
    return x - y;
}

function multiply(x, y) {
    return x * y;
}

function division(x, y) {
    return x / y;
}

const types = {
    add,
    minus,
    multiply,
    division
};

function calculator(type, x, y) {
    return types[type](x, y);
}

module.exports = {
    calculator,
    a,
    b
};