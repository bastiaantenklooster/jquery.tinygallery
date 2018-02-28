/**
 *
 */
;(function ($, window, document) {
    const pluginName = "tinyGallery",
        defaults = {
            slideSelector: '.gallery-slide',
            activeClass: 'active',
            start: 0,
            autoplay: false,
            autoresume: true,
            duration: 2000,
            keyboard: true,
            keyboardArrows: false,
            keyboardSpace: false,
            onChange: $.noop,
            onBeforeChange: $.noop,
            onPlay: $.noop,
            onStop: $.noop,
            onReady: $.noop,
            await: (slides, current) => false,
            eventNamespace: pluginName.toLowerCase()
        },
        dataKey = "plugin_" + pluginName;

    function Plugin(element, options) {
        this.element = element;

        this.settings = $.extend({}, defaults, options);
        this.defaults = defaults;
        this.name = pluginName;
        this.playing = false;
        this.previousPlaying = false;
        this.playTimeout = null;
        this.previousReadyState = false;

        this.init();

        return {
            current: () => this.getActiveSlide(this.getSlides()),
            slides: () => this.getSlides(),
            next: () => this.next(),
            previous: () => this.previous(),
            goto: (index) => this.goto(index),
            play: () => this.play(),
            stop: () => this.stop(),
            setting: (key, value) => {
                this.settings[key] = value;
            },
            destroy: () => this.destroy()
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

            const ready = this.ready();
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
                if (this.ready()) {
                    this.next(true);
                }

                timeout();
            };

            this.playing = true;

            this.onPlayEvent();

            timeout();
        },

        stop: function () {
            this.previousPlaying = this.playing;

            this.playing = false;
            clearTimeout(this.playTimeout);

            this.onStopEvent();
        },

        ready: function () {
            const $slides = this.getSlides();
            const ready = !this.settings.await($slides, this.getActiveSlide($slides));

            if (ready && ready !== this.previousReadyState) {
                this.onReadyEvent();
            }

            this.previousReadyState = ready;

            return ready;
        },

        setActiveSlide: function (index) {
            const $slides = this.getSlides();

            $slides.not(':eq('+index+')').removeClass(this.settings.activeClass);

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
            if (!auto && this.playing) {
                this.stop();
            }

            const $slides = this.getSlides();
            const $current = this.getActiveSlide($slides);
            const index = $current.index();
            const nextIndex = (index + difference) % $slides.length;
            const $next = $slides.eq(nextIndex);

            this.onBeforeChangeEvent($current, $next);

            this.setActiveSlide(nextIndex);

            this.onChangeEvent($next, $current);

            if (!auto && this.previousPlaying && this.settings.autoresume) {
                this.play();
            }

            return {
                previous: $current,
                current: $next
            };
        },

        onPlayEvent: function () {
            this.settings.onPlay();
            this.element.trigger(this.settings.eventNamespace + 'play');
        },

        onStopEvent: function () {
            this.settings.onStop();
            this.element.trigger(this.settings.eventNamespace + 'stop');
        },

        onReadyEvent: function () {
            this.settings.onReady();
            this.element.trigger(this.settings.eventNamespace + 'ready');
        },

        onBeforeChangeEvent: function ($current, $next) {
            this.settings.onBeforeChange($current, $next);
            this.element.trigger(this.settings.eventNamespace + 'beforechange', [$current, $next]);
        },

        onChangeEvent: function ($next, $current) {
            this.settings.onChange($next, $current);
            this.element.trigger(this.settings.eventNamespace + 'change', [$next, $current]);
        },

        destroy: function () {
            this.stop();

            return undefined;
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
