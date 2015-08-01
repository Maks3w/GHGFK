///<reference path="../../../typings/tsd.d.ts"/>

export class AlertController {
    public alerts:{type:string, msg:string}[] = [];

    constructor($scope:ng.IScope) {
        $scope.$on("alert.new", (event:ng.IAngularEvent, type:string, msg:string) => {
            this.alerts.push({type: type, msg: msg});
        });
    }

    close(index:number):void {
        this.alerts.splice(index, 1);
    }
}
