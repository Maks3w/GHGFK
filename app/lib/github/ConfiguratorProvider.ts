///<reference path="../../../typings/tsd.d.ts"/>

export class ConfiguratorProvider implements ng.IServiceProvider {
    public apiUrl:string = "https://api.github.com";
    public token:string;

    $get():{} {
        return {
            apiUrl: this.apiUrl,
            token: this.token
        };
    }
}
