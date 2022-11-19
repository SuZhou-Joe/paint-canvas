import { createContext } from "react";
import { Axios } from 'axios';

const RequestContext = createContext<{
    request: Axios["request"];
    requestWithSigned: Axios["request"]
}>({
    request: () => {},
    requestWithSigned: () => {}
} as any);

export default RequestContext;