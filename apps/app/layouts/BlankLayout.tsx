import { PropsWithChildren } from "react";
import { connect } from "react-redux";

export interface LayoutProps {
    loading?: boolean;
}

function BlankLayout(props: PropsWithChildren<LayoutProps>) {
    const { children } = props;

    return (
        <div className="relative w-full h-full">
            {children}
        </div>
    );
}

function mapStateToProps(state, props) {
    return {
        ...state,
        ...props
    }
}

export default connect(mapStateToProps)(BlankLayout);