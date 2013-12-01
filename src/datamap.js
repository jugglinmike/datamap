(function (root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.DataMap = factory();
	}
}(this, function() {

'use strict';

var hasDefineProp = (function() {
	var obj = {};
	try {
		Object.defineProperty(obj, 'test', {
			get: function() { return true; },
		});
	} catch(err) {
		return false;
	}
	return !!obj.test;
})();

var toString = Object.prototype.toString;
var isArray = Array.isArray || function(value) {
	return value && typeof value == 'object' &&
		typeof value.length == 'number' &&
		toString.call(value) == '[object Array]' || false;
};

// wrapData
// Given a data point, return an object with customized accessors for each
// of the chart's data attributes.
var wrapDataImpls = {
	ES5: function(dataPoint) {
		if (typeof dataPoint !== 'object') {
			return dataPoint;
		}
		var dataProxy = Object.create(this.proxy);

		if (dataPoint instanceof DataProxy) {
			// TODO: Ensure that the data proxy inherits from both the data
			// point and the instance's data proxy.
			dataProxy = Object.create(dataPoint);
		}
		dataProxy._dataPoint = dataPoint;

		return dataProxy;
	},
	legacy: function(dataPoint) {
		var dataProxy, getter, dataMapping;

		if (typeof dataPoint !== 'object') {
			return dataPoint;
		}
		// TODO: Ensure that the legacy implementation also handles
		// recursively-defined data proxies.
		dataProxy = {};

		dataMapping = this._dataMapping;

		if (!dataMapping) {
			this.attrs.forEach(function(key) {
				dataProxy[key] = dataPoint[key];
			});
		} else {
			this.attrs.forEach(function(key) {
				getter = dataMapping[key];
				if (getter) {
					dataProxy[key] = getter.call(dataPoint);
				} else {
					dataProxy[key] = dataPoint[key];
				}
			}, this);
		}

		return dataProxy;
	}
};

var wrapData = wrapDataImpls[ hasDefineProp ? 'ES5' : 'legacy' ];

// We only need a basic object literal to use a data proxy, but instantiating
// it with a custom constructor allows us to more intuitively detect instances
// of data proxies in `wrapData`.
function DataProxy() {}

// createDataProxy
// Initialize a proxy object to facilitate data mapping
var createDataProxy = function(attributes) {
	var proxy = new DataProxy();

	if (attributes) {
		attributes.forEach(function(attr) {
			var getter = function() {
				return this._dataPoint[attr];
			};

			if (hasDefineProp) {
				Object.defineProperty(proxy, attr, {
					get: getter,
					configurable: true
				});
			} else {
				proxy[attr] = getter;
			}
		}, this);
	}

	return proxy;
};

function DataMap(attrs) {
	this.attrs = attrs;
	this.proxy = createDataProxy(attrs);
}

DataMap.prototype.map = function(table) {
	if (!hasDefineProp) {
		this._dataMapping = table;
	} else {
		Object.keys(table).forEach(function(attr) {
			Object.defineProperty(this.proxy, attr, {
				get: function() {
					return table[attr].call(this._dataPoint);
				}
			});
		}, this);
	}
};

DataMap.prototype.wrap = function(input) {
	if (isArray(input)) {
		return input.map(wrapData, this);
	}
	return wrapData.call(this, input);
};

return DataMap;

}));
