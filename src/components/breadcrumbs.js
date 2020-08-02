import _ from "lodash";
import React from "react";
import { connect } from "react-redux";
import { matchPath } from "react-router";
import { Link } from "react-router-dom";
import followerSelector from "../selectors/followerSelector";
import resonatorSelector from "../selectors/resonatorSelector";
import criterionSelector from "../selectors/criterionSelector";
import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { NavigateNext } from "@material-ui/icons";

function Breadcrumbs(props) {
    const hideStubs = useMediaQuery(useTheme().breakpoints.down("sm"));

    return (
        <MuiBreadcrumbs style={{ flexGrow: 1, color: "inherit" }} separator={<NavigateNext />}>
            {_.flatMap(props.routeStack, (route, index) =>
                hideStubs && route.stubRoute ? null : (
                    <MuiLink key={index} color="inherit" to={getLinkUri(route, index, props.routeStack)} component={Link}>
                        <Typography variant="h6">{_.truncate(route.title, { length: 20 })}</Typography>
                    </MuiLink>
                )
            )}
        </MuiBreadcrumbs>
    );
}

function getLinkUri(route, index, routeStack) {
    return (route.stubRoute ? _.get(routeStack, `[${index + 1}].route`) : route.route) || "";
}

function getRouteStack(state) {
    const { pathname } = location;

    let routeStack = resolveRouteStack(pathname, "", tree);

    routeStack = routeStack.map((r) => ({
        route: r.match.url,
        stubRoute: r.stubRoute,
        title: r.title(state),
    }));

    routeStack = routeStack.length > 1 ? routeStack.slice(1) : routeStack;
    return routeStack;
}

function resolveRouteStack(fullPathname, pathname, tree) {
    if (!tree) return [];

    let childRoute, childKey, childMatch, childTitle, stubRoute;

    for (let route of _.keys(tree.routes)) {
        const r = pathname + route;

        let match = matchPath(fullPathname, {
            path: r,
            exact: false,
            strict: false,
        });

        const routeData = tree.routes[route];

        if (match) {
            childRoute = r;
            childKey = route;
            childMatch = match;
            childTitle = resolveChildTitle(routeData.title, match);
            stubRoute = routeData.stubRoute;
            break;
        }
    }

    if (childMatch) {
        const downStack = resolveRouteStack(fullPathname, childRoute, tree.routes[childKey]);
        return [
            {
                match: childMatch,
                title: childTitle,
                stubRoute,
            },
        ].concat(downStack);
    }

    return [];
}

const resolveChildTitle = (title, match) => (state) => {
    if (typeof title === "string") return title;

    if (typeof title === "function") return title(state, match.params);

    throw new Error("unexpected title type", title);
};

const tree = {
    routes: {
        "/": {
            title: "Resonators",
            routes: {
                followers: {
                    title: "Followers",
                    routes: {
                        "/:followerId": {
                            title: (state, routeParams) => {
                                const follower = followerSelector(state, routeParams.followerId);
                                return _.get(follower, "user.name");
                            },
                            stubRoute: true,
                            routes: {
                                "/resonators": {
                                    title: "Resonators",
                                    routes: {
                                        "/new": {
                                            title: "Create",
                                        },
                                        "/:resonatorId": {
                                            title: (state, routeParams) => {
                                                const resonator = resonatorSelector(state, routeParams.resonatorId);
                                                return _.truncate(_.get(resonator, "title", "Resonator"), {
                                                    length: 13,
                                                });
                                            },
                                            stubRoute: true,
                                            routes: {
                                                "/stats/:qid": {
                                                    title: "Criterion stats",
                                                },
                                                "/edit": {
                                                    title: "Edit",
                                                },
                                                "/show": {
                                                    title: "Preview",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                resetPassword: {
                    title: "Reset Password",
                },
                "criteria/submit": {
                    title: "Submit Feedback",
                },
                clinics: {
                    title: "Clinics",

                    routes: {
                        "/criteria": {
                            title: "Criteria",

                            routes: {
                                "/new": {
                                    title: "Create",
                                },
                                "/:criterionId": {
                                    title: (state, routeParams) => {
                                        const criterion = criterionSelector(state, routeParams.criterionId);
                                        return criterion.title;
                                    },

                                    stubRoute: true,

                                    routes: {
                                        "/edit": {
                                            title: "Edit",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                login: {
                    title: "Login",
                },
            },
        },
    },
};

export default connect((state) => ({ routeStack: getRouteStack(state) }), null)(Breadcrumbs);
