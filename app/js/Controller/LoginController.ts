///<reference path="../../../typings/tsd.d.ts"/>

import {AuthenticationService} from "../Service/AuthenticationService.ts";

export class LoginController {
    public github_token:string;

    private $location:ng.ILocationService;
    private AuthenticationService:AuthenticationService;

    constructor($location:ng.ILocationService, AuthenticationService:AuthenticationService) {
        this.$location = $location;
        this.AuthenticationService = AuthenticationService;
        this.github_token = AuthenticationService.getCredentials();
    }

    login():void {
        this.AuthenticationService.login(this.github_token)
            .then(() => {
                this.$location.path("/");
            })
        ;
    }
}
