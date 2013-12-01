suite('DataMap', function() {
	var global = (function() { return this; }());
	var DataMap = global.DataMap || require('..');
	var assert = global.assert || require('assert');

	test('default mapping', function() {
		var dm = new DataMap(['time', 'space']);
		var input = [
			{ time: 23, space: 45, more: 1 },
			{ time: 33, space: 99, more: 2 }
		];
		var transformed = dm.wrap(input);

		assert.equal(transformed[0].time, 23);
		assert.equal(transformed[0].space, 45);
		assert.equal(transformed[0].more, undefined);
		assert.equal(transformed[1].time, 33);
		assert.equal(transformed[1].space, 99);
		assert.equal(transformed[1].more, undefined);
	});

	test('basic operation', function() {
		var dm = new DataMap(['time', 'space']);
		var input = [
			{ foo: 23, space: 45 },
			{ foo: 33, space: 99 }
		];
		dm.map({ time: function() { return this.foo; }});

		var transformed = dm.wrap(input);

		assert.equal(transformed[0].time, 23);
		assert.equal(transformed[0].space, 45);
		assert.equal(transformed[1].time, 33);
		assert.equal(transformed[1].space, 99);
	});

	test('nesting', function() {
		var dm1 = new DataMap(['series1', 'series2']);
		var dm2 = new DataMap(['time', 'space']);
		var input = {
			first: [
				{ foo: 23, space: 45 },
				{ foo: 33, space: 99 }
			],
			series2: []
		};
		dm1.map({ series1: function() { return dm2.wrap(this.first); }});
		dm2.map({ time: function() { return this.foo; }});

		var transformed = dm1.wrap(input);

		assert.equal(transformed.series1[0].time, 23);
		assert.equal(transformed.series1[0].space, 45);
		assert.equal(transformed.series1[1].time, 33);
		assert.equal(transformed.series1[1].space, 99);
	});

});
