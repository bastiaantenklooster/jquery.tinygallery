/*
 *
 */
;(function ($, window, document) {
    "use strict";

    const pluginName = "tinyGallery",
        defaults = {
            slideSelector: '.tg-slide',
            activeClass: '.active'
        },
        dataKey = "plugin_" + pluginName;

    function Plugin(element, options) {
        const plugin = this;

        this.element = element;

        this.settings = $.extend({}, defaults, options);
        this.defaults = defaults;
        this.name = pluginName;
        this.init();

        return {
            next: function () {
                return plugin.next();
            }
        };
    }

    $.extend(Plugin.prototype, {
        init: function () {

        },
        getSlides: function () {
            return $(this.element).find(this.settings.slideSelector);
        },
        getActiveSlide: function (slides) {
            return slides.filter(this.settings.activeClass).first();
        },
        next: function () {
            return this.change(1);
        },
        change: function (direction) {
            this.getActiveSlide(this.getSlides());

            return {
                previous: 0,
                current: 1
            };
        }
    });

    $.fn[pluginName] = function (options) {
        let plugin = this.data(dataKey);

        if (!plugin) {
            plugin = new Plugin(this, options);
            this.data(dataKey, plugin);
        }

        return plugin;
    };

})(jQuery, window, document);
