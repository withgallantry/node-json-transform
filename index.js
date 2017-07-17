// DataTransform

DataTransform = function (data, map) {

    return {

        getValue: function (obj, key) {

            if (typeof(obj) == "undefined") {
                return "";
            }

            if (key == '' || key == undefined) {
                return obj;
            }

            var value = obj || data,
                key = key || map.list,
                keys = null;
            if (key == "") {
                value = "";
            } else {
                keys = key.split('.');
                for (var i = 0; i < keys.length; i++) {
                    if (typeof(value) !== "undefined" &&
                        keys[i] in value) {
                        value = value[keys[i]];
                    } else {
                        return null;
                    }
                }
            }

            return value;

        },

        setValue: function (obj, key, newValue) {

            if (typeof(obj) == "undefined") {
                return;
            }

            if (key == '' || key == undefined) {
                return;
            }

            if (key == "") {
                return;
            }

            keys = key.split('.');
            var target = obj;
            for (var i = 0; i < keys.length; i++) {
                if (i == keys.length - 1) {
                    target[keys[i]] = newValue;
                    return;
                }
                if (keys[i] in target)
                    target = target[keys[i]];
                else return;
            }
        },

        getList: function () {
            return this.getValue(data, map.list);
        },

        transform: function () {

            var value = this.getValue(data, map.list),
                normalized = {};
            if (value) {
                var list = this.getList();
                var normalized = map.item ? list.map(this.iterator.bind(this, map.item)) : list;
                normalized = this.operate.call(this, normalized);
                normalized = this.each(normalized, list);
            }
            return normalized;

        },

        operate: function (data) {

            if (map.operate) {

                map.operate.forEach(function (method) {
                    data = data.map(function (item) {
                        var fn;
                        if ('string' === typeof method.run) {
                            fn = eval(method.run);
                        } else {
                            fn = method.run;
                        }
                        this.setValue(item, method.on, fn(this.getValue(item, method.on)))
                        return item;
                    }.bind(this));
                }.bind(this));
            }
            return data;

        },

        each: function (data, list) {
            if (map.each) {
                data.map(function(newItem, index) {
                    return map.each(newItem, list[index])
                }.bind(this));
            }
            return data;
        },

        iterator: function (map, item) {

            var obj = {};

            //to support simple arrays with recursion
            if (typeof(map) == "string") {
                return this.getValue(item, map);
            }

            Object.keys(map).forEach(function(key) {

                var oldkey = map[key];
                var newkey = key;

                if (typeof(oldkey) == "string" && oldkey.length > 0) {
                    obj[newkey] = this.getValue(item, oldkey);
                } else if (Array.isArray(oldkey)) {

                    var array = oldkey.map(function(item, map) {
                        return this.iterator(map, item);
                    }.bind(this, item));


                    obj[newkey] = array;
                } else if (typeof oldkey == 'object') {
                    var bound = this.iterator.bind(this, oldkey, item);
                    obj[newkey] = bound();
                }
                else {
                    obj[newkey] = "";
                }

            }.bind(this));

            return obj;

        }

    };

};


//
