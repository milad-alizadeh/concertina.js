/**
 * Consertina.js
 *
 */

// Styles
import '../scss/concertina.scss';

// Modules
import Helpers from './helpers';
import UrlHandler from './url-handler';

export default class {
    constructor(options) {
        this.setOptions(options);

        this.wrapper = Helpers.getNodes(`.${this.options.wrapperClass}`)[0];

        if (this.wrapper) {
            // Check for accordion components
            this.setElement('panels', `.${this.options.panelClass}`);
            this.setElement('content', `.${this.options.contentClass}`);
            this.setElement('headers', `.${this.options.headerClass}`);
            this.setElement('content-canvas', `.${this.options.contentCanvasClass}`);

            // Claculate initial heights and paddings
            this.calculateStyles();

            // Set Event Listeners
            this.setListeners();

            // Check hash URL and open relevant items accordingly
            if (this.options.handleHashUrl) {
                this.loadFromUrlHash();
            }

            // Set accesibility attributes
            this.setAccesibility();

            // Add transition with timeout so it stops the flickering
            this.setTransitionClass();

            // Get the transtion time from CSS
            this.transitionTime = this.getTransitionDuration();

            window.onload = () => {
                this.recalculateHeights();
            };
        }
    }

    /**
     * Merge options with defaults
     * @param {object} options - The option object that is passed when instantiating the accordion
     */
    setOptions(options) {
        let defaults = {
            wrapperClass: 'js-concertina',
            transitionClass: 'c-concertina--has-transition',
            panelClass: 'c-concertina__panel',
            activePanelClass: 'c-concertina__panel--is-active',
            headerClass: 'c-concertina__header',
            titleClass: 'c-concertina__title',
            contentClass: 'c-concertina__content',
            contentCanvasClass: 'c-concertina__content-canvas',
            handleHashUrl: true,
            scrollToPanelOnClick: 'mobile',
            transition: true,
            closeOthers: false
        };

        this.options = {
            ...defaults,
            ...options
        };
    }

    /**
     * Set Accordion panels
     */
    setElement(name, selector) {
        this[name] = Helpers.getNodes(selector, this.wrapper);

        if (!this[name].length) {
            throw new Error(`Please provide a ${name} wrapper (default: ${selector}) for each accordion item in your html markup`);
        }
    }

    /**
     * Add trasition class to every accordion
     */
    setTransitionClass() {
        if (this.options.transition) {
            Helpers.addClass(this.wrapper, this.options.transitionClass);
        }
    }

    /**
     * Get trasition class to every accordion
     */
    getTransitionDuration() {
        let transitionDuration = Helpers.getStyle(this.content[0], 'transition-duration');

        if (transitionDuration === '0s') {
            throw new Error(`You should set transition-duration on the '.${this.options.contentClass}' element in your css file or disable transition by setting "transition" option to false in the constructor`);
        } else {
            return transitionDuration.replace('s', '') * 1000;
        }
    }

    /**
     * Set Event listeners for accordion.
     */
    setListeners() {
        // We attach only one listener per accordion and delegate the event listening
        this.wrapper.addEventListener('click', (e) => this.handleItemClick(e));

        // Recalculate content sizes on resize
        window.addEventListener('resize', Helpers.debounce(() => this.handleResize(), 300));
    }

    /**
     * Click handler for tabs.
     * @param {DOMElement} el - The element which has been clicked on
     */
    handleItemClick(e) {
        let clickTarget = e.target;

        e.preventDefault();

        if (Helpers.hasClass(clickTarget, this.options.headerClass) || Helpers.hasAncestor(clickTarget, this.options.headerClass)) {
            // Find current panel
            this.activePanel = Helpers.findAncestor(clickTarget, this.options.panelClass);
            // Toggle the active panel
            this.toggle();
        }
    }

    loadFromUrlHash() {
        this.activePanel = UrlHandler.getCurrentTabNodeFromUrlHash();

        if (this.activePanel) {
            this.toggle();
        }
    }

    /**
     * Resize handler that calculates the new panel heights after resize
     */
    handleResize() {
        // Run only on horizontal resize
        if (this.ww !== Helpers.windowWidth()) {
            // Recalculate Heights
            this.recalculateHeights();

            if (this.activePanel) {
                Helpers.show(this.activePanel.data.content, this.activePanel.data);
            }

            this.ww = Helpers.windowWidth();
        }
    }

    /**
     * Set Accesibility attributes
     */
    setAccesibility() {
        for (let i = 0; i < this.headers.length; i += 1) {
            let header = this.headers[i];
            let content = header.nextElementSibling;
            let headerId = header.getAttribute('id');
            let contentId;

            if (headerId) {
                contentId = headerId + '-content';
                Helpers.setAttr(header, 'aria-controls', contentId);
                Helpers.setAttr(header, 'aria-expanded', false);
                Helpers.setAttr(header, 'href', '#' + contentId);
                Helpers.setAttr(content, 'id', contentId);
                Helpers.setAttr(content, 'aria-labelledby', headerId);
            } else {
                this.accesibility = false;
            }
        }
    }

