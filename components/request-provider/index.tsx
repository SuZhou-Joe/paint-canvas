import React, { useRef } from 'react';
import {
    useConnectModal,
  } from '@rainbow-me/rainbowkit';
import axios, { Axios, AxiosResponse } from 'axios';
import { useAccount } from 'wagmi';
import RequestContext from '../../context/request-context';

export default function RequestProvider(props: { children: React.ReactNode }) {
    const { address } = useAccount();
    const { openConnectModal } = useConnectModal();
    const requestWithSigned = useRef<Axios["request"]>((config) => {
        if (address) {
            return axios.request(config);
        } else {
            if (openConnectModal) {
                openConnectModal();
            }
            return Promise.reject({
                status: 401,
                statusText: 'Unauthorized',
                data: {},
            } as AxiosResponse<any, any>)
        }
    });
    return (
        <RequestContext.Provider value={{
            request: axios.request,
            requestWithSigned: requestWithSigned.current
        }}>
            {props.children}
        </RequestContext.Provider>
    );
}