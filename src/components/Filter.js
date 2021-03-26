import React, {Component} from "react";
import FilterListIcon from '@material-ui/icons/FilterList';
import {Checkbox, FormControlLabel, Grid, TextField} from "@material-ui/core";

import "./Filter.scss";

class Filter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            search: ""
        };
        this.toggleFilter = this.toggleFilter.bind(this);
        this.renderList = this.renderList.bind(this);
    }

    toggleFilter() {
        this.setState({ isOpen: !this.state.isOpen});
    }

    renderList() {
        if (!this.state.isOpen) return false;

        return (
            <Grid className="filterBox" container direction="column">
                <Grid key="search" item>
                    <TextField
                        label={"Search " + this.props.name}
                        value={this.state.search}
                        onChange={(e) => this.setState({search: e.target.value})}
                    />
                </Grid>
                <Grid key="all" item>
                    <FormControlLabel
                        control={
                            <Checkbox
                                color="primary"
                                checked={this.props.checkedList.length === this.props.list.length}
                                onChange={this.props.toggleAllItems}
                            />
                        }
                        label={(<span className="filter_subtext">All</span>)}
                    />
                </Grid>
                {this.props.list?.length > 0 &&
                    this.props.list
                        .filter(item => !this.state.search || item.toLowerCase().includes(this.state.search.toLowerCase()))
                        .map(item => (
                            <Grid key={item} item>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={this.props.checkedList.includes(item)}
                                            onChange={() => this.props.toggleItem(item)}
                                        />
                                    }
                                    label={(<span className="filter_subtext">{item}</span>)}
                                />
                            </Grid>
                        )
                    )
                }
            </Grid>
        );
    }

    render() {
        return (
            <div className="filterWrapper">
                <span style={{
                    display: "flex",
                    alignItems: "center"
                }}>
                    {this.props.name}
                    <FilterListIcon
                        color={this.state.isOpen ? "action" : "primary"}
                        onClick={this.toggleFilter}
                        style={{cursor:"pointer"}}
                    />
                </span>
                {this.renderList()}
            </div>
        );
    }
}

export default Filter;
