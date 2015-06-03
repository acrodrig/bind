Bind
==============================================

Fast, unobstrusive and simple Javascript Templating and Binding. Directly influenced by [Pure](http://beebole.com/pure/)
and [MooTools](http://zealdev.wordpress.com/2008/02/22/mootools-template-engine-a-new-approach/) and reversely influenced
by [AngularJS](https://angularjs.org) and [React](http://facebook.github.io/react/). In 1.4 minified Ks.


## Goals

- Elegance
- KISS
- Pure HTML Markup
- CSS Selectors
- Compatibility
- Speed


## Example

Mandatory [Hello World](http://jsfiddle.net/acrodrig/e4o124g9/) example (link takes you to [JSFiddle](http://jsfiddle.net)):

HTML:

```html
<h1>Hello <span>NAME</span>!</h1>
<p>My favorite fruits are:</p>
<ul>
  <li>FRUIT</li>
</ul>
<p>My favorite color is: <i id="color" style="STYLE">COLOR</i></p>
<p>Today's date is <b id="date">DATE</b></p>
```

Javascript:

```javascript
bind(
    document.body,
    {
        "h1 span": "John Smith",
        "li": ["Orange", "Pear", "Apple"],
        "#color": {
            "": "green",
            "@style": "color: green"
        },
        "b[id=date]": new Date()
    }
);
```

Result:

```html
<h1>Hello <span>John Smith</span>!</h1>
<p>My favorite fruits are:</p>
<ul>
  <li>Orange</li>
  <li>Pear</li>
  <li>Apple</li>
</ul>
<p>My favorite color is: <i id="color" style="color: green;">green</i></p>
<p>Today's date is <b id="date">Wed Jan 14 2015 22:40:57 GMT-0600 (CST)</b></p>
```

Mappings can be nested (see `#color` selector), so if the value of a CSS selector is another mapping, the
context node becomes the one(s) matched by the selector.

The ALL CAPS text in the HTML is where the CSS selectors should match: it makes the template more readable.

The mapping uses the CSS extensions allowed, which is to able to match attributes (CSS does not contemplate the
matching of attributes) and to match the current context node (dot syntax or simply empty selector). The extended
syntax is inspired by the [XSLT Recommendation](http://www.w3.org/TR/xslt) (see *current* and *attribute values*).


## Why

Given the (literally) hundreds of Javascript Template Engines out there, why am I creating a new one? In short, I
believe most of them to be one or more of the following: ugly, slow, verbose, obtrusive, and/or
[Cognitive Load](http://www.nngroup.com/articles/minimize-cognitive-load/) heavy with respect to the rest of the
web stack. Most extend a server solution, or create a whole new set of concepts and vocabulary. Bind is my attempt
at cleanly extending the current concepts in HTML/Javascript/CSS in a way that flows more naturally.


## Installing

Server side to be used with Node.js:

```bash
npm install bind-js
```

Client Use to be included in a project:

```bash
curl -O http://acrodrig.github.io/bind/lib/bind.js
```


## API

There are two modes in the API:

- `bind(elem, model, mapper)`: use a model and a mapper to generate the mapping
- `bind(elem, mapping)`: use a mapping directly

Providing a model allows for a more principled approach, the direct mapping is the quick and dirty version. When it
is important (isn't always?) to write modular and readable code, you should prefer the first option.

If the element has the `reset` attribute, this instructs the library to keep a copy of itself and to reset itself
to the intial state each time then element is bound. It is a very useful option when using the library on GUIs.

### `bind(elem, model, mapper, resettable)`

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
<h1>Hello <span>NAME</span>!</h1>
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
<h1>Hello <span>NAME</span>!</h1>
```

```javascript
bind(
    document.body,
    { "h1 span": "John Smith" }
);
```


## Features

The following examples demonstrate the features (and caveats) of the engine. You can copy and paste them in first
fiddle to run them.

- Iteration
- Element Text Value
- Attribute Value
- Conditionals
- Functional Values
- Ambiguity Handling
- Non-String Attributes
- Filters

### Iteration

Mapping a CSS selector to an array will create multiple (possibly zero) versions of the element.

```html
<h1>Hello <span>NAME</span>!</h1>
<p>The list of your friends is:</p>
<ul>
  <li>LAST, FIRST NAME</li>
</ul>
```

```javascript
var friends = [
    "Einstein, Albert",
    "Curie, Marie",
    "Freud, Sigmund",
    "Planck, Max",
    "Watson, James"
];

bind(
    document.body,
    { name: "John Smith", friends: friends },
    function(m) { return { "h1 span": m.name, "li": m.friends }; }
);
```

Result:

```html
<h1>Hello <span>John Smith</span>!</h1>
<p>The list of your friends is:</p>
<ul>
  <li>Einstein, Albert</li>
  <li>Curie, Marie</li>
  <li>Freud, Sigmund</li>
  <li>Planck, Max</li>
  <li>Watson, James</li>
</ul>
```


### Attributes

Attribute binding is done via an XSLT inspired notation, where `li@class` means the attribute `class` at the
element `li`. Note that `li[class]` means a different thing in CSS: a `li` element that *contains* an attribute `class`.

Use an extended selector to display physicist names in bold. Note that the mapper combines first and last name
directly from the model.

```html
<style>.bold { font-weight: bold; }</style>
<ul>
  <li class="CLASS">LAST, FIRST NAME</li>
</ul>
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

Result:

```html
<style>.bold { font-weight: bold; }</style>
<ul>
  <li class="bold">Einstein, Albert</li>
  <li class="">Curie, Marie</li>
  <li class="">Freud, Sigmund</li>
  <li class="bold">Planck, Max</li>
  <li class="">Watson, James</li>
</ul>
```


### Conditionals

To show or not show a value, pass a boolean value. A `true` value keeps it in,a `false` value removes it.

```html
<button id="login" onclick"login()">Login</button>
<button id="logout" onclick"logout()">Logout</button>
```

```javascript
bind(
    document.body,
    { authenticated: false },
    function(m) { return  { "button#login": !m.authenticated, "button#logout": m.authenticated } }
);
```

Result:

```html
<button id="login" onclick"login()">Login</button>
```

In general you can take care of most conditionals at the data level, but it useful to know the example above works for
both elements and attributes (that is, if the attribute is `false` it is removed: this obviates the need for things
like `ng-disabled` in AngularJS).

### Functional Values

Functions can be used instead of values, and their return is used as the value to display.

```html
<p><b>NUMERATOR</b> &divide; <b>DENOMINATOR</b> = <b>QUOTIENT</b></p>
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

Result:

```html
<p><b>72</b> &divide; <b>8</b> = <b>9</b></p>
```

Of course this example is more complicated than it needs to be for the results expected, but it makes for a good
explanation of functional values and it shows also some slightly more complex CSS attributes.


### Ambiguity

What happens if a CSS selector selects more than one element? All of them are treated equally.

```html
<h1>Hello <span>NAME</span>!</h1>
<span>This is the last element!</span>
```

```javascript
bind(
    document.body,
    { "span": "John Smith" }
);
```

Results:

```html
<h1>Hello <span>John Smith</span>!</h1>
<span>John Smith</span>
```

### Properties

Properties are attached to the element as direct object values. You can read more on properties here:
[The difference between attribute and property](http://jquery-howto.blogspot.mx/2011/06/html-difference-between-attribute-and.html).

The example below gives a flavor of the usefulness of this feature.

```html
<h1>Hello <span>NAME</span>!</h1>
```

```javascript
bind(
    document.body,
    { last: "Smith", first: "John", country: "United States", science: "Plumbing" },
    function(m) {
        return  {
            "h1:model": m,
            "span": (m.first+" "+m.last),
        }
    }
);
```

Results:

```html
<h1>Hello <span>John Smith<span/>!</h1>
```

After running it, the value `document.querySelector("h1").model` will be the model object. It can then be used
in events and further bindings.


### Events

Events such as `onclick` can be attached via `addEventListener` in the following fashion. The example shows how click
the first name will result in an alert with the last name.

```html
<ul>
  <li>FIRST NAME</li>
</ul>
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
            ".": s.first,
            "@onclick": function() { alert("You clicked on "+s.last); }
         }})
    }}
);
```

Result:

```html
<ul>
  <li>Albert</li>
  <li>Marie</li>
  <li>Sigmund</li>
  <li>Max</li>
  <li>James</li>
</ul>
```


### Filters

Bind does not really have filters, but they can be embedded via the mapper. For example, for an `uppercase` filter:

```html
<h1>Hello <span>NAME</span>!</h1>
```

```javascript
bind(
    document.body,
    { name: "John Smith" },
    function(m) { return  { "span": m.name.toUpperCase() } }
);
```

Results:

```html
<h1>Hello <span>JOHN SMITH</span/>!</h1>
```


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
  provides the cleanest separation of concerns.

In my opinion the first two are fairly convoluted solutions. The first one (ERB style) fills HTML
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
engines. As with all micro-benchmarks, take with a grain of salt, but at the very least be convinced that we are in the
best tier.

As the library progresses the merits of a virtual DOM (like React's) can be explored. There are things lost like
native CSS matching with this approach.


## Client/Server

Bind works both in the client in the server (with a compatible DOM implementation).


## Downsides

- Cannot update partial text (something like `<li>name: <%= name %></li>"`).
- Cannot update partial attributes (something like `style="color: <%= color %>"`).
- It can become verbose to provide mapper functions for all models. On the other hand that is the nature of the MVC beast.
- No two-way binding, although as shown in the MVC Todo example below, its value can be overstated


## Testing

There are unit tests that can be run by executing:

```bash
npm run test
```

They use the [Mocha](http://mochajs.org) framework, which should be installed globally via `npm`. The tests also use
[Domino](http://dominojs.org), a lightweight DOM implementation for the server as a development dependency.


## MVC Todo

Following the example from the [AngularJS page](https://angularjs.org), we create a similar app in
[JSFiddle](http://jsfiddle.net/acrodrig/smukmn39/). The goal of recreating this little app, is to test how close
one can get to the original functionality with Bind and how complex it is. A couple of notes:

- The code is around 50% longer
- It does not use special HTML markup, it uses the `mapper` function below to bind HTML to the model
- It has two-way binding via observing the model every 100 milliseconds (same mechanism as Angular)
- It is *mostly* understandable by people familiar with basic web development
- It is simple enough

The mapper function:

```javascript
function mapper(todos) {
    return {
        "i:nth-of-type(1)": remaining(),
        "i:nth-of-type(2)": todos.length,
        "li": todos.map(function(t, i) {
            return {
                "@model": t,
                "@index": i,
                "input@checked": (t.done ? "checked" : false),
                "span": t.text,
                "span@class": (t.done ? "done" : "")
            };
        })
    };
}
```

Notice how the `todo` model is bound to the `li` element in an explicit way.

By no means this little app is meant as proof or even claim of equivalent functionality. Angular is a big project,
with lots of functionality and features. It is meant as a simple comparison exercise to flex Bind's muscles
with respect to a well known example.
