# jquery.tinySlides

A very small (3,77kb minified), barebones jQuery gallery/slider plugin.
This plugin, unlike many other slider plugins, does not include any DOM controls, transitions or styling.
It only keeps track of the gallery's state and provides a simple API to create additional interaction.
This makes it extremely lightweight and flexible.

## Usage

To initialize a new gallery:

```
let gallery = $(container).tinySlides([options]);
```

To allow for the gallery object to expose an API, default jQuery method chaining is broken.
This means that after using `tinySlides()`, no jQuery methods can be chained.

### *container*

The element to initialize the gallery on.
The HTML of your container may look something like this, where .gallery is the container.

```
<div class="gallery">
    <ul class="gallery-slides">
        <li class="gallery-slide"></li>
    </ul>
</div>
```

### *options*

The plugin accepts several options,

- `slideSelector` DOM selector for a single slide in the gallery. Default is '.gallery-slide'
- `activeClass`: Class name for indicating the current slide. Default is 'active'
- `start`: The default starting slide. This may also be defined in the HTML by adding the class 'active' to a slide. Default is 0
- `autoplay`: Default is false
- `autoresume`: Resume playing after an interaction. Default is true,
- `duration`: Duration of each slide in play mode. Can be both a Number and a function that accepts a jQuery object with the current slide. Default is 2000
- `keyboard`: Can be used to disable `keyboardArrows` and `keyboardSpace`. Default is true
- `keyboardArrows`: Allow using the left and right arrow keys to navigate the slides. Default is false
- `keyboardSpace`: Allow using the spacebar to move to the next slide. Default is false
- `onChange`: Callback that runs after the slide index has changed
- `onBeforeChange`: Callback that runs before the slide index changes
- `onPlay`: Callback that runs when autoplay is activated
- `onStop`: Callback that runs after autoplay is stopped
- `onReady`: Callback that runs the first time the `await` callback returns false
- `await`: Skip autoplay iterations while this callback returns true. This can be used to only start playing until after an event has occurred, such as loading an image. Default is (slides, current) => false,
- `eventNamespace`: Namespace for the plugin API events. Default is pluginName.toLowerCase()

These options can later be modified using the `setting()` API method.

## API

This plugin exposes an API that allows interaction with the gallery from outside of the plugin.

### Methods

By binding the gallery to a variable, the plugin's API methods can be used later in the code:

```
let gallery = $(container).tinySlides([options]);

gallery.next();
```

- `gallery.current()` Returns the current slide
- `gallery.slides()` Returns all slides
- `gallery.next()` Move to the next slide
- `gallery.previous()` Move to the previous slide
- `gallery.goto(index)` Move to a specific slide
- `gallery.play()` Resume play mode
- `gallery.stop()` Pause play mode
- `gallery.setting(option, value)` Update one of the plugin's options
- `gallery.destroy()` Stop the gallery. Returns undefined, so you can destroy the gallery by using `gallery = gallery.destroy()`.
- `gallery.end()` Go back to jQuery's default methode chaining. Basically, this method returns `$(container)`.

### Events

These events will fire after the callbacks defined under Options.
All events are prefixed with `eventNamespace` from the options.

- `tinyslideschange`
- `tinyslidesbeforechange`
- `tinyslidesplay`
- `tinyslidesstop`
- `tinyslidesready`

## License

Copyright 2017 Bastiaan ten Klooster

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
