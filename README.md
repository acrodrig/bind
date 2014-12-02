Bind: A Javascript Template and Binding Engine
==============================================

# Introduction

There are a lot of [Javascript Template](http://en.wikipedia.org/wiki/JavaScript_templating) engines out there.
[AngularJS](https://angularjs.org) is pretty popular these days and provides templating plus two-way data binding. If
you look online, you will see tons of articles debating the merits of the many engines available. I am presenting
a new one, so I must have a good reason to do so. Let me try to give a rationale, which hopefully with the examples
below will convince you of the merits.

The templating libraries usually fall in one of three main camps:

- *ERB Type*: They add to HTML a couple of interpolation tokens (usually `<%= var %>` or `<{{ var }}`). The ones that
  fall into this category, as far as I am aware are [Mustache](http://mustache.github.io), [Handlebars](http://handlebarsjs.com),
  [Underscore](http://underscorejs.org) and many others.

- *Attribute Type*: They add to special attributes to HTML (like `ng-repeat` or `data-bind`). Popular choices are
  [KnockoutJS](http://knockoutjs.com) and [AngularJS](https://angularjs.org).

- *External*: They work through special objects that connect the HTML to the data objects. I think the most popular
  choice here is [PureJS](http://beebole.com/pure/). As you will see, this is the route chosen by BindJS, as it
  provides the cleanest separation of concerns. Another nice library is [BindJS](https://github.com/Xavi-/bind-js).


# Objectives

The objectives of BindJS are as follow:

- *Simplicity*: be as simple as possible, do one thing well and only one thing.

- *No extraneous markup/attributes*: templates should be HTML, with no extraneous markup and/or attributes. People already
  know HTML well, we should not force them to learn a new language (much like AngularJS does). This also helps when
  considering the next objective.

- *Compatibility*: be compatible (and build on top of) to new Web technologies such [Web Components](http://webcomponents.org).
  By working on top of plain HTML templates,

- *Use CSS selectors*: instead of generating new markups, use CSS selectors as the external way to link the data to the
  HTML. Since all developers already use CSS selectors, they are familiar with them and know how to reach the DOM nodes
  they need via this mechanism.

- *Separation of Concerns*: separate the HTML to display from the data (and the manipulation of the data) that is to
  populate the template.

- Server and Client: work both on the client and in the server.

- Fast: render as fast as possible. This is a work in progress as implementing a Virtual DOM (such as React) is planned.
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
bind(document.body, {
    "h1 span": "John Smith"
});
```


Note the following:

- The `NAME` tag in the original template is replaced by the binding and as such could be anything. Specifically
  it could be used to document the template with comments like `(Here goes the name)` or something like that.
- We use the CSS selector `h1 span` to bind the name in the JSON document.
- We use the `body` as the top element, but we could just as well have used `document.querySelector("div")` or even
  something like `document.querySelector("body div div h1")`.


# API

The API is very simple, it's just the function `bind`. It receives a DOM element (or a URL) and a set of bindings.


# Examples

## Iteration

The example below shows how to iterate (repeat) over a simple list of values. It is as simple as passing an array to
a selector. If the value is an array, that is the cue that `bindjs` uses to iterate over.

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
bind(document.body, {
    "h1 span": "John Smith",
    "li": [
        "Einstein, Albert",
        "Curie, Marie",
        "Freud, Sigmund",
        "Planck, Max",
        "Watson, James"
    ]
});
```

## Attributes

In order to bind attributes we use an XSL inspired notation, where `li@class` means the attribute `class` at the
element `li`. The following example builds on the previous one to make the name of physicist in the list appear in bold.
It also shows how to combine values (`first` and `last`) to create a more complex value. Finally, note that CSS
selectors are relative to the selected node: once inside `li`, the empty string is the node itself and the attribute
does not need a qualifier before it.

```html
<body>
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

bind(document.body, {
    "li": scientists.map(function(s) { return {
        "": s.last + ", " + s.first,
        "@class": (s.science == "Physics" ? "bold" : "")
    }})
});
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
var authenticated = false;
bind(document.body, {
    "button#login": !authenticated,
    "button#logout": authenticated
});
```

In general you can take care of most conditionals at the data level, but it useful to know the example above works for
both elements and attributes (that is, if the attribute is `falsy` it is removed: this obviates the need for things
like `ng-disabled` in AngularJS).

## Functional Values


## Deeply Nested Hierarchies


## Filters



# Performance

http://jsperf.com/dom-vs-innerhtml-based-templating/1004
