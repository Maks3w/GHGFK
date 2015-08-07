import {BranchCreate, BranchCreateFactory} from "./BranchCreate.ts";
import {BranchDelete, BranchDeleteFactory} from "./BranchDelete.ts";
import {BranchCreateMenu, BranchCreateMenuFactory} from "./BranchCreateMenu.ts";
import {MergeBranch, MergeBranchFactory} from "./MergeBranch.ts";
import {MergeButton, MergeButtonFactory} from "./MergeButton.ts";
import {MergeMenu, MergeMenuFactory} from "./MergeMenu.ts";
import {default as GithubModule} from "../module.ts";

BranchCreateFactory.create.$inject = ["github.repository"];
BranchDeleteFactory.create.$inject = ["github.repository"];
MergeBranchFactory.create.$inject = ["github.repository"];
MergeButtonFactory.create.$inject = ["github.git-flow"];

let moduleName:string = "maks3w.github.directives";

angular.module(moduleName, [GithubModule])
    .directive("ghBranchCreate", BranchCreateFactory.create)
    .directive("ghBranchCreateMenu", BranchCreateMenuFactory.create)
    .directive("ghBranchDelete", BranchDeleteFactory.create)
    .directive("ghMerge", MergeBranchFactory.create)
    .directive("ghMergeMenu", MergeMenuFactory.create)
    .directive("mergeButton", MergeButtonFactory.create)
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
