BindJS: Javascript Templating and Binding
==============================================

# Introduction

There are a lot of [Javascript Template](http://en.wikipedia.org/wiki/JavaScript_templating) engines out there.
[AngularJS](https://angularjs.org) is pretty popular these days and provides templating plus two-way data binding. If
you look online, you will see tons of articles debating the merits of the many engines available. I am presenting
a new one, so I must have a good reason to do so. Let me try to give a rationale, which hopefully with the examples
below will convince you of the merits.

The templating libraries usually fall in one of three main camps:

- *ERB Type*: They add to HTML a couple of interpolation tokens (usually `<%= var %>` or `${{ var }}`). The ones that
  fall into this category are [Mustache](http://mustache.github.io), [Handlebars](http://handlebarsjs.com),
  [Underscore](http://underscorejs.org) and others.

- *Attribute Type*: They add to special attributes to HTML (like `ng-repeat` or `data-bind`). Popular choices are
  [KnockoutJS](http://knockoutjs.com) and [AngularJS](https://angularjs.org).

- *External*: They work through special objects that connect the HTML to the data objects. I think the most popular
  choice here is [PureJS](http://beebole.com/pure/). As you will see, this is the route chosen by BindJS, as it
  provides the cleanest separation of concerns. Another nice library is [BindJS](https://github.com/Xavi-/bind-js).

In my humble opinion the first two are ugly solutions. The first one (ERB style) fills HTML with extraneous tags and
it does not make the model explicit. This one becomes specially nasty once you have to do iteration or conditionals
(display ugly example). As for the special attributes, they *do* make the model explicit, but they force you to learn
a new language and it's full of special cases to account for the many possibilities. Finally the third option is my
favorite, but it is also the least popular as far as I can tell. The options out there also have special cases for
iteration and they are not as elegant as they could be if they took the model followed by this MooTools binding
library. The elegance in this approach is that iteration, conditionals, formatting, they are all driven by the data or
the mapping function.


# Objectives

The objectives of BindJS are as follow:

- *Simplicity*: be as simple as possible, do one thing well and only one thing.

- *No extraneous markup/attributes*: templates should be HTML, with no extraneous markup and/or attributes. People already
  know HTML well, we should not force them to learn a new language (much like AngularJS does). This also helps when
  considering the next objective.

- *Compatibility*: be compatible (and build on top of) to new Web technologies such [Web Components](http://webcomponents.org).
  By working on top of plain HTML templates, Bind hopes to achieve this.

- *Use CSS selectors*: instead of generating new markups, use CSS selectors as the external way to link the data to the
  HTML. Since all developers already use CSS selectors, they are familiar with them and know how to reach the DOM nodes
  they need via this mechanism.

- *Separation of Concerns*: separate the HTML to display from the data (and the manipulation of the data) that is to
  populate the template. By explicitly enumerating what the view and the model are, a nice MVC structure can be built.

- *Server and Client*: work both on the client and in the server.

- *Fast*: render as fast as possible. This is a work in progress as implementing a Virtual DOM (such as React) is planned.
  But as it is, it already competes with other engines.


# Hello World

The mandatory [Hello World](http://jsfiddle.net/wallooza/ntj4pokz/) example (the link takes you to JSFiddle):

```html
<body>
  <div>
    <h1>Hello <span>NAME<span>!</h1>
  </div>
</body>
```

```javascript
bind(
    document.body,
    { name: "John Smith" },
    function(m) { return { "h1 span": m.name }; }
);
```

Note the following:

- The `NAME` tag in the original template is replaced by the binding and as such could be anything. Specifically
  it could be used to document the template with comments like `(Here goes the name)` or something like that.
- We use the CSS selector `h1 span` to bind the name in the JSON document.
- We use the `body` as the top element, but we could just as well have used `document.querySelector("div")` or even
  something like `document.querySelector("body div div h1")`.


# API

The API is simple, it's the function `bind`. It receives a DOM element, a model and a mapper.

```javascript
bind(node, model, mapper)
```

## Parameters

- `node`: a DOM node to be used as the template
- `model`: a plan JavaScript object or array to serve as the model. For example `{ name: "John Smith" }`.
- `mapper`: a function that when applied to the model, gives us a mapping between CSS selectors and values.

## Returns

The function returns a


## Direct Mapping

Sometimes there is no need for a full blown model, and you just want a simple templating system with a direct mapping.
Note that in the general case, the mapping is the application of the mapper to the model:

    mapping = mapper(model)

We can then supply the `mapping` directly as the model. For example in the example above, the mapping would be:

```javascript
bind(
    document.body,
    { "h1 span": "John Smith" }
);
```

It is up to you to judge whether including a full model is in your interest or not. In general, if the data is
coming from a different source (for example a REST API) then it is a good idea to use a mapper function, so that
every time the data changes, the mapper can be applied again.


# Examples

## Iteration

The example below shows how to iterate (repeat) over a simple list of values. It is as simple as passing an array to
a selector. If the value is an array, that is the cue that `bind` uses to iterate over.

```html
<body>
  <div>
    <h1>Hello <span>NAME<span>!</h1>
    <p>The list of your friends is:</p>
    <ul>
      <li>LAST, FIRST NAME</li>
    </ul>
  </div>
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

## Attributes

In order to bind attributes we use an XSL inspired notation, where `li@class` means the attribute `class` at the
element `li`. Note that we do not use `li[class]` because that means a different thing in CSS: a `li` element that
contains an attribute `class`.

The following example builds on the previous one to make the name of physicist in the list appear in bold.
It also shows how to combine values (`first` and `last`) to create a more complex value. Finally, note that CSS
selectors are relative to the selected node: once inside `li`, the empty string is the node itself and the attribute
does not need a qualifier before it.

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
            "": s.last + ", " + s.first,
            "@class": (s.science == "Physics" ? "bold" : "")
         }})
    }}
);
```

## Conditionals

In order to show or not show a value, we can just pass a `truthy` of `falsy` value into the template. If the value
does not evaluate to `true` then the expression will not be displayed. For example:

```html
<body>
  <div>
    <button id="login" onclick"login()">Login</button>
    <button id="logout" onclick"logout()">Logout</button>
  </div>
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


## Functional Values

Functions can be used instead of values, and their return is used as the value to display.

```html
<body>
  <div>
    <b>COTIENT</b> / <b>DIVIDENT</b> = <b>RESULT</b>
  </div>
</body>
```

```javascript
bind(
    document.body,
    { cotient: 72, dividend: 8, result: 9 },
    function(m) {
        return  {
            "b:nth-child(1)": m.cotient,
            "b:nth-child(2)": m.dividend,
            "b:nth-child(3)": function() { m.cotient / m.divided }
        }
    }
);
```

Of course this example is complicated for the results expected, but it makes for a good explanation of functional values
and it shows also some slightly more complex CSS attributes.


## Deeply Nested Hierarchies

This just to show what is possible and how to format the model and the mapper.

## Filters


## Model and Non-String Attributes


# Testing

There are unit tests that can be run by executing `./test/bind.js`. They use the [Mocha](...) framework, which should be
installed globally via `npm`. The tests also use [Domino](...), a lightweight DOM implementation for the server.


# MVC Todo

Following the example from the [AngularJS page](https://angularjs.org), we create a similar app in JSFiddle.

http://jsfiddle.net/wallooza/rqh4dtjx/11/





# Performance

http://jsperf.com/dom-vs-innerhtml-based-templating/1004
