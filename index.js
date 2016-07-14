/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author liuzhenwei
*/
var loaderUtils = require("loader-utils");
var mime = require("mime");

module.exports = function(content) {

	this.cacheable && this.cacheable();

	if(!this.emitFile) throw new Error("emitFile is required from module system");

	var query = loaderUtils.parseQuery(this.query);

	var limit = (this.options && this.options.url && this.options.url.dataUrlLimit) || 1;
	if(query.limit) {
		limit = parseInt(query.limit, 10);
	}

	var mimetype = query.mimetype || query.minetype || mime.lookup(this.resourcePath);

	if(limit <= 0 || content.length < limit) {
		
		return "module.exports = " + JSON.stringify("data:" + (mimetype ? mimetype + ";" : "") + "base64," + content.toString("base64"));
	
	} else {

		query.copyto = query.copyto || "[hash].[ext]";
		query.name = query.name || query.copyto;
		query.path = query.path || "";

		if (query.path != "" && query.path.slice(query.path.length - 1) !== "/") {
			query.path += "/";
		}

		var copyto = loaderUtils.interpolateName(this, query.copyto, {
			context: query.context || this.options.context,
			content: content,
			regExp: query.regExp
		});

		var url = query.path + copyto;

		var name = loaderUtils.interpolateName(this, query.name, {
			context: query.context || this.options.context,
			content: content,
			regExp: query.regExp
		});

		var rawRequest = this._module.rawRequest;

		if( rawRequest.indexOf(copyto) > -1 ){
			name = rawRequest.replace(copyto, name);
		}

		this.emitFile(url, content);
		return "module.exports = __webpack_public_path__ + " + JSON.stringify(name) + ";";
	}
};
module.exports.raw = true;
