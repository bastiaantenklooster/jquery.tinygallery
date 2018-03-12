/**
 * jQuery.tinySlides by Bastiaan ten Klooster
 */
;(function ($, window, document) {
    const pluginName = "tinySlides",
        defaults = {
            slideSelector: '.gallery-slide',
            activeClass: 'active',
            start: 0,
            autoplay: !1,
            random: !1,
            backwards: !1,
            autoresume: !0,
            duration: 2000,
            keyboard: !0,
            keyboardArrows: !1,
            keyboardSpace: !1,
            onChange: $.noop,
            onBeforeChange: $.noop,
            onPlay: $.noop,
            onStop: $.noop,
            onReady: $.noop,
            await: (slides, current) => !1,
            eventNamespace: pluginName.toLowerCase()
        },
        dataKey = "plugin_" + pluginName;

    function Plugin(element, options) {
        this.element = element;

        // A gallery can only be initialized on a single container
        this.galleryElement = element.first();

        this.settings = $.extend({}, defaults, options);

        if (typeof this.settings.duration !== 'function') {
            const duration = this.settings.duration;
            this.settings.duration = () => duration;
        }

        this.defaults = defaults;
        this.name = pluginName;
        this.playing = false;
        this.previousPlayingState = false;
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
                if (key === 'duration' && typeof value !== 'function') {
                    const duration = value;
                    value = () => duration;
                }

                this.settings[key] = value;
            },
            destroy: () => this.destroy(),
            end: () => this.element
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
            const timeout = () => this.playTimeout = setTimeout(loop,
                this.settings.duration(
                    this.getActiveSlide(this.getSlides())
                )
            );
            const loop = () => {
                if (this.ready()) {
                    this.progress(this.settings.backwards?-1:1, true);
                }

                timeout();
            };

            this.playing = true;

            this.onPlayEvent();

            timeout();
        },

        stop: function () {
            this.previousPlayingState = this.playing;

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
            return $(this.galleryElement).find(this.settings.slideSelector);
        },

        getActiveSlide: function (slides) {
            const plugin = this;

            return slides.filter(function () {
                return $(this).hasClass(plugin.settings.activeClass);
            }).first();
        },

        next: function (auto) {
            return this.progress(1, auto);
        },

        previous: function (auto) {
            return this.progress(-1, auto);
        },

        progress: function (difference, auto) {
            const $slides = this.getSlides();
            const $current = this.getActiveSlide($slides);

            if (this.settings.random) {
                const keys = [ ...Array($slides.length).keys() ];
                keys.splice($current.index(), 1);
                return this.goto(keys[Math.floor(Math.random() * ($slides.length - 1))]);
            }

            return this.change(difference, auto);
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

            if (!auto && this.previousPlayingState && this.settings.autoresume) {
                this.play();
            }

            return {
                previous: $current,
                current: $next
            };
        },

        onPlayEvent: function () {
            this.settings.onPlay();
            this.galleryElement.trigger(this.settings.eventNamespace + 'play');
        },

        onStopEvent: function () {
            this.settings.onStop();
            this.galleryElement.trigger(this.settings.eventNamespace + 'stop');
        },

        onReadyEvent: function () {
            this.settings.onReady();
            this.galleryElement.trigger(this.settings.eventNamespace + 'ready');
        },

        onBeforeChangeEvent: function ($current, $next) {
            this.settings.onBeforeChange($current, $next);
            this.galleryElement.trigger(this.settings.eventNamespace + 'beforechange', [$current, $next]);
        },

        onChangeEvent: function ($next, $current) {
            this.settings.onChange($next, $current);
            this.galleryElement.trigger(this.settings.eventNamespace + 'change', [$next, $current]);
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
