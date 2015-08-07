import {AuthenticationService} from "../Service/AuthenticationService.ts";

export class AutoLoginController {
    constructor($location:ng.ILocationService, AuthenticationService:AuthenticationService) {
        if (AuthenticationService.hasCredentials()) {
            AuthenticationService.login()
                .then(() => {
                    $location.path("/");
                })
            ;
        } else {
            $location.path("/login");
        }
    }
}