    /**
     * Calculate initial heights and layout
     */
    calculateStyles() {
        this.panels.forEach((panel) => {
            let content = panel.querySelector('.' + this.options.contentClass);
            let contentCanvas = panel.querySelector('.' + this.options.contentCanvasClass);
            let header = panel.querySelector('.' + this.options.headerClass);

            // We need to get height and padding of the element and save it on panel node
            Helpers.saveData(panel, {
                height: Helpers.getHeight(contentCanvas),
                contentCanvas,
                content,
                header,
                isOpen: false
            });
        });
    }

    /**
     * Recalculate panel heihghts
     */
    recalculateHeights() {
        this.panels.forEach((panel) => {
            panel.data.height = Helpers.getHeight(panel.data.contentCanvas);
        });
    }

    /**
     * Toggle current pannel and close the others
     */
    toggle() {
        if (this.activePanel.data.isOpen) {
            this.closePanel(this.activePanel);
            this.activePanel = false;
        } else {
            this.openPanel(this.activePanel);

            if (this.options.closeOthers) {
                this.closeOthers();
            }

            if (this.options.scrollToPanelOnClick) {
                this.handleScroll();
            }
        }
    }

    /**
     * Close the active panel
     */
    closePanel(panel) {
        // Hide active panel content
        Helpers.hide(panel.data.content);

        // Remove the active panel class
        Helpers.removeClass(panel, this.options.activePanelClass);

        // Set aria-expanded tag of the current header to false
        Helpers.setAttr(panel.data.header, 'aria-expanded', false);

        // Remove Url hash
        if (this.options.handleHashUrl) {
            UrlHandler.removeUrlHash();
        }

        // Set isOpen flag to false
        panel.data.isOpen = false;
    }

    /**
     * Open the clicked panel
     */
    openPanel(panel) {
        // Expand the active panel content
        Helpers.show(panel.data.content, panel.data);

        // Add Active class to current panel
        Helpers.addClass(panel, this.options.activePanelClass);

        // Set Aria expanded to ture on link
        Helpers.setAttr(panel.data.header, 'aria-expanded', true);

        // Update the url hash to current panel Id
        if (this.options.handleHashUrl) {
            UrlHandler.updateUrlHash(panel.data.header);
        }

        // Set isOpen flag to true
        panel.data.isOpen = true;
    }

    /**
     * Close other panels
     */
    closeOthers() {
        let otherPanels = Helpers.siblings(this.activePanel, this.options.panelClass);

        if (otherPanels.length) {
            otherPanels.forEach((panel) => {
                // Remove active class from other panels
                Helpers.removeClass(panel, this.options.activePanelClass);

                // Set aria-expanded tag of other headers to false
                Helpers.setAttr(panel.data.header, 'aria-expanded', false);

                // Hide the content
                Helpers.hide(panel.data.content);

                // Set isOpen flag to false
                panel.data.isOpen = false;
            });
        }
    }

    /**
     * If smooth scrolling is enabled scroll to current panel once it's opened
     */
    handleScroll() {
        let mobileScroll = this.options.scrollToPanelOnClick && Helpers.isMobile().any();
        if (mobileScroll || this.options.scrollToPanelOnClick === 'all') {
            let bodyRect = document.body.getBoundingClientRect();
            let elemRect = this.activePanel.getBoundingClientRect();
            let offset = elemRect.top - bodyRect.top;

            setTimeout(() => {
                window.scrollTo(0, offset);
            }, this.transitionTime + 5);
        }
    }

    /**
     * Open All panels
     */
    openAll() {
        this.panels.forEach((panel) => {
            this.openPanel(panel);
        });
    }
    /**
     * Open All panels
     */
    closeAll() {
        this.panels.forEach((panel) => {
            this.closePanel(panel);
        });
    }

    /**
     * Open a specific panel based on its index
     * @param  {int} panelIndex
     */
    open(panelIndex) {
        if (this.panels[panelIndex]) {
            this.openPanel(this.panels[panelIndex]);
        } else {
            throw new Error(`Panel with index "${panelIndex}" does not exist`);
        }
    }

    /**
     * Close a specific panel based on its index
     * @param  {int} panelIndex
     */
    close(panelIndex) {
        if (this.panels[panelIndex]) {
            this.closePanel(this.panels[panelIndex]);
        } else {
            throw new Error(`Panel with index "${panelIndex}" does not exist`);
        }
    }

    getPanelsState() {
        let states = [];

        this.panels.forEach((panel) => {
            states.push({
                el: panel,
                isOpen: panel.data.isOpen
            });
        });

        return states;
    }
}
