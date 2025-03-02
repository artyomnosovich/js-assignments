'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
}
    Rectangle.prototype = {
        getArea: function () {
            return this.width * this.height;
        },
    }


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    const result = JSON.stringify(obj);
    return result;
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    let obj = {};
    json = JSON.parse(json);

    for (let i in json) {
        obj[i] = json[i];
    }

    obj.__proto__ = proto;

    return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
class Selector {
    constructor() {
        this.selector = {
            element: "",
            id: "",
            classes: [],
            attributes: [],
            pseudoClasses: [],
            pseudoElement: "",
        };
        this.order = [];
        this.combinator = null;
        this.combinedSelectors = [];
    }

    checkOrder(newType) {
        const order = [
            "element",
            "id",
            "classes",
            "attributes",
            "pseudoClasses",
            "pseudoElement",
        ];
        if (this.order.length > 0) {
            const lastType = this.order[this.order.length - 1];
            if (order.indexOf(lastType) > order.indexOf(newType)) {
                throw new Error(
                    "Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element"
                );
            }
        }
        this.order.push(newType);
    }

    checkUnique(newType) {
        if (newType === "element" && this.selector.element) {
            throw new Error(
                "Element, id and pseudo-element should not occur more then one time inside the selector"
            );
        }
        if (newType === "id" && this.selector.id) {
            throw new Error(
                "Element, id and pseudo-element should not occur more then one time inside the selector"
            );
        }
        if (newType === "pseudoElement" && this.selector.pseudoElement) {
            throw new Error(
                "Element, id and pseudo-element should not occur more then one time inside the selector"
            );
        }
    }

    copy() {
        const newSelector = new Selector();
        newSelector.selector = JSON.parse(JSON.stringify(this.selector));
        newSelector.order = [...this.order];
        return newSelector;
    }

    element(value) {
        this.checkUnique("element");
        this.checkOrder("element");
        const newSelector = this.copy();
        newSelector.selector.element = value;
        return newSelector;
    }

    id(value) {
        this.checkUnique("id");
        this.checkOrder("id");
        const newSelector = this.copy();
        newSelector.selector.id = `#${value}`;
        return newSelector;
    }

    class(value) {
        this.checkOrder("classes");
        const newSelector = this.copy();
        newSelector.selector.classes.push(`.${value}`);
        return newSelector;
    }

    attr(value) {
        this.checkOrder("attributes");
        const newSelector = this.copy();
        newSelector.selector.attributes.push(`[${value}]`);
        return newSelector;
    }

    pseudoClass(value) {
        this.checkOrder("pseudoClasses");
        const newSelector = this.copy();
        newSelector.selector.pseudoClasses.push(`:${value}`);
        return newSelector;
    }

    pseudoElement(value) {
        this.checkUnique("pseudoElement");
        this.checkOrder("pseudoElement");
        const newSelector = this.copy();
        newSelector.selector.pseudoElement = `::${value}`;
        return newSelector;
    }

    combine(selector1, combinator, selector2) {
        const newSelector = new Selector();
        newSelector.combinator = combinator;
        newSelector.combinedSelectors = [selector1, selector2];
        return newSelector;
    }

    stringify() {
        if (this.combinator) {
            return `${this.combinedSelectors[0].stringify()} ${
                this.combinator
            } ${this.combinedSelectors[1].stringify()}`;
        }

        return (
            (this.selector.element || "") +
            (this.selector.id || "") +
            this.selector.classes.join("") +
            this.selector.attributes.join("") +
            this.selector.pseudoClasses.join("") +
            (this.selector.pseudoElement || "")
        );
    }
}

const cssSelectorBuilder = {
    element(value) {
        return new Selector().element(value);
    },

    id(value) {
        return new Selector().id(value);
    },

    class(value) {
        return new Selector().class(value);
    },

    attr(value) {
        return new Selector().attr(value);
    },

    pseudoClass(value) {
        return new Selector().pseudoClass(value);
    },

    pseudoElement(value) {
        return new Selector().pseudoElement(value);
    },

    combine(selector1, combinator, selector2) {
        return new Selector().combine(selector1, combinator, selector2);
    },
};

module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};
