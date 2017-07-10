"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
function getAllExtensionModules(NODE_PATH) {
    var ret = [];
    var files = fs.readdirSync(NODE_PATH);
    for (var i in files) {
        var module_1 = files[i];
        var filePath = path.resolve(NODE_PATH, module_1);
        var fstat = fs.statSync(filePath);
        if (fstat.isDirectory()) {
            var packageJSONFilePath = path.resolve(filePath, "package.json");
            var readmeFilePath = path.resolve(filePath, "README.md");
            try {
                fs.accessSync(packageJSONFilePath);
                var s = fs.readFileSync(packageJSONFilePath, 'utf8');
                var package_json = JSON.parse(s);
                var README_md = null;
                try {
                    fs.accessSync(readmeFilePath);
                    README_md = fs.readFileSync(readmeFilePath, 'utf8');
                }
                catch (e) { }
                ret.push({ module: module_1, package_json: package_json, README_md: README_md });
            }
            catch (e) { }
        }
    }
    return ret;
}
exports.getAllExtensionModules = getAllExtensionModules;
