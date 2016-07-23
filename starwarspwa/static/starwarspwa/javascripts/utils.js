var utils = (function() {

    function $(selector, context) {
        return (context || document).querySelector(selector);
    }


    return { $: $ };

})();
