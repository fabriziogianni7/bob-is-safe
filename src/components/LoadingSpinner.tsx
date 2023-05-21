import {Alert, Spin} from "antd";
import React from "react";

const LoadingSpinner = () => {
    return <Spin size="default" tip="Loading the Safe App" style={{ textAlign: 'center' }}>
        <Alert message="Loading" type="info" />
    </Spin>
}

export default LoadingSpinner;