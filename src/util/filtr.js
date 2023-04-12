/**
 * @description:这个函数过滤掉对象中所有不是函数的属性，返回一个只包含剩余属性的新对象。
 * @param {object} obj - 需要过滤的对象
 * @returns {object} - 只包含非函数属性的新对象
 **/
function filtr(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    if (typeof obj[key] !== "function") {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

module.exports = filtr;
