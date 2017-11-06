# Concertina.js

An accessible, lightweight and modern javascript accordion with no dependencies and a useful api.

## How to install

Using yarn

```
yarn add concertina.js
```

Using npm

```
npm install concertina.js
```

## How to use
### Sample Code
**HTML**

```
<ul class="c-concertina">
    <li class="c-concertina__panel">
        <a id="panel-1" href="#" class="c-concertina__header" role="tab">
            <h2 class="c-concertina__title">Panel Title 1</h2>
            <div class="c-concertina__icon"></div>
        </a>
        <div class="c-concertina__content" role="tabpanel">
            <div class="c-concertina__content-inner">
                ...content
            </div>
        </div>
    </li>

    <li class="c-concertina__panel">
        <a id="panel-2" href="#" class="c-concertina__header" role="tab">
            <h2 class="c-concertina__title">Panel Title 2</h2>
            <div class="c-concertina__icon"></div>
        </a>
        <div class="c-concertina__content" role="tabpanel">
            <div class="c-concertina__content-inner">
                ...content
            </div>
        </div>
    </li>
</ul>

```

**Note:** All the html classes are customizable however the structure of markup needs to be as below for the accordion to work

```
-- Accordion Wrapper
  -- Panel
     -- Panel Header
     -- Panel Content
        -- Panel Content Inner
  -- Panel
     -- Panel Header
     -- Panel Content
        -- Panel Content Inner

```
---
**Javascript**


```
import Concertina from 'concertina.js';

new Concertina({
    element: '.c-concertina'
});

```

By default this code will grab the first element matching css selector.
alertnatively you can pass a dom node as the wrapper element

```
new Concertina({
    element: document.getElementById('wrapper-id')
});
```

If you would like to create multiple accordions on the same page you can write it like:

```
let accordions = document.querySelectorAll('.c-concertina');

accordions.forEach((accordion) => {
    new Concertina({
        element: accordion
    });
});
```
---
**CSS**

you can grab the default css from
```
node_modules/concertina.js/lib/conretina.min.css
```

###Hash Urls
By default Concertina.js reads the page URL hash (#) and opens the relative panel after page load. to use this feature each accordion panel header needs to be an ```<a>``` tag with a unique id. The href will be dynamically generated from this id.

**example**

If you got this URL
```
http://example.com/concertina#panel-2
```
Concertina.js will look for the panel with id ```#panel-2``` and open it after the page is loaded. To turn off this feature use the option ```hashUrl: false```
