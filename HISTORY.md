0.4.3 / 2016-02-25
==================

- Removed `setTimeout` to do a `digest` every 200ms. If needed should be put in by the user.
- Small documentation changes


0.4.2 / 2016-02-09
==================

- Removed unused code from `bind.js`
- Added experimental code to try to do dirty checking via deep objects instead of JSON
- Added additonal tasks to `package.json` to have automatic versioning and publishing
- Added `dist` directory to store current and previous versions
- Removed minified files from `.gitignore` so that we save history of versions
- Corrected way thinsg are rendered in demo (was running into re-binding error)


0.4.1 / 2016-01-21
==================

- Made sure an error is thrown on re-binding
- Adjusted the MVC Todo example to take into account binding
- Added two-way binding based on existence of `model` property attached to DOM


0.4.0 / 2016-01-20
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
