import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actions } from "../actions/followersActions";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Checkbox,
    Select,
    InputLabel,
    MenuItem,
    FormControlLabel,
    Snackbar,
} from "@material-ui/core";
import { Field, reduxForm } from "redux-form";
import Autocomplete from "./FormComponents/Autocomplete";
import navigationInfoSelector from "../selectors/navigationSelector";
import IsSystemRadio from "./IsSystemRadio";
import Papa from 'papaparse';
import Cookies from "js-cookie";

import "./EditFollowerModal.scss";

class EditFollowerModal extends Component {
    static propTypes = {
        editMode: PropTypes.bool,
        open: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        let editCfg = {
            title: "Edit Follower",
            doneBtn: "Update",
        };

        let newCfg = {
            title: "Create Follower",
            doneBtn: "Create",
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.importFollowers = this.importFollowers.bind(this);
        this.inviteGmail = this.inviteGmail.bind(this);
        this.copyInvitation = this.copyInvitation.bind(this);
        this.selectInvitation = this.selectInvitation.bind(this);
        this.toggleSystem = this.toggleSystem.bind(this);
        this.renderForm = this.renderForm.bind(this);
        this.autocompleteNextField = this.autocompleteNextField.bind(this);
        this.cfg = props.editMode ? editCfg : newCfg;
        this.state = {
            invite_gmail: false,
            invitation: Cookies.get('defaultInvitation') ? this.props.invitations.find(x => x.id === Cookies.get('defaultInvitation')) : this.props.invitations[0],
            snackbarCopyInvitationState: false,
            is_system: (props.editMode && props.follower.is_system) ? props.follower.is_system : false
        }

        this.nameFieldRef = React.createRef();
        this.emailFieldRef = React.createRef();
    }

    importFollowers(e) {
        const importFile = e.target.files[0];
        Papa.parse(importFile, {
            header: true,
            complete: ({ data }) => {
                if (_.every(data, (follower) => _.isEmpty(validateInput(follower)))) {
                    for (const follower of data) {
                        this.props.create({
                            ...follower,
                            clinic: this.props.initialValues.clinic
                        });
                    }
                    this.props.onClose();
                }
            }
        })


    }

    handleClose() {
        this.props.onClose();
    }

    handleSubmit(formData) {
        formData.name = formData.field1; // Use the weird field names to disable browser autocomplete
        formData.email = formData.field2;

        formData.is_system = this.state.is_system;
        if (this.props.editMode) this.props.update({ ...formData, id: this.props.followerId });
        else this.props.create(formData);

        if (this.state.invite_gmail) this.inviteGmail(formData.email);


        this.props.onClose();
    }

    inviteGmail(email) {
        const subject = encodeURIComponent(this.state.invitation.subject);
        const body = encodeURIComponent(this.state.invitation.body);
        window.open("https://mail.google.com/mail/u/0/?view=cm&fs=1&to="+email+"&su="+subject+"&body="+body+"&tf=1", "_blank");
    }

    copyInvitation() {
        if (navigator) {
            navigator.clipboard.writeText(this.state.invitation.body).then(() => {
                this.setState({snackbarCopyInvitationState: true})
            }, (err) => {
                window.prompt("Copy to clipboard: Ctrl+C, Enter", this.state.invitation.body);
            });
        } else {
            window.prompt("Copy to clipboard: Ctrl+C, Enter", this.state.invitation.body);
        }
    }

    selectInvitation(event) {
        this.setState({ invitation: this.props.invitations.find(x => x.id === event.target.value)});
    }

    toggleSystem() {
        this.setState({
           is_system: !this.state.is_system
        });
    }

    autocompleteNextField(selectedOption, labelKey) {
        if (labelKey === "name") {
            this.emailFieldRef.current.value = selectedOption.email;
            this.props.formData.values.field2 = selectedOption.email;
        } else {
            this.nameFieldRef.current.value = selectedOption.name;
            this.props.formData.values.field1 = selectedOption.name;
        }
    }

    renderForm() {
        return (
            <form autoComplete="off">
                <Field
                    options={this.props.googleContacts}
                    type="text"
                    placeholder="Name"
                    name="field1"
                    component={Autocomplete}
                    autocompleteNextField={this.autocompleteNextField}
                    labelKey="name"
                    inputRef={this.nameFieldRef}
                />
                <Field
                    options={this.props.googleContacts}
                    type="email"
                    placeholder="Email"
                    name="field2"
                    component={Autocomplete}
                    autocompleteNextField={this.autocompleteNextField}
                    labelKey="email"
                    inputRef={this.emailFieldRef}
                />

                {!this.props.editMode && (
                    <div>
                        <IsSystemRadio
                            isAdmin={this.props.isAdmin}
                            isSystem={this.state.is_system}
                            toggleSystem={this.toggleSystem}
                        />
                        {this.props.invitations.length > 0 && (
                            <Grid container justify="space-between" alignItems="center" direction="column" id="inviteGmail">
                                <Grid container justify="space-between" alignItems="center">
                                    <Grid item>
                                        <InputLabel id="select_invitation-label">Invitation Template</InputLabel>
                                        <Select
                                            id="select_invitation"
                                            labelId="select_invitation-label"
                                            defaultValue={Cookies.get('defaultInvitation') ? Cookies.get('defaultInvitation') : this.props.invitations[0].id}
                                            style={{ width: "100%" }}
                                            onChange={this.selectInvitation}
                                        >
                                            {this.props.invitations.map((invitation, i) => (
                                                <MenuItem value={invitation.id} key={i}>
                                                    {invitation.title ? invitation.title : invitation.subject}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Grid>
                                    <Grid item>
                                        <Button component="span" variant="contained" onClick={this.copyInvitation} id="copyInvitation">Copy Invitation</Button>
                                        <Snackbar
                                            open={this.state.snackbarCopyInvitationState}
                                            onClose={() => this.setState({snackbarCopyInvitationState: false})}
                                            autoHideDuration={1000}
                                            message="Copied to clipboard!"
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <Field
                                        name="invite_gmail"
                                        component={({ input: { onChange, value }, meta, ...custom }) => (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        color="primary"
                                                        checked={this.state.invite_gmail}
                                                        onChange={() => this.setState({invite_gmail: !this.state.invite_gmail})}
                                                        {...custom}
                                                    />
                                                }
                                                label={(<span className="invite_subtext">Invite with GMail</span>)}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </div>
                    // <Field type="password" placeholder="Password" name="password" component={TextField} />

                    // <Field name='clinic'
                    //        label='Clinic'
                    //        required={true}
                    //        component={SelectField}>
                    // {
                    //     this.props.clinics.map((clinic, idx) => (
                    //         <MenuItem
                    //             className={`select-clinic-option-${idx}`}
                    //             value={clinic.id}
                    //             primaryText={clinic.name}
                    //         />
                    //     ))
                    // }
                    // </Field>
                )}
            </form>
        );
    }

    render() {
        return (
            <Dialog open={this.props.open} className="edit-follower-modal" onClose={this.props.onClose}>
                <DialogTitle>{this.cfg.title}</DialogTitle>
                <DialogContent>{this.renderForm()}</DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose}>
                        Cancel
                    </Button>
                    {!this.props.editMode && (
                        <React.Fragment>
                            <input
                                accept=".csv"
                                style={{ display: "none" }}
                                id="import-followers"
                                type="file"
                                onChange={this.importFollowers}
                            />
                            <label htmlFor="import-followers">
                                <Button component="span" variant="contained">
                                    Import
                                </Button>
                            </label>
                        </React.Fragment>
                    )}

                    <Button
                        onClick={this.props.handleSubmit(this.handleSubmit)}
                        color="primary"
                        variant="contained"
                        className="create-follower-btn"
                    >
                        {this.cfg.doneBtn}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

function validateInput(data) {
    let errors = {};

    if (!data.name) errors.name = "Required";

    if (!data.email) {
        errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
        errors.email = "Invalid email address";
    }

    if (!data.password) errors.password = "Required";

    return errors;
}

let Form = reduxForm({
    form: "editFollower",
    validate: validateInput,
})(EditFollowerModal);

function mapStateToProps(state) {
    const {
        modalProps: { followerId, editMode },
    } = navigationInfoSelector(state);
    const follower = _.find(state.followers.followers, (f) => f.id === followerId);
    const invitations = state.invitations.invitations;
    const clinics = state.clinics.clinics;
    const current_clinic_id = state.leaders.leaders.current_clinic_id;
    const isAdmin = state.leaders.leaders.admin_permissions;
    const googleContacts = state.googleData.googleContacts;
    const formData = state.form.editFollower;

    const ret = {
        follower,
        invitations,
        clinics,
        editMode,
        isAdmin,
        googleContacts,
        formData
    };

    if (follower) {
        ret.initialValues = {
            name: follower.user.name,
            field1: follower.user.name,
            email: follower.user.email,
            field2: follower.user.email,
            is_system: follower.user.is_system,
        };
    } else {
        ret.initialValues = {
            clinic: current_clinic_id,
        };
    }
    return ret;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            update: actions.update,
            create: actions.create,
        },
        dispatch
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(Form);
