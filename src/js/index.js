/**
 * @author Milad Alizadeh <hello@mili.london>
 * @version 0.1
 * @copyright 2017
 * @license Released under the MIT License.
 */

// Styles
import '../scss/concertina.scss';

// Modules
import Helpers from './helpers';
import UrlHandler from './url-handler';

export default class {
    constructor(options) {
        this.setOptions(options);

        this.wrappers = Helpers.getNodes(`.${this.options.wrapperClass}`);
        this.allContent = Helpers.getNodes(`.${this.options.contentClass}`);
        this.headers = Helpers.getNodes(`.${this.options.headerClass}`);

        this.setPanels();

        if (this.wrappers.length) {
            // Claculate initial heights and paddings
            this.calculateStyles();

            // Set Event Listeners
            this.setListeners();

            // Check hash URL and open relevant items accordingly
            if (this.options.handleUrlHash) {
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
            handleHashUrl: false,
            scrollToPanelOnClick: 'mobile',
            transition: false,
            closeOthers: true
        };

        this.options = {
            ...defaults,
            ...options
        };
    }

    /**
     * Add trasition class to every accordion
     */
    setTransitionClass() {
        if (this.options.transition) {
            Helpers.addClass(this.wrappers, this.options.transitionClass);
        }
    }

    /**
     * Get trasition class to every accordion
     */
    getTransitionDuration() {
        let transitionDuration = Helpers.getStyle(this.allContent[0], 'transition-duration');

        if (transitionDuration === '0s') {
            throw new Error(`You should set transition-duration on the '.${this.options.contentClass}' element in your css file or disable transition by setting "transition" option to false in the constructor`);
        } else {
            return transitionDuration.replace('s', '') * 1000;
        }
    }

    /**
     * Set Accordion panels
     */
    setPanels() {
        this.wrappers.forEach((wrapper) => {
            this.panels = Helpers.getNodes(`.${this.options.panelClass}`);

            if (!this.panels.length) {
                throw new Error(`Please provide a panel wrapper (default: ${this.options.panelClass}) for each accordion item`);
            }
        });
    }

    /**
     * Set Event listeners for accordion.
     */
    setListeners() {
        // We attach only one listener per accordion and delegate the event listening
        this.wrappers.forEach((wrapper) => {
            wrapper.addEventListener('click', (e) => this.handleItemClick(e));
        });

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
                header
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
            this.closePanel();
        } else {
            this.openPanel();

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
    closePanel() {
        // Hide active panel content
        Helpers.hide(this.activePanel.data.content);

        // Remove the active panel class
        Helpers.removeClass(this.activePanel, this.options.activePanelClass);

        // Set aria-expanded tag of the current header to false
        Helpers.setAttr(this.activePanel.data.header, 'aria-expanded', false);

        // Remove Url hash
        if (this.options.handleUrlHash) {
            UrlHandler.removeUrlHash();
        }

        // Set isOpen flag to false
        this.activePanel.data.isOpen = false;

        this.activePanel = false;
    }

    /**
     * Open the clicked panel
     */
    openPanel() {
        // Expand the active panel content
        Helpers.show(this.activePanel.data.content, this.activePanel.data);

        // Add Active class to current panel
        Helpers.addClass(this.activePanel, this.options.activePanelClass);

        // Set Aria expanded to ture on link
        Helpers.setAttr(this.activePanel.data.header, 'aria-expanded', true);

        // Update the url hash to current panel Id
        if (this.options.handleUrlHash) {
            UrlHandler.updateUrlHash(this.activePanel.data.header);
        }

        // Set isOpen flag to true
        this.activePanel.data.isOpen = true;
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

    // If smooth scrolling is enabled scroll to current panel once it's opened
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
}