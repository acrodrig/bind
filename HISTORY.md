0.4.0 / 2015-05-22
==================

- Reorganized the README.md page to have a TOC and make sure all the examples run correctly
- Created demo page based on documentation to maintain both in sync
- Created function `bind.YN` which will return `bind.YES` or `bind.NO` based on the first parameter being "truthy"
- Resolved bug on function values (was falling through if/else)


0.3.0 / 2015-05-22
==================

- Events bind `this` in the same way that jQuery does. A little too much magic but render code easier to read
- Breaking Change: realizing that an elegant way to add :before and :after text is to use those selectors, the property operator was changed to `&`
- Pass selected element to the function evaluation


0.2.0 / 2015-05-22
==================

- Recognize attribute `reset` (before elements were always reset which is not good for performance)
- Added proper support for properties, not just attributes (`@` is used for attributes, `:` for properties)
- Added support for known events (attributes with a known event name and function value will be added via `addEventListener`)


0.1.0 / 2015-01-12
==================

- Initial release
