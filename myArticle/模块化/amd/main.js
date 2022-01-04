require.config({
    paths: {
        cal: './js/calulate',
        utils: './js/util'
    }
})

require(['cal'], function(cal) {
    let val = cal.getRectangleLength(20, 30);
    console.log(val); //100
})

require(['utils'], function(utils) {
    console.log(`8+5=${utils.add(8, 5)}`);
    console.log(`8-5=${utils.minus(8, 5)}`);
    console.log(`8*5=${utils.multiply(8, 5)}`);
    console.log(`8/5=${utils.divide(8, 5)}`);
})