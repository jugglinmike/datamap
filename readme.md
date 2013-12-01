# DataMap

A library for defining an abstract interface around datasets (alternatively: a
well-intentioned attempt to simplify d3.chart).

[![browser support](https://ci.testling.com/jugglinmike/datamap.png)](https://ci.testling.com/jugglinmike/datamap)

## Usage

This utility allows library authors to define an abstract "shape" for datasets.
Library consumers may have datasets that conform to a different structure. They
can use this data directly if they provide a "mapping" function.

```javascript
// (library code: setup)
// Create a datamap with the abstract attribute names:
  // ...
  this.dm = new DataMap(['time', 'space']);
  // ...

// (consumer code: configuration)
// Define a mapping that translates the abstract attribute names to the names
// that fit your data:
Library.dm.map({
  time: function() { return this.tiempo; },
  space: function() { return this.espacio; }
});

// (consumer code: data specification)
// Supply your dataset to the library
Library.draw([ { tiempo: 23, espacio: 45 } ]);

// (library code: dereferencing)
// Wrap incoming data to normalize its "shape":
  draw: function(userData) {
    var normalized = this.dm.wrap(userData);
    normalized.time; // => 23
    normalized.space; // => 45
  }
```

## License

Copyright (c) 2013 Mike Pennisi  
Licensed under the MIT license.
