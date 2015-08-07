import {ConfiguratorProvider} from "./ConfiguratorProvider";

export class Github {
    private configurator:ConfiguratorProvider;
    private $http:ng.IHttpService;

    constructor(configurator:ConfiguratorProvider, $http:ng.IHttpService) {
        this.configurator = configurator;
        this.$http = $http;
    }

    get(uri:string, params?:{}):ng.IPromise<any> {
        return this.makeRequest("get", uri, params);
    }

    patch(uri:string, data:{}):ng.IPromise<any> {
        return this.makeRequest("patch", uri, data);
    }

    post(uri:string, data:{}):ng.IPromise<any> {
        return this.makeRequest("post", uri, data);
    }

    put(uri:string, data:{}):ng.IPromise<any> {
        return this.makeRequest("put", uri, data);
    }

    delete(uri:string):ng.IPromise<{}> {
        return this.makeRequest("delete", uri);
    }

    private makeRequest(method:string, uri:string, data?:{}):ng.IPromise<any> {
        method = method.toLowerCase();

        let config:ng.IRequestConfig = {
            method: method,
            url: this.configurator.apiUrl + uri,
            headers: {
                Accept: "application/vnd.github.raw",
                Authorization: `token ${this.configurator.token}`
            }
        };

        switch (method) {
            case "get":
                config.params = data;
                break;
            case "patch":
            case "post":
            case "put":
                config.data = data;
                break;
            default:
                break;
        }

        return this.$http(config)
            .then((response:{data:{}}):{} => {
                return response.data;
            }
        );
    }
}
