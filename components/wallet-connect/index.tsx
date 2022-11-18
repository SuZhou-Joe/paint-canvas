import SignClient from "@walletconnect/sign-client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";

const Home: NextPage = () => {
  const [client, setClient] = useState<SignClient | null>();

  const onSignIn = useCallback(() => {
    if (!client) return;
    client
      .connect({
        // pairingTopic: client.core.pairing.getPairings(),
        requiredNamespaces: {
          eip155: {
            methods: [
              "eth_sendTransaction",
              "eth_signTransaction",
              "eth_sign",
              "personal_sign",
              "eth_signTypedData",
            ],
            chains: ["eip155:1"],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      })
      .then(({ uri, approval }) => {
        if (uri) {
          QRCodeModal.open(uri, () => {
            console.log("EVENT", "QR Code Modal closed");
          });
        }
      });
  }, [client]);

  useEffect(() => {
    SignClient.init({
      projectId: 'e5b3bced58a255397401952751ab9e25',
      metadata: {
        name: "paint-me",
        description: "React Example Dapp for Auth",
        url: window.location.host,
        icons: [],
      },
    })
      .then((authClient) => {
        setClient(authClient);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!client) return;
    onSignIn();
    client.on("session_event", () => {
      // Handle session events, such as "chainChanged", "accountsChanged", etc.
    });
    
    client.on("session_update", ({ topic, params }) => {
      const { namespaces } = params;
      const _session = client.session.get(topic);
      // Overwrite the `namespaces` of the existing session with the incoming one.
      const updatedSession = { ..._session, namespaces };
      // Integrate the updated session state into your dapp state.
      console.log(updatedSession);
    });
    
    client.on("session_delete", () => {
      // Session was deleted -> reset the dapp state, clean up from user session, etc.
    });
  }, [client]);

  return null;
};

export default Home;