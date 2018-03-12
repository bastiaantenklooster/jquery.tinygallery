/*!
 * jQuery.tinySlides by Bastiaan ten Klooster
 */
'use strict';

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
    } else {
        return Array.from(arr);
    }
}

;(function ($, window, document) {
    var n = $.noop;
    var pluginName = "tinySlides",
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
        onChange: n,
        onBeforeChange: n,
        onPlay: n,
        onStop: n,
        onReady: n,
        await: function await(slides, current) {
            return !1;
        },
        eventNamespace: pluginName.toLowerCase()
    },
        dataKey = "plugin_" + pluginName;

    function Plugin(element, options) {
        var _this = this;

        this.element = element;

        // A gallery can only be initialized on a single container
        this.galleryElement = element.first();

        this.settings = $.extend({}, defaults, options);

        if (typeof this.settings.duration !== 'function') {
            (function () {
                var duration = _this.settings.duration;
                _this.settings.duration = function () {
                    return duration;
                };
            })();
        }

        this.defaults = defaults;
        this.name = pluginName;
        this.playing = false;
        this.previousPlayingState = false;
        this.playTimeout = null;
        this.previousReadyState = false;

        this.init();

        return {
            current: function current() {
                return _this.getActiveSlide(_this.getSlides());
            },
            slides: function slides() {
                return _this.getSlides();
            },
            next: function next() {
                return _this.next();
            },
            previous: function previous() {
                return _this.previous();
            },
            goto: function goto(index) {
                return _this.goto(index);
            },
            play: function play() {
                return _this.play();
            },
            stop: function stop() {
                return _this.stop();
            },
            setting: function setting(key, value) {
                if (key === 'duration' && typeof value !== 'function') {
                    (function () {
                        var duration = value;
                        value = function () {
                            return duration;
                        };
                    })();
                }

                _this.settings[key] = value;
            },
            destroy: function destroy() {
                return _this.destroy();
            },
            end: function end() {
                return _this.element;
            }
        };
    }

    $.extend(Plugin.prototype, {
        init: function init() {
            var _this2 = this;

            if (this.getActiveSlide(this.getSlides()).index() < 0) {
                this.setActiveSlide(this.settings.start);
            }

            $(document).on('keyup', function (e) {
                return _this2.handleKeys(e);
            });

            if (this.settings.autoplay) {
                this.play();
            }

            var ready = this.ready();
        },

        handleKeys: function handleKeys(event) {
            var key = event.which;

            if (this.settings.keyboard) {
                if (this.settings.keyboardSpace && key === 32) {
                    this.next();
                }

                if (this.settings.keyboardArrows && (key === 37 || key === 39)) {
                    this.change(key - 38);
                }
            }
        },

        play: function play() {
            var _this3 = this;

            var timeout = function timeout() {
                return _this3.playTimeout = setTimeout(loop, _this3.settings.duration(_this3.getActiveSlide(_this3.getSlides())));
            };
            var loop = function loop() {
                if (_this3.ready()) {
                    _this3.progress(_this3.settings.backwards ? -1 : 1, true);
                }

                timeout();
            };

            this.playing = true;

            this.onPlayEvent();

            timeout();
        },

        stop: function stop() {
            this.previousPlayingState = this.playing;

            this.playing = false;
            clearTimeout(this.playTimeout);

            this.onStopEvent();
        },

        ready: function ready() {
            var $slides = this.getSlides();
            var ready = !this.settings.await($slides, this.getActiveSlide($slides));

            if (ready && ready !== this.previousReadyState) {
                this.onReadyEvent();
            }

            this.previousReadyState = ready;

            return ready;
        },

        setActiveSlide: function setActiveSlide(index) {
            var $slides = this.getSlides();
            var activeClass = this.settings.activeClass;

            $slides.not(':eq(' + index + ')').removeClass(activeClass);

            $slides.eq(index).addClass(activeClass);
        },

        getSlides: function getSlides() {
            return $(this.galleryElement).find(this.settings.slideSelector);
        },

        getActiveSlide: function getActiveSlide(slides) {
            var plugin = this;

            return slides.filter(function () {
                return $(this).hasClass(plugin.settings.activeClass);
            }).first();
        },

        next: function next(auto) {
            return this.progress(1, auto);
        },

        previous: function previous(auto) {
            return this.progress(-1, auto);
        },

        progress: function progress(difference, auto) {
            var $slides = this.getSlides();
            var $current = this.getActiveSlide($slides);

            if (this.settings.random) {
                var keys = [].concat(_toConsumableArray(Array($slides.length).keys()));
                keys.splice($current.index(), 1);
                return this.goto(keys[Math.floor(Math.random() * ($slides.length - 1))]);
            }

            return this.change(difference, auto);
        },

        goto: function goto(index) {
            var $slides = this.getSlides();
            var $current = this.getActiveSlide($slides);

            return this.change(index - $current.index());
        },

        change: function change(difference, auto) {
            if (!auto && this.playing) {
                this.stop();
            }

            var $slides = this.getSlides();
            var $current = this.getActiveSlide($slides);
            var nextIndex = ($current.index() + difference) % $slides.length;
            var $next = $slides.eq(nextIndex);

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

        onPlayEvent: function onPlayEvent() {
            this.onGeneric('play');
        },

        onStopEvent: function onStopEvent() {
            this.onGeneric('stop');
        },

        onReadyEvent: function onReadyEvent() {
            this.onGeneric('ready');
        },

        onGeneric: function onGeneric(name) {
            this.settings['on' + name.charAt(0).toUpperCase() + name.substr(1)]();
            this.galleryElement.trigger(this.settings.eventNamespace + name);
        },

        onBeforeChangeEvent: function onBeforeChangeEvent($current, $next) {
            this.settings.onBeforeChange($current, $next);
            this.galleryElement.trigger(this.settings.eventNamespace + 'beforechange', [$current, $next]);
        },

        onChangeEvent: function onChangeEvent($next, $current) {
            this.settings.onChange($next, $current);
            this.galleryElement.trigger(this.settings.eventNamespace + 'change', [$next, $current]);
        },

        destroy: function destroy() {
            this.stop();

            return undefined;
        }
    });

    $.fn[pluginName] = function (options) {
        var plugin = this.data(dataKey);

        if (!plugin) {
            plugin = new Plugin(this, options);
            this.data(dataKey, plugin);
        }

        return plugin;
    };
})(jQuery, window, document);