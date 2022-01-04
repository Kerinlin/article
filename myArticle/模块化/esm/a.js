let counter = 1;

function add(x) {
    counter += x;
    return counter;
}

module.exports = {
    counter,
    add
}