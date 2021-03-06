import React from "react";
import { Button } from "@material-ui/core";

export default ({ style, onClick, className = "", ...more }) => {
    let onClickProp = onClick ? { onClick } : {};

    return (
        <Button
            type={onClick ? "button" : "submit"}
            color="primary"
            variant="contained"
            style={style}
            className={className}
            {...onClickProp}
            {...more}
        >
            Next
        </Button>
    );
};
