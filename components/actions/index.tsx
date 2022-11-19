import React, { useContext, useState } from "react";
import { Input, Button, Modal } from "antd";
import { EnterOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import RequestContext from "../../context/request-context";
import styles from "./index.module.css";

export default function Actions(props: {
  visible: boolean;
  onImageGenerated: (image: string) => void;
}) {
  const requestContext = useContext(RequestContext);
  const { loading, runAsync } = useRequest(
    (name) => 
      requestContext.requestWithSigned({
        url: "/api/image_generate?prompt=" + encodeURIComponent(name)
      }),
    {
      manual: true,
    }
  );
  const [prompt, setPrompt] = useState("");
  return props.visible ? (
    <div className={styles.inputContainer}>
      <Input.Group size="large" style={{ width: "50vw" }} compact>
        <Input
          size="large"
          style={{ width: "80%" }}
          placeholder="Type something to generate your masterpiece"
          disabled={loading}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button
          onClick={async () => {
            const result = await runAsync(prompt);
            props.onImageGenerated(
              `data:${result.data.response.mimeType};base64,${result.data.response.base64}`
            );
          }}
          loading={loading}
          disabled={loading}
          size="large"
          style={{ width: "20%" }}
        >
          Generate
          <EnterOutlined />
        </Button>
      </Input.Group>
    </div>
  ) : null;
}
