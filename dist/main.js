import {Buffer as $ehk8a$Buffer} from "buffer";
import {join as $ehk8a$join} from "node:path";
import {request as $ehk8a$request} from "node:http";
import {request as $ehk8a$request1} from "node:https";
import {URL as $ehk8a$URL} from "node:url";






var $e77feb0aa7cafcbf$require$Buffer = $ehk8a$Buffer;
const $e77feb0aa7cafcbf$var$typeOf = (obj)=>{
    return ({}).toString.call(obj).split(" ")[1].slice(0, -1).toLowerCase();
};
class $e77feb0aa7cafcbf$export$7fa6c5b6f8193917 {
    constructor(url, options){
        this.options = {
            ...options
        };
        if (url) this.options.url = new (0, $ehk8a$URL)(url);
        if (options?.url) this.options.url = new (0, $ehk8a$URL)(options.url);
        this.options.query = options?.query;
        if (options?.path) this.options.url.pathname = (0, $ehk8a$join)(this.options.url.pathname, options.path);
        this.options.method = options?.method;
        this.options.headers = options?.headers ?? {};
        this.options.body = options?.body;
        this.options.timeout = options?.timeout;
        this.options.maxRedirects = options?.maxRedirects; // TODO: Implement redirects
        this.options.response = options?.response;
        this.options.maxSize = options?.maxSize;
        return this;
    }
    set(options) {
        if (options?.url) this.options.url = new (0, $ehk8a$URL)(options.url);
        this.options.query = options?.query;
        if (options?.path) this.options.url.pathname = (0, $ehk8a$join)(this.options.url.pathname, options.path);
        this.options.method = options?.method;
        this.options.headers = options?.headers ?? {};
        this.options.body = options?.body;
        this.options.timeout = options?.timeout;
        this.options.maxRedirects = options?.maxRedirects;
        this.options.response = options?.response;
        this.options.maxSize = options?.maxSize;
        return this;
    }
    url(option) {
        this.options.url = new (0, $ehk8a$URL)(option);
        return this;
    }
    path(option) {
        this.options.url.pathname = (0, $ehk8a$join)(this.options.url.pathname, option);
        return this;
    }
    query(option) {
        if ($e77feb0aa7cafcbf$var$typeOf(option) === "object") this.options.query = {
            ...option,
            ...this.options.query
        };
        else if ($e77feb0aa7cafcbf$var$typeOf(option) === "function") this.options.query = {
            ...option,
            ...option(new $e77feb0aa7cafcbf$export$62297b13309008b2(this)).toJSON()
        };
        return this;
    }
    body(option) {
        this.options.body = option;
        return this;
    }
    timeout(option) {
        this.options.timeout = option;
        return this;
    }
    maxRedirects(option) {
        this.options.maxRedirects = option;
        return this;
    }
    response(option) {
        this.options.response = option;
        return this;
    }
    maxSize(option) {
        this.options.maxSize = option;
        return this;
    }
    headers(option) {
        if ($e77feb0aa7cafcbf$var$typeOf(option) === "object") this.options.headers = {
            ...option,
            ...this.options.headers
        };
        else if ($e77feb0aa7cafcbf$var$typeOf(option) === "function") this.options.headers = {
            ...option,
            ...option(new $e77feb0aa7cafcbf$export$79b704688b15c0f4(this)).toJSON()
        };
        return this;
    }
    send() {
        return new Promise((resolve, reject)=>{
            if (this.options.body) {
                if (!this.options.headers.hasOwnProperty("content-type")) {
                    if ($e77feb0aa7cafcbf$var$typeOf(this.options.body) === "object") {
                        this.options.body = JSON.stringify(this.options.body);
                        this.options.headers["content-type"] = "application/json";
                    }
                }
                if (!this.options.headers.hasOwnProperty("content-length")) this.options.headers["content-length"] = $e77feb0aa7cafcbf$require$Buffer.byteLength(this.options.body);
            }
            const url = this.options.url;
            if (!url) throw new Error("No URL provided to the request");
            const options = {
                hostname: url.hostname.replace("[", "").replace("]", ""),
                port: url.port,
                path: `${url.pathname}${this.options.query ? new $e77feb0aa7cafcbf$export$62297b13309008b2(this.options.query) : ""}`,
                method: this.options.method ? this.options.method.toUpperCase() : "GET",
                headers: this.options.headers
            };
            let response;
            let request;
            const resHandler = (stream)=>{
                if (this.options.response == "stream") resolve(stream);
                else {
                    response = new $e77feb0aa7cafcbf$export$83b144360b27fe0(stream, options, {
                        responseType: this.options.response ?? "full",
                        contentTypeHeader: stream.headers["content-type"]
                    });
                    stream.on("error", (error)=>{
                        reject(error);
                    });
                    stream.on("aborted", ()=>{
                        reject(new Error("Server aborted request"));
                    });
                    stream.on("data", (chunk)=>{
                        response.addChunk(chunk);
                        const byteLength = response.size();
                        if (byteLength > this.options.maxSize) throw new Error("Body over maximum size: " + this.options.maxSize);
                    });
                    stream.on("end", ()=>{
                        resolve(response.toJSON());
                    });
                }
            };
            if (url.protocol === "http:") request = (0, $ehk8a$request)(options, resHandler);
            else if (url.protocol === "https:") request = (0, $ehk8a$request1)(options, resHandler);
            if (this.options.timeout) request.setTimeout(this.options.timeout, ()=>{
                request.abort();
                if (this.options.response !== "stream") reject(new Error("Timeout reached"));
            });
            request.on("error", (error)=>{
                reject(error);
            });
            if (this.options.body) request.write(this.options.body);
            request.end();
        });
    }
}
class $e77feb0aa7cafcbf$export$79b704688b15c0f4 {
    constructor(){
        this.headers = new Map();
        return this;
    }
    add(options) {
        if ($e77feb0aa7cafcbf$var$typeOf(options) === "object") for(let item in options)this.headers.set(item, options[item]);
        else throw new Error("Invalid headers");
        return this;
    }
    remove(name) {
        this.headers.delete(name);
        return this;
    }
    set(...options) {
        if ($e77feb0aa7cafcbf$var$typeOf(options[0]) === "object") this.headers.set(options[0].name, options[0].value);
        else if ($e77feb0aa7cafcbf$var$typeOf(options[0]) === "string") this.headers.set(options[0], options[1]);
        else throw new Error("Invalid headers");
        return this;
    }
    clear(name) {
        this.headers = new Map();
        return this;
    }
    toJSON() {
        return Object.fromEntries(this.headers);
    }
    get(name) {
        return this.headers.get(name);
    }
    toString() {
        const JSONHeaders = this.toJSON();
        let headers = [];
        for(let item in JSONHeaders)headers.push(`${item}: ${JSONHeaders[item]}`);
        return headers.join("\r");
    }
}
class $e77feb0aa7cafcbf$export$62297b13309008b2 {
    constructor(){
        this.query = new Map();
        return this;
    }
    add(options) {
        if ($e77feb0aa7cafcbf$var$typeOf(options) === "object") for(let item in options)this.query.set(item, options[item]);
        else throw new Error("Invalid query");
        return this;
    }
    remove(name) {
        this.query.delete(name);
        return this;
    }
    set(...options) {
        if ($e77feb0aa7cafcbf$var$typeOf(options[0]) === "object") this.query.set(options[0].name, options[0].value);
        else if ($e77feb0aa7cafcbf$var$typeOf(options[0]) === "string") this.query.set(options[0], options[1]);
        else throw new Error("Invalid query");
        return this;
    }
    clear(name) {
        this.query = new Map();
        return this;
    }
    toJSON() {
        return Object.fromEntries(this.query);
    }
    get(name) {
        return this.query.get(name);
    }
    toString() {
        const queryJSON = this.toJSON();
        let query = [];
        for(let item in queryJSON)query.push(`${item}=${queryJSON[item]}`);
        if (query.length === 0) return "";
        return "?" + query.join("&");
    }
}
class $e77feb0aa7cafcbf$export$83b144360b27fe0 {
    constructor(res, req, options){
        this.res = res;
        this.responseType = options.responseType ?? "full";
        this.req = req;
        this.headers = res.headers;
        this.statusCode = res.statusCode;
        this.statusMessage = res.statusMessage;
        this.res = res;
        this.contentTypeHeader = options.contentTypeHeader;
        this.body = options.responseType === "bufferArray" ? [] : $e77feb0aa7cafcbf$require$Buffer.alloc(0);
    }
    addChunk(chunk) {
        if (this.responseType === "bufferArray") this.body.push(chunk);
        else this.body = $e77feb0aa7cafcbf$require$Buffer.concat([
            this.body,
            chunk
        ]);
    }
    toJSON() {
        if (this.responseType === "full") return {
            res: this.res,
            req: this.req,
            headers: this.headers,
            statusCode: this.statusCode,
            statusMessage: this.statusMessage,
            body: this.body
        };
        else if (this.responseType === "json") return JSON.parse(this.body);
        else if (this.responseType === "text") return this.body.toString("utf8");
        else if (this.responseType === "buffer") return $e77feb0aa7cafcbf$require$Buffer.from(this.body, "utf8");
        else if (this.responseType === "arrayBuffer") return new Uint8Array(this.body).buffer;
        else if (this.responseType === "bufferArray") return this.body;
        else if (this.responseType === "blob") return new Blob(this.body, {
            type: this.contentTypeHeader.split(";")[0]
        });
        else throw new Error("Invalid response type");
    }
    size() {
        return $e77feb0aa7cafcbf$require$Buffer.byteLength(this.body);
    }
    data = ()=>{
        return this.body;
    };
}


export {$e77feb0aa7cafcbf$export$7fa6c5b6f8193917 as Request, $e77feb0aa7cafcbf$export$62297b13309008b2 as Query, $e77feb0aa7cafcbf$export$79b704688b15c0f4 as Headers, $e77feb0aa7cafcbf$export$83b144360b27fe0 as ResponseData};
//# sourceMappingURL=main.js.map
