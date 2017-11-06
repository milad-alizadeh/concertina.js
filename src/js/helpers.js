export default {
    /**
     * Get an array of node based on a given selector and convert it to an array
     * @param {string} selector - A given selector
     * @return {Array} - An array of DOM nodes
     */
    getNodes(selector, parent = document) {
        return [].slice.call(parent.querySelectorAll(selector));
    },

    /**
     * Find a node siblings with a specific class name
     * @param {DOMElement} el - A fiven DOM node
     * @param {String} className - Siblings class name
     * @return {Array} - An array of DOM nodes
     */
    siblings(el, className) {
        return [].filter.call(el.parentNode.children, (child) => {
            return child !== el && this.hasClass(child, className);
        });
    },

    /**
     * Check whether a nodes ancector with a specific class name exist
     * @param {DOMElement} el - A given DOM node
     * @param {string} className - Ancestor's class name
     * @return {boolean}
     */
    hasAncestor(el, className) {
        // Keep going back up the chain till you find the match
        while ((el = el.parentNode) && !el.classList.contains(className)) {
            if (el.nodeName === 'BODY') {
                return false;
            }
        }
        return true;
    },

    /**
     * Find a node's ancestor with specific class name
     * @param {DOMElement} el - A given DOM node
     * @param {string} className - Ancestor class name
     * @return {DOMElement} - Ancestor's DOM node
     */
    findAncestor(el, className) {
        // Keep going back up the chain till you find the match
        while ((el = el.parentNode) && !el.classList.contains(className)) {
            if (el.nodeName === 'BODY') {
                return false;
            }
        }
        return el;
    },

    /**
     * Add a class name to NodeList or a singular node
     * @param {DOMElement} el - A singular DOM node or a NodeList
     * @param {string} className - class name Ancestor's DOM node
     */
    addClass(el, className) {
        // If more than one item is selected
        if (el.length) {
            for (let i = 0; i < el.length; i += 1) {
                el[i].classList.add(className);
            }
            // If element is singular
        } else {
            el.classList.add(className);
        }
    },

    /**
     * Removes a class name from NodeList or a singular node
     * @param {DOMElement} el - A singular DOM node or a NodeList
     * @param {string} className - class name Ancestor's DOM node
     */
    removeClass(el, className) {
        // If more than one item is selected
        if (el.length) {
            for (let i = 0; i < el.length; i += 1) {
                el[i].classList.remove(className);
            }
            // If element is singular
        } else {
            el.classList.remove(className);
        }
    },

    /**
    * Check whether a DOM node contains a class name
    * @param {DOMElement} el - A given DOM Node
    * @param {string} className - class name
     */
    hasClass(el, className) {
        return el.classList.contains(className);
    },

    /**
     * Bpanelser agent check to see whether we are using a mobile device
     */
    isMobile() {
        return {
            Android() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows() {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any() {
                return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
            }
        };
    },

    windowWidth() {
        let w = window;
        let d = document;
        let e = d.documentElement;
        let g = d.getElementsByTagName('body')[0];

        return w.innerWidth || e.clientWidth || g.clientWidth;
    },

    /**
     * Save an data object on a specific nodes
     * @param {DOMElement} el - A give DOM node
     * @param {obj} data - The object containing the data
     */
    saveData(el, data) {
        el.data = data;
    },

    /**
     * Get a specific CSS property of a given node
     * @param {DOMElement} el - A give DOM node
     * @param {prop} data - CSS propery . ie "padding-top"
     */
    getStyle(el, prop) {
        return window.getComputedStyle(el).getPropertyValue(prop);
    },

    getHeight(el) {
        let paddingTop = parseInt(this.getStyle(el, 'padding-top'));
        let paddingBottom = parseInt(this.getStyle(el, 'padding-bottom'));
        let height = parseInt(this.getStyle(el, 'height'));

        return paddingTop + paddingBottom + height + 'px';
    },

    setAttr(el, attr, value) {
        if (el.length) {
            for (let i = 0; i < el.length; i += 1) {
                el[i].setAttribute(attr, value);
            }
        } else {
            el.setAttribute(attr, value);
        }
    },

    /**
     *  Hide a Nodelist or a singular node by setting
     *  height and padding to 0 and overflow:hidden (in CSS).
     *  @param {DOMElement} el - The element which has been clicked on
     */
    hide(el) {
        if (el.length) {
            for (let i = 0; i < el.length; i += 1) {
                let elst = el[i].style;
                elst.maxHeight = 0;
            }
        } else {
            let elst = el.style;
            elst.maxHeight = 0;
        }
    },

    /**
     * Show an element by setting height and padding to defined values
     * @param {DOMElement} el - A give DOM node
     * @param {obj} data - The object containing height and padding values
     */
    show(el, data) {
        let elst = el.style;
        elst.maxHeight = data.height;
    },

    debounce(fn, time) {
        let timeout;

        return function() {
            const functionCall = () => fn.apply(this, arguments);

            clearTimeout(timeout);
            timeout = setTimeout(functionCall, time);
        };
    }

};
