module.exports = {
    getParam: (params, property, defaultValue) => {
        return (params.hasOwnProperty(property) && params[property] !== undefined) ? params[property] : defaultValue;
    }
}