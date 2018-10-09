# Subtitles

### Building
You'll need to clone the project and edit the source files.
Run the following to get the build output.
```
$ npm install
$ npm run build
```

### Example
```javascript

    $("video").subtitles(".subtitles");
    $("video")[0].subtitles.tracks[0].default = true;
    $("video").subtitles("destroy");

```

```html
    <video id="c-40" preload="none" src="c-40.mp4" loop poster="c-40.jpg">
        <track kind="captions" src="c-40-de.vtt" type="text/vtt" srclang="de" label="Deutsch">
        <track kind="captions" src="c-40-en.vtt" type="text/vtt" srclang="en" label="English">
    </video>

    <div class="subtitles">

    </div>
```

```javascript

    $("video").subtitles("destroy");

```
