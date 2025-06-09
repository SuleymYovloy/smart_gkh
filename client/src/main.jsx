import React from "react";
import ReactDOM from "react-dom/client";
import Keycloak from "keycloak-js";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import App from "./App";

const keycloak = new Keycloak({
    url: "http://localhost:9080",
    realm: "smart-hcs",
    clientId: "postman-client"
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <ReactKeycloakProvider authClient={keycloak}>
        <App />
    </ReactKeycloakProvider>
);
