Bind JS
=======

Fast, unobstrusive and simple Javascript Templating and Binding. Directly influenced by [Pure](http://beebole.com/pure/)
and [MooTools](http://zealdev.wordpress.com/2008/02/22/mootools-template-engine-a-new-approach/) and reversely influenced
by [AngularJS](https://angularjs.org) and [React](http://facebook.github.io/react/). In 1.4 minified Ks.

If you end up using Bind, shoot me a line and let me know. I would love to hear use cases and suggestions on how to improve
library.


## Table of Contents

- [Goals](#goals)
- [What is Bind](#what-is-bind)
- [Why Bind](#why-bind)
- [Hello World Example](#hello-world-example)
- [Features (through Examples)](#features)
- [MVC Todos (Angular Comparison)](#mvc-todos)
- [API Documentation](#api-documentation)
- [Installing](#installing)
- [Extended Rationale (how are goals achieved)](#extended-rationale)
- [Client/Server](#client/server)
- [Known Limitations](#known-limitations)
- [Testing Bind](#testing-bind)
- [Contributing](contributing)
- [License](license)


## Goals

See the [Extended Rationale](#extended-rationale) section for an elaboration of these goals.

- Elegance
- KISS
- Pure HTML Markup
- CSS Selectors
- Compatibility
- Simple Two-Way binding (TBD)
- Speed


## What is Bind

A very small and lean binding/rendering library. Separates presentation from data very cleanly and very fast. Implements
two way binding optionally without kludges. Allows for a hooking up a statically web app to render dynamic content in a
principled and economic way.

The main ideas are:

1. Pure HTML (no `ng-bla` attributes) constitutes a (potential) template
2. Data (JSON/Javascript) data is bound through CSS selectors (i.e. put `object.name` in `div label#name` element)
3. Observe data and if it changes re-render bound template
4. Observe forms and it they change, update (simply mapped) object attributes
5. Spice CSS selectors with some syntactic sugar to make them more palatable


## Why Bind

Given the (literally) hundreds of Javascript Template Engines out there, why am I creating a new one? In short, I
believe most of them to be one or more of the following: ugly, slow, verbose, obtrusive, and/or
[Cognitive Load](http://www.nngroup.com/articles/minimize-cognitive-load/) heavy with respect to the rest of the
web stack. Most extend a server solution, or create a whole new set of concepts and vocabulary. Bind is my attempt
at cleanly extending the current concepts in HTML/Javascript/CSS in a way that flows more naturally.


## Hello World Example

Mandatory [Hello World](http://jsfiddle.net/acrodrig/e4o124g9/) example (link takes you to JSFiddle):

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


## Features

The following examples demonstrate the features (and caveats) of the engine. You can copy and paste them in first
fiddle to run them.

- [Iteration](#iteration): how to render/bind a list of items through an HTML template
- [Nested Iteration](#nested-iteration)
- [Attributes](#attributes)
- [Conditionals](#conditionals)
- [Functional Values](#functional-values)
- [Ambiguity](#ambiguity)
- [Properties](#properties)
- [Events](#events)
- [Filters](#filters)

### Iteration

Simple iteration is done via the the mapping a CSS selector to an array. Bind iterated through the array creating a new
HTML object copy for each element in the array. If the array is empty, the element is iterated through zero times,
making it in effect disappear.

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

### Nested Iteration

When filling a table, you can map nested CSS selectors to an array of objects to create a table. In this case the labels
in the first row are extracted from the first object, and then each row if filled via a nested mapping.

```html
<style>
  table { border-collapse: collapse; width: 100%; }
  table th { border: 1px solid grey; font-weight: bold; }
  table td { border: 1px solid grey; font-weight: normal; }
</style>
<table>
  <thead>
    <tr>
      <td></td>
      <th><span>COLUMN LABEL</span></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>ROW LABEL</th>
      <td>PROPERTY VALUE</td>
    </tr>
  </tbody>
</table>
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
        "table thead th": Object.keys(m[0]),
        "table tbody tr": m.map(function(o) { return {
            "th": o.first+' '+o.last,
            "td": Object.values(o)
        };})
    };}
);
```

Result:

```html
TBD
```

### Attributes

Attribute binding is done via an XSLT inspired notation, where `li@class` means the attribute `class` at the
element `li`. Note that `li[class]` means a different thing in CSS: a `li` element that *contains* an attribute `class`.

The example uses an extended selector to display physicist names in bold. The mapper combines first and last name
directly from the model.

```html
<style>.Physics { font-weight: bold; }</style>
<p>Marking all *Physicists* with bold font face:</p>
<ul>
  <li class="SCIENCE">LAST, FIRST NAME</li>
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
            "@class": s.science
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

To show or not show a value, pass a `bind.YES` or `bind.NO` value. A `bind.YES` value keeps it in,a `bind.NO` value removes it.

```html
<button id="login" onclick"login()">Login</button>
<button id="logout" onclick"logout()">Logout</button>
```

```javascript
bind(
    document.body,
    { authenticated: false },
    function(m) { return {
        "button#login": m.authenticated ? bind.NO : bind.YES,
        "button#logout": m.authenticated ? bind.YES : bind.NO
    };}
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
    function(m) { return {
        "b:nth-child(1)": m.numerator,
        "b:nth-child(2)": m.denominator,
        "b:nth-child(3)": function() { return m.numerator / m.denominator; }
    };}
);
```

Result:

```html
<p><b>72</b> &divide; <b>8</b> = <b>9</b></p>
```

Of course this example is more complicated than it needs to be for the results expected, but it makes for a good
explanation of functional values and it shows also some slightly more complex CSS attributes.


### Ambiguity

What happens if a CSS selector selects more than one element? All of them are treated equally, meaning that they are
all potential template matches, and as such they are treated. It allows for some potentially mischievous code.

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

Properties are attached to the element as direct object values (via the `&` operator). You can read more on properties here:
[The difference between attribute and property](http://jquery-howto.blogspot.mx/2011/06/html-difference-between-attribute-and.html).

This is another case of a CSS syntax extension. The selector `h1&model` is attaching the Javascript property `model` to the
DOM object for the `h1` tag. This is different than attaching an attribute via `h1@model`. In this case we leave a Javascript
model representation behind (attached to the DOM) in case we need tlo reuse it.

The example below gives a flavor of the usefulness of this feature.

```html
<h1>Hello <span>NAME</span>!</h1>
```

```javascript
bind(
    document.body,
    { last: "Smith", first: "John", country: "United States", science: "Plumbing" },
    function(m) { return {
        "h1&model": m,
        "span": (m.first+" "+m.last),
    };}
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
    };}
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

And if we click on each `li` we will get an alert with the last name of the scientist.


### Filters

Bind does not really have filters, but they can be embedded via the mapper. For example, for an `uppercase` filter:

```html
<h1>Hello <span>NAME</span>!</h1>
```

```javascript
bind(
    document.body,
    { name: "John Smith" },
    function(m) { return { "span": m.name.toUpperCase() } }
);
```

Results:

```html
<h1>Hello <span>JOHN SMITH</span>!</h1>
```


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


## API

There are two modes in the API:

- `bind(elem, model, mapper)`: use a model and a mapper to generate the mapping
- `bind(elem, mapping)`: use a mapping directly

Providing a model allows for a more principled approach, the direct mapping is the quick and dirty version. When it
is important (isn't always?) to write modular and readable code, you should prefer the first option.

If the element has the `reset` attribute, this instructs the library to keep a copy of itself and to reset itself
to the intial state each time then element is bound. It is a very useful option when using the library on GUIs.

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


## Installing

Server side to be used with Node.js:

```bash
npm install bind-js
```

Client Use to be included in a project:

```bash
curl -O http://acrodrig.github.io/bind/lib/bind.js
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


## Known Limitations

- Cannot update partial text (something like `<li>name: <%= name %></li>"`).
- Cannot update partial attributes (something like `style="color: <%= color %>; font-weight: bold;"`).
- It can become verbose to provide mapper functions for all models. On the other hand that is the nature of the MVC beast.
- No two-way binding, although as shown in the MVC Todo example below, its value can be overstated


## Testing Bind

There are unit tests that can be run by executing:

```bash
npm run test
```

They use the [Mocha](http://mochajs.org) framework, which should be installed globally via `npm`. The tests also use
[Domino](http://dominojs.org), a lightweight DOM implementation for the server as a development dependency.


## Contributing

Do the usual GitHub fork and pull request dance. Add yourself to the
contributors section of [package.json] too if you want to.


## License

Released under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
