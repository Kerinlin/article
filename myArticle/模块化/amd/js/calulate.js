define(['utils'], function(utils) {
    let cal = {
        getRectangleLength(width, height) {
            return `长${width},宽${height}的长方形的周长是 ${utils.add(width, height) * 2}`;
        }
    }
    return cal;
});