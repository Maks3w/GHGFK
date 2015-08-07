import * as BranchCreate from "./BranchCreate.ts";
import * as BranchDelete from "./BranchDelete.ts";
import * as BranchCreateMenu from "./BranchCreateMenu.ts";
import * as MergeBranch from "./MergeBranch.ts";
import * as MergeButton from "./MergeButton.ts";
import * as MergeMenu from "./MergeMenu.ts";
import {default as GithubModule} from "../module.ts";

BranchCreate.Factory.create.$inject = ["github.repository"];
BranchDelete.Factory.create.$inject = ["github.repository"];
MergeBranch.Factory.create.$inject = ["github.repository"];
MergeButton.Controller.$inject = ["github.git-flow", "$scope"];

let moduleName:string = "maks3w.github.directives";

angular.module(moduleName, [GithubModule])
    .directive("ghBranchCreate", BranchCreate.Factory.create)
    .directive("ghBranchCreateMenu", BranchCreateMenu.Factory.create)
    .directive("ghBranchDelete", BranchDelete.Factory.create)
    .directive("ghMerge", MergeBranch.Factory.create)
    .directive("ghMergeMenu", MergeMenu.Factory.create)
    .directive("mergeButton", MergeButton.Factory.create)
;

export {
    BranchCreate,
    BranchDelete,
    BranchCreateMenu,
    MergeBranch,
    MergeButton,
    MergeMenu
}

export default moduleName;
