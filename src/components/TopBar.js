import React from "react";
import { connect } from "react-redux";
import { Menu } from "@material-ui/icons";
import { bindActionCreators } from "redux";
import { AppBar, Toolbar, IconButton, Hidden, makeStyles, Button } from "@material-ui/core";

import HeaderLogo from "./HeaderLogo";
import Breadcrumbs from "./Breadcrumbs";
import { actions } from "../actions/menuActions";
import loginInfoSelector from "../selectors/loginInfo";
import {actions as navigationActions} from "../actions/navigationActions";

const useStyles = makeStyles((theme) => ({
    appBar: { zIndex: theme.zIndex.drawer + 1 },
    toolbar: { justifyContent: "space-between" },
    leftSide: { display: "flex", alignItems: "center" },
}));

function TopBar(props) {
    const classes = useStyles();

    return (
        <AppBar className={classes.appBar}>
            <Toolbar className={classes.toolbar}>
                <div className={classes.leftSide}>
                    {props.loggedIn ? (
                        <Hidden mdUp>
                            <IconButton onClick={props.toggleMenu} color="inherit" edge="start">
                                <Menu />
                            </IconButton>
                        </Hidden>
                    ) : null}
                    <Breadcrumbs />
                </div>
                <Button variant="contained" onClick={props.showDonatePaypalModal}>Donate</Button>
                <Hidden xsDown>
                    <HeaderLogo />
                </Hidden>
            </Toolbar>
        </AppBar>
    );
}

export default connect(
    (state) => ({ loggedIn: loginInfoSelector(state).loggedIn }),
    (dispatch) => bindActionCreators({
        toggleMenu: actions.toggleMenu,
        showDonatePaypalModal: () =>
            navigationActions.showModal({name: "donatePaypal"}),
    }, dispatch)
)(TopBar);
