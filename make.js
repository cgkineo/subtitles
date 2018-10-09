var fsg = require("fs-glob");
var fs = require("fs");
var path = require("path");
var uglify = require("uglify-js");

var files = {};
files['arrays.js'] = fs.readFileSync("./src/util/arrays.js").toString();
files['objects.js'] = fs.readFileSync("./src/util/objects.js").toString();
files['strings.js'] = fs.readFileSync("./src/util/strings.js").toString();
files['javascript.js'] = fs.readFileSync("./src/util/javascript.js").toString();
files['html.js'] = fs.readFileSync("./src/util/html.js").toString();
files['events.js'] = fs.readFileSync("./src/util/events.js").toString();
files['properties.js'] = fs.readFileSync("./src/util/properties.js").toString();
files['class.js'] = fs.readFileSync("./src/util/class.js").toString();
files['elements.js'] = fs.readFileSync("./src/util/elements.js").toString();
files['subtitles.js'] = fs.readFileSync("./src/subtitles/subtitles.js").toString();
files['defaultoptions.js'] = fs.readFileSync("./src/subtitles/defaultoptions.js").toString();

fsg.stats({
    globs: [
        "*.js",
        "**/*.js",
        "!util/arrays.js",
        "!util/objects.js",
        "!util/strings.js",
        "!util/javascript.js",
        "!util/html.js",
        "!util/events.js",
        "!util/properties.js",
        "!util/class.js",
        "!elements/elements.js",
        "!subtitles/subtitles.js",
        "!subtitles/defaultoptions.js"
    ],
    location: "./src"
}).then((stats)=>{

    return stats.each((stat, next, resolve)=>{

        if (!stat) return resolve(files);

        files[fsg.rel(stat.location, "./src")] = fs.readFileSync(stat.location).toString();

        next();

    });

}).then((files)=>{

    var result = uglify.minify(files, {
        toplevel: true,
        compress: {
            passes: 2
        },
        mangle: {
            properties: {
                regex: /_.*/,
                builtins : true
            }
        },
        output: {
            beautify: false
        }
    });
    if (result.error) {
        console.log(files['jquery.video.css']);
        console.log(result.error);
        return;
    }

    var values = [];
    for (var k in files) values.push(files[k]);

    fsg.mkdir("./build");
    var header = fs.readFileSync('./header.js').toString();
    var footer = fs.readFileSync('./footer.js').toString();
    fs.writeFileSync("./build/subtitles.js", header+values.join("\n")+footer);
    fs.writeFileSync("./build/subtitles.min.js", header+result.code+footer);

});
