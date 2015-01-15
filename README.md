Bind
==============================================

Fast, unobstrusive and simple Javascript Templating and Binding. Directly influenced by [Pure](http://beebole.com/pure/)
and [MooTools](http://zealdev.wordpress.com/2008/02/22/mootools-template-engine-a-new-approach/) and reversely influenced
by [AngularJS](https://angularjs.org) and [React](http://facebook.github.io/react/).


## Goals

- Elegance
- KISS
- Pure HTML Markup
- CSS Selectors
- Compatibility
- Speed


## Hello World

Mandatory [Hello World](http://jsfiddle.net/wallooza/vychn6jm/) example (link takes you to [JSFiddle](http://jsfiddle.net)):

```html
<body>
  <h1>Hello <span>NAME</span>!</h1>
  <p>My favorite fruits are:</p>
  <ul>
    <li>FRUIT</li>
  </ul>
  <p>My favorite color is: <i id="color" style="STYLE">COLOR</i></p>
  <p>Today's date is <b id="date">DATE</b></p>
</body>
```

```javascript
bind(
    document.body,
    {
        "h1 span": "John Smith",
        "li": ["Orange", "Pear", "Apple"],
        "#color": {
            ".": "green",
            ".@style": "color: green"
        },
        "b[id=date]": new Date()
    }
);
```

Results in something like:

```html
<body>
  <h1>Hello <span>John Smith</span>!</h1>
  <p>My favorite fruits are:</p>
  <ul>
    <li>Orange</li>
    <li>Pear</li>
    <li>Apple</li>
  </ul>
  <p>My favorite color is: <i id="color" style="color: green;">green</i></p>
  <p>Today's date is <b id="date">Wed Jan 14 2015 22:40:57 GMT-0600 (CST)</b></p>
</body>
```

As shown mappings can be nested (see `#color` selector), so if the value of a CSS selector is another mapping, the
context node becomes the one selected by the selector.

The ALL CAPS text in the HTML is not mandatory, it just makes the template more readable.

The mapping uses the CSS extensions allowed, which is to able to select attributes (CSS does not contemplate the
selection of attributes) and to select the current node (dot syntax or simply empty selector). The extended syntax is
inspired by the [XSLT Recommendation](http://www.w3.org/TR/xslt) (see *current* and *attribute values*).


## Why

Given the (literally) hundreds of Javascript Template Engines out there, why am I creating a new one? In short, I
believe most of them to be one or more of the following: ugly, slow, verbose, obtrusive, and
[Cognitive Load](http://www.nngroup.com/articles/minimize-cognitive-load/) heavy with respect to the rest of the
web stack. Most extend a server solution, or create a whole new set of concepts and vocabulary. Bind is my attempt
at cleanly extending the current concepts in HTML/Javascript/CSS in a way that flows more naturally.


## API

There are two modes in the API: a) using a model and a mapper, and b) using a direct mapping. Providing a model
allows for a more principled approach, the direct mapping is the quick and dirty version. When it is important to
write modular and readable code, you should prefer the first option.

### `bind(elem, model, mapper)`

Bind a DOM element `elem` to a `model`, via a `mapper` function. When the mapper function is applied to the model, it
yields a mapping - i.e. `mapping = mapper(model)`. The `mapper` function should a return an object where keys are
extended CSS selectors and the values are derived from the `model`.

#### Parameters:

- `{Element} elem`: DOM element to be bound (effectively the view)
- `{Object|Array} model`: plain JavaScript object or array (the model)
- `{Function} mapper`: function bridging the model and view (mapping between CSS selectors and values)

#### Returns:

The element `elem` now modified with the model value via the mapping.

#### Example:

```html
<body>
  <h1>Hello <span>NAME</span>!</h1>
</body>
```

```javascript
bind(
    document.body,
    { name: "John Smith" },
    function(model) { return { "h1 span": model.name }; }
);
```

### `bind(elem, mapping)`

Bind a DOM element `elem` to values expressed in a `mapping` object. The mapping is a plain object where keys are
extended CSS selectors that map to the values to be used.

#### Parameters:

- `{Element} elem`: DOM element to be bound (effectively the view)
- `{Object} mapping`: map between CSS selectors and values

#### Returns:

The element `elem` now modified with the values in the mapping.

#### Example:

```html
<body>
  <h1>Hello <span>NAME<span/>!</h1>
</body>
```

```javascript
bind(
    document.body,
    { "h1 span": "John Smith" }
);
```


## Features by Example

The following examples demonstrate the features (and caveats) of the engine. You can copy and paste them in first
fiddle to run them.

### Iteration

Mapping a CSS selector to an array will create multiple (possibly zero) versions of the element.

```html
<body>
  <h1>Hello <span>NAME</span>!</h1>
  <p>The list of your friends is:</p>
  <ul>
    <li>LAST, FIRST NAME</li>
  </ul>
</body>
```

```javascript
bind(
    document.body,
    {
         name: "John Smith",
         friends: [
             "Einstein, Albert",
             "Curie, Marie",
             "Freud, Sigmund",
             "Planck, Max",
             "Watson, James"
         ]
     },
     function(m) { return { "h1 span": m.name, "li": m.friends }; }
);
```

### Attributes

Attribute binding is done via an XSLT inspired notation, where `li@class` means the attribute `class` at the
element `li`. Note that `li[class]` means a different thing in CSS: a `li` element that *contains* an attribute `class`.

Use an extended selector to display physicist names in bold. Note that the mapper combines first and last name
directly from the model.

```html
<body>
   <style>.bold { font-weight: bold; }</style>
   <div>
    <ul>
      <li class="CLASS">LAST, FIRST NAME</li>
    </ul>
  </div>
</body>
```

```javascript
var scientists = [
    { last: "Einstein", first: "Albert", country: "Germany", science: "Physics" },
    { last: "Curie", first: "Marie", country: "Poland", science: "Chemistry" },
    { last: "Freud", first: "Sigmund", country: "Austria", science: "Neurology" },
    { last: "Planck", first: "Max", country: "Germany", science: "Physics" },
    { last: "Watson", first: "James", country: "USA", science: "Biology" }
];

bind(
    document.body,
    scientists,
    function(m) { return {
        "li": m.map(function(s) { return {
            ".": s.last + ", " + s.first,
            "@class": (s.science == "Physics" ? "bold" : "")
         }})
    }}
);
```

### Conditionals

To show or not show a value, pass a `truthy` of `falsy` value. If the value does not evaluate to `true` then the
expression will not be displayed.

```html
<body>
  <button id="login" onclick"login()">Login</button>
  <button id="logout" onclick"logout()">Logout</button>
</body>
```

```javascript
bind(
    document.body,
    { authenticated: false },
    function(m) { return  { "button#login": !m.authenticated, "button#logout": m.authenticated } }
);
```

In general you can take care of most conditionals at the data level, but it useful to know the example above works for
both elements and attributes (that is, if the attribute is `falsy` it is removed: this obviates the need for things
like `ng-disabled` in AngularJS).

### Functional Values

Functions can be used instead of values, and their return is used as the value to display.

```html
<body>
  <p><b>NUMERATOR</b> / <b>DENOMINATOR</b> = <b>QUOTIENT</b></p>
</body>
```

```javascript
bind(
    document.body,
    { numerator: 72, denominator: 8, quotient: 9 },
    function(m) {
        return  {
            "b:nth-child(1)": m.numerator,
            "b:nth-child(2)": m.denominator,
            "b:nth-child(3)": function() { return m.numerator / m.denominator; }
        }
    }
);
```

Of course this example is complicated for the results expected, but it makes for a good explanation of functional values
and it shows also some slightly more complex CSS attributes.


### Ambiguity

What happens if a CSS selector selects more than one element? All of them are treated equally.

```html
<body>
  <h1>Hello <span>NAME<span/>!</h1>
  <span>This is the last element!</span>
</body>
```

```javascript
bind(
    document.body,
    { "h1 span": "John Smith" }
);
```

Results:

```html
<body>
  <h1>Hello <span>John Smith<span/>!</h1>
  <span>John Smith</span>
</body>
```

### Deeply Nested Hierarchies

Show what is possible and how to format the model and the mapper.

### Filters


### Model and Non-String Attributes


## Extended Rationale

Since I am presenting a new JavaScript Template Engine in a crowded field, let me give a rationale, which hopefully will
convince you (in conjuntion with the examples) of the merits of the current approach. The current templating libraries
usually fall in one of three main camps:

- *ERB Type*: add to HTML a couple of interpolation tokens (usually `<%= var %>` or `${{ var }}`) (such as
  [Mustache](http://mustache.github.io), [Handlebars](http://handlebarsjs.com) and [Underscore](http://underscorejs.org)).

- *Attribute Type*: add to special attributes to HTML (like `ng-repeat` or `data-bind`). Popular choices are
  [KnockoutJS](http://knockoutjs.com) and [AngularJS](https://angularjs.org).

- *External*: They work through special objects that connect the HTML to the data objects. I think the most popular
  choice here is [PureJS](http://beebole.com/pure/). This is the route chosen by Bind, as it
  provides the cleanest separation of concerns. Another nice library is [BindJS](https://github.com/Xavi-/bind-js).

In my humble opinion (or maybe not so humble) he first two are ugly solutions. The first one (ERB style) fills HTML
with extraneous tags and it does not make the model explicit. These seem to be solutions transplanted from the server
days. The syntax becomes specially nasty once you have to do iteration or conditionals.

As for the special attributes, they *do* make the model explicit, but they force you to learn a new language which is
full of special cases to account for the many possibilities (see `ng-disabled` rationale for example).

Finally the third option is my favorite, but it is also the least popular as far as I can tell. The options out there
also have special cases for iteration and they are not as elegant as they could be if they took the model to heart.
The elegance in this approach is that iteration, conditionals, formatting, they are all driven by the data or
the mapping function.

The way that Bind attempts to fulfill its goals:

- *Elegance*: in the eye of the beholder, but hopefully it flows naturally from HTML/Javascript/CSS
- *KISS*: library is less than 50 lines of code, concepts are well known (plain objects, maps, CSS selectors, XSLT)
- *Pure HTML Markup*: there are no extraneous attributes polluting the templates, no need to learn new attributes
- *CSS Selectors*: the bridging of the model and view is done via a powerful and expressive language
- *Compatibility*: works on top of simple templates as defined [Web Components](http://webcomponents.org)
- *Speed*: uses native browser implementations like `querySelector` and DOM manipulation with caching

Additionally further down below there is a [JSPerf](http://jsperf.com) comparing Bind to different template
engines. As with all micro-benchmarks, take with a grain of salt, but at the very lease be convinced that we are in the
best tier.


## Client/Server

Bind works both in the client in the server (with a compatible DOM implementation).


## Downsides

- Cannot update partial text (something like `<li>name: <%= name %></li>"`).
- Cannot update partial attributes (something like `style="color: <%= color %>"`).
- It can become verbose to provide mapper functions for all models. On the other hand that is the nature of the MVC beast.
- No two-way binding, although as shown in the MVC Todo example below, its value can be overstated


## Testing

There are unit tests that can be run by executing `./test/bind.js`. They use the [Mocha](...) framework, which should be
installed globally via `npm`. The tests also use [Domino](...), a lightweight DOM implementation for the server.


## MVC Todo

Following the example from the [AngularJS page](https://angularjs.org), we create a similar app in JSFiddle.

http://jsfiddle.net/wallooza/rqh4dtjx/11/


## Performance

http://jsperf.com/dom-vs-innerhtml-based-templating/1004
