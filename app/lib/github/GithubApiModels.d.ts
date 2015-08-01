declare module gh {
    interface IUser {
        login: string;
    }

    interface IOrganization {
        login: string;
    }

    interface IRepository {
        full_name: string;
    }

    interface IMilestone {
        number:number;
    }

    interface IBranch {
        ref: string;
        repo: IRepository;
        sha: string;
    }

    interface IReference {
        ref: string;
        url: string;
        object: {
            type: string,
            sha: string,
            url: string
        };
    }

    interface IIssue {
    }

    interface IPr {
        assignee: {};
        base: IBranch;
        head: IBranch;
        merged: boolean;
        mergeable: boolean;
        number: number;
        title: string;
    }
}
