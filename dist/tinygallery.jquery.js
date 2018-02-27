/*
 *
 */
;(function ($, window, document) {
    "use strict";

    const pluginName = "tinyGallery",
        defaults = {
            slideSelector: '.gallery-slide',
            activeClass: 'active',
            start: 0,
            autoplay: true,
            autoresume: true,
            duration: 2000,
            keyboard: true,
            keyboardArrows: false,
            keyboardSpace: false,
            onChange: $.noop,
            onBeforeChange: $.noop,
            onPlay: $.noop,
            onStop: $.noop
        },
        dataKey = "plugin_" + pluginName;

    function Plugin(element, options) {
        this.element = element;

        this.settings = $.extend({}, defaults, options);
        this.defaults = defaults;
        this.name = pluginName;
        this.playing = false;
        this.playTimeout = null;
        this.init();

        return {
            current: () => this.getActiveSlide(this.getSlides()),
            next: () => this.next(),
            previous: () => this.previous(),
            goto: (index) => this.goto(index),
            play: () => this.play(),
            stop: () => this.stop(),
            setting: (key, value) => {
                this.settings[key] = value;
            }
        };
    }

    $.extend(Plugin.prototype, {
        init: function () {
            if (this.getActiveSlide(this.getSlides()).index() < 0) {
                this.setActiveSlide(this.settings.start);
            }

            $(document).on('keyup', (e) => this.handleKeys(e));

            if (this.settings.autoplay) {
                this.play();
            }
        },

        handleKeys: function (event) {
            const key = event.which;

            if (this.settings.keyboard) {
                if (this.settings.keyboardSpace && key === 32) {
                    this.next();
                }

                if (this.settings.keyboardArrows &&
                    (key === 37 || key === 39)) {
                    this.change(key - 38);
                }
            }
        },

        play: function () {
            const timeout = () => this.playTimeout = setTimeout(loop, this.settings.duration);
            const loop = () => {
                this.next(true);

                timeout();
            };

            this.playing = true;

            this.settings.onPlay();

            timeout();
        },

        stop: function () {
            this.playing = false;
            clearTimeout(this.playTimeout);

            this.settings.onStop();
        },

        setActiveSlide: function (index) {
            const $slides = this.getSlides();

            $slides.removeClass(this.settings.activeClass);

            $slides.eq(index).addClass(this.settings.activeClass);
        },

        getSlides: function () {
            return $(this.element).find(this.settings.slideSelector);
        },

        getActiveSlide: function (slides) {
            const plugin = this;

            return slides.filter(function () {
                return $(this).hasClass(plugin.settings.activeClass);
            }).first();
        },

        next: function (auto) {
            return this.change(1, auto);
        },

        previous: function (auto) {
            return this.change(-1, auto);
        },

        goto: function (index) {
            const $slides = this.getSlides();
            const $current = this.getActiveSlide($slides);

            return this.change(index - $current.index());
        },

        change: function (difference, auto) {
            if (!auto) {
                this.stop();
            }

            const $slides = this.getSlides();
            const $current = this.getActiveSlide($slides);
            const index = $current.index();
            const nextIndex = (index + difference) % $slides.length;
            const $next = $slides.eq(nextIndex);

            this.settings.onBeforeChange($current, $next);

            this.setActiveSlide(nextIndex);

            this.settings.onChange($next, $current);

            if (!auto && this.settings.autoresume) {
                this.play();
            }

            return {
                previous: $current,
                current: $next
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
