export default {
    /**
     * Check whether # exist in the url and if so open the
     * relevant tab on page load
     */
    getCurrentTabNodeFromUrlHash() {
        let urlHash = window.location.hash;
        let currentPanelHeaderId;
        let currentPanelHeader;

        if (urlHash) {
            currentPanelHeaderId = urlHash.replace('#', '');
            currentPanelHeader = document.getElementById(currentPanelHeaderId);
        }

        return currentPanelHeader ? currentPanelHeader.parentNode : null;
    },

    /**
     * Update the url with a current Node's ID
     */
    updateUrlHash(el) {
        let hash = el.getAttribute('id');
        history.replaceState(null, null, '#' + hash);
    },

    /**
     * Remove # from url
     */
    removeUrlHash() {
        history.replaceState({}, document.title, '.');
    }
};
