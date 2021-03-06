import { connect } from "react-redux";
import React, { useState } from "react";
import { bindActionCreators } from "redux";
import {
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Drawer,
    Collapse,
    Toolbar,
    makeStyles,
} from "@material-ui/core";
import {
    Weekend,
    ViewList,
    EventNote,
    ExitToApp,
    ExpandLess,
    ExpandMore,
    Group,
    Person,
    ContactMail,
    DirectionsWalk,
    AddToHomeScreen,
    PermIdentity,
    List as ListIcon,
} from "@material-ui/icons";
import { useBelowBreakpoint } from "./hooks";
import { actions } from "../actions/menuActions";
import ClinicSettings from "./ClinicSettings";
import navigationSelector from "../selectors/navigationSelector";

const useStyles = makeStyles((theme) => ({
    drawer: {
        minWidth: 250,
        padding: theme.spacing(1),
    },
    logoutButton: {
        color: theme.palette.error.main,
    },
    installButton: {
        marginTop: "auto",
        marginBottom: theme.spacing(1),
    },
}));

function SideMenu(props) {
    const classes = useStyles(props);
    const screenSmall = useBelowBreakpoint("sm");

    const [followerMenuOpen, setFollowerMenuOpen] = useState(true);

    const addToHomeScreen = () => props.installPrompt.prompt();

    return (
        <Drawer
            open={props.menuOpen}
            variant={screenSmall ? "temporary" : "permanent"}
            classes={{ root: classes.drawer, paper: classes.drawer }}
            PaperProps={{ elevation: 4 }}
            onClose={props.toggleMenu}
        >
            {screenSmall ? null : (
                /* a placeholder to keep the content below the app bar.
                   The drawer must have a separate toolbar placeholder because it has position: fixed.
                   Not required on "mobile" cause then we use the temporary drawer style. */
                <Toolbar />
            )}
            {props.user && (
                <List>
                    <ListItem>
                        <ListItemIcon style={{margin: "0 auto", alignItems: "center"}}>
                            <PermIdentity />
                            <ListItemText primary={props.user.email} />
                            {props.user?.isLeader && props.currentClinic?.is_primary && <ClinicSettings />}
                        </ListItemIcon>
                    </ListItem>
                </List>
            )}
            <Divider />
            <List>
                {props.user?.isLeader && (
                    <>
                        {props.leader.group_permissions ? (
                            <React.Fragment>
                                <ListItem button onClick={() => setFollowerMenuOpen(!followerMenuOpen)}>
                                    <ListItemIcon>
                                        <DirectionsWalk />
                                    </ListItemIcon>
                                    <ListItemText primary="Followers" />
                                    {followerMenuOpen ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                                <Collapse in={followerMenuOpen}>
                                    <List style={{ marginLeft: 20 }}>
                                        <ListItem button onClick={() => props.clickMenuItem("followers")}>
                                            <ListItemIcon>
                                                <Person />
                                            </ListItemIcon>
                                            <ListItemText primary="Follower List" />
                                        </ListItem>

                                        <ListItem button onClick={() => props.clickMenuItem("followerGroups")}>
                                            <ListItemIcon>
                                                <Group />
                                            </ListItemIcon>
                                            <ListItemText primary="Follower Groups" />
                                        </ListItem>
                                    </List>
                                </Collapse>
                            </React.Fragment>
                        ) : (
                            <ListItem button onClick={() => props.clickMenuItem("followers")}>
                                <ListItemIcon>
                                    <DirectionsWalk />
                                </ListItemIcon>
                                <ListItemText primary="Followers" />
                            </ListItem>
                        )}
                        <ListItem button onClick={() => props.clickMenuItem("clinics")}>
                            <ListItemIcon>
                                <ListIcon />
                            </ListItemIcon>
                            <ListItemText primary="Clinics List" />
                        </ListItem>
                        <ListItem button onClick={() => props.clickMenuItem("criteriaList")}>
                            <ListItemIcon>
                                <EventNote />
                            </ListItemIcon>
                            <ListItemText primary="Criteria List" />
                        </ListItem>
                        <ListItem button onClick={() => props.clickMenuItem("invitations")}>
                            <ListItemIcon>
                                <ContactMail />
                            </ListItemIcon>
                            <ListItemText primary="GMail Invitations" />
                        </ListItem>
                    </>
                )}
                {props.user?.isFollower && (
                    <ListItem button onClick={() => props.clickMenuItem("follower/resonators")}>
                        <ListItemIcon>
                            <ViewList />
                        </ListItemIcon>
                        <ListItemText primary="Incoming Resonators" />
                    </ListItem>
                )}
            </List>
            <Divider />
            <List>
                <ListItem button onClick={() => props.clickMenuItem("logout")} className={classes.logoutButton}>
                    <ListItemIcon>
                        <ExitToApp color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
            {props.installPrompt && (
                <div className={classes.installButton}>
                    <Divider />
                    <List>
                        <ListItem button onClick={addToHomeScreen}>
                            <ListItemIcon>
                                <AddToHomeScreen />
                            </ListItemIcon>
                            <ListItemText primary="Add to Home Screen" />
                        </ListItem>
                    </List>
                </div>
            )}
        </Drawer>
    );
}

export default connect(
    (state) => ({
        menuOpen: navigationSelector(state).menuOpen,
        leader: state.leaders.leaders,
        currentClinic: state.clinics?.clinics?.find(c => c.id === state.leaders?.leaders?.current_clinic_id),
        user: state.session.user,
        installPrompt: state.pwa.installPrompt,
    }),
    (dispatch) =>
        bindActionCreators(
            {
                toggleMenu: actions.toggleMenu,
                clickMenuItem: actions.clickMenuItem,
            },
            dispatch
        )
)(SideMenu);
